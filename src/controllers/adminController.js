import User from "../models/User.js";
import Application from "../models/Application.js";
import CertificateType from "../models/CertificateType.js";
import bcrypt from "bcryptjs";
export const getStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "Student" });
    const totalOfficers = await User.countDocuments({
      role: { $ne: "Student" },
    });
    const totalApplications = await Application.countDocuments();
    const completedApplications = await Application.countDocuments({
      status: { $regex: "Completed|Ready for Collection", $options: "i" },
    });
    const rejectedApplications = await Application.countDocuments({
      status: { $regex: "Rejected", $options: "i" },
    });
    const pendingApplications =
      totalApplications - completedApplications - rejectedApplications;
    res.status(200).json({
      students: totalStudents,
      officers: totalOfficers,
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        completed: completedApplications,
        rejected: rejectedApplications,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getAnalytics = async (req, res) => {
  try {
    const totalRequests = await Application.countDocuments();
    const certDemandRaw = await Application.aggregate([
      {
        $lookup: {
          from: "certificatetypes",
          localField: "certificateType",
          foreignField: "_id",
          as: "certType",
        },
      },
      { $unwind: "$certType" },
      { $group: { _id: "$certType.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    let certDemand = certDemandRaw.map((d) => ({
      name: d._id,
      value: d.count,
    }));
    if (certDemand.length === 0) certDemand = [{ name: "No Data", value: 1 }];
    const tempWorkload = await Application.aggregate([
      { $match: { status: { $regex: "^Pending at ", $options: "i" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const departmentWorkload = tempWorkload.map((w) => ({
      name: w._id.replace("Pending at ", ""),
      pending: w.count,
    }));
    const completedApps = await Application.aggregate([
      {
        $match: {
          status: { $regex: "Completed|Ready for Collection", $options: "i" },
        },
      },
      { $project: { durationMs: { $subtract: ["$updatedAt", "$createdAt"] } } },
      { $group: { _id: null, avgDurationMs: { $avg: "$durationMs" } } },
    ]);
    const avgDays =
      completedApps.length > 0
        ? (completedApps[0].avgDurationMs / (1000 * 60 * 60 * 24)).toFixed(1)
        : "0.0";
    res.status(200).json({
      totalRequests,
      certDemand,
      departmentWorkload,
      averageApprovalDays: avgDays,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      rollNumber,
      studentId,
      mobileNumber,
      employeeId,
      phoneNumber,
    } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "User explicitly exists already" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      rollNumber,
      studentId: role === "Student" ? studentId : null,
      mobileNumber: role === "Student" ? mobileNumber : null,
      employeeId: role !== "Student" ? employeeId : null,
      phoneNumber: role !== "Student" ? phoneNumber : null,
    });
    res
      .status(201)
      .json({
        message: "User created securely",
        user: { id: user._id, name, email, role },
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own active Admin identity." });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User securely purged" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getCertificateTypes = async (req, res) => {
  try {
    const types = await CertificateType.find();
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const createCertificateType = async (req, res) => {
  try {
    const { name, description, requiredDocuments, workflow } = req.body;
    const cert = await CertificateType.create({
      name,
      description,
      requiredDocuments,
      workflow,
    });
    res
      .status(201)
      .json({ message: "Certificate Workflow constructed securely", cert });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const updateCertificateType = async (req, res) => {
  try {
    const { name, description, requiredDocuments, workflow } = req.body;
    const cert = await CertificateType.findByIdAndUpdate(
      req.params.id,
      { name, description, requiredDocuments, workflow },
      { new: true },
    );
    res
      .status(200)
      .json({ message: "Certificate Workflow altered successfully", cert });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const deleteCertificateType = async (req, res) => {
  try {
    await CertificateType.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Certificate Workflow dismantled" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (req.user.id === req.params.id) {
      return res
        .status(400)
        .json({
          message: "Cannot demote or change your own active Admin identity.",
        });
    }
    const validRoles = ["Student", "Officer", "HOD", "Admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role assignment" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "User role updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
