import CertificateType from "../models/CertificateType.js";
import Application from "../models/Application.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { getApplicationSubmittedTemplate, getDocumentReuploadedTemplate } from "../utils/emailTemplates.js";
export const getCertificateTypes = async (req, res) => {
  try {
    const types = await CertificateType.find();
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const applyForCertificate = async (req, res) => {
  try {
    const { certificateTypeId } = req.body;
    const certType = await CertificateType.findById(certificateTypeId);
    if (!certType)
      return res.status(404).json({ message: "Certificate type not found" });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const documents = req.files
      ? req.files.map((file) => {
          const isCloudinary = file.secure_url !== undefined;
          return {
            name: file.originalname,
            path: isCloudinary ? file.secure_url : file.path, 
            cloudinaryUrl: isCloudinary ? file.secure_url : null, 
          };
        })
      : [];
    const initialStatus = `Pending at ${certType.workflow[0]}`;
    const application = new Application({
      student: req.user.id,
      certificateType: certificateTypeId,
      documents,
      status: initialStatus,
      currentStep: 0,
      history: [
        {
          status: "Applied",
          updatedBy: req.user.id,
          comments: "Application submitted by student",
        },
      ],
    });
    const newApp = await application.save();
    await Notification.create({
      user: req.user.id,
      title: "Application Submitted",
      message: `Your application has been successfully submitted and is ${initialStatus}.`,
      type: "info",
      link: `/student/applications`,
    });
    await sendEmail({
      to: user.email,
      subject: "SmartCert: Application Submitted",
      text: `Hello ${user.name},\n\nYour application for ${certType.name} has been securely submitted. Current tracking status: ${initialStatus}.`,
      html: getApplicationSubmittedTemplate(user.name, certType.name, initialStatus),
    });
    res.status(201).json({
      message: "Application submitted successfully",
      application: newApp,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate("certificateType", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getApplicationDetails = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      student: req.user.id,
    })
      .populate("certificateType")
      .populate("history.updatedBy", "name role");
    if (!application)
      return res.status(404).json({ message: "Application not found" });
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const reuploadDocument = async (req, res) => {
  try {
    const { applicationId, docIndex } = req.params;
    const application = await Application.findOne({
      _id: applicationId,
      student: req.user.id,
    });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    if (!application.documents[docIndex]) {
      return res.status(400).json({ message: "Document not found" });
    }
    const doc = application.documents[docIndex];
    if (doc.status !== "Rejected") {
      return res
        .status(400)
        .json({ message: "Only rejected documents can be re-uploaded" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const isCloudinary = req.file.secure_url !== undefined;
    application.documents[docIndex] = {
      name: doc.name, 
      path: isCloudinary ? req.file.secure_url : req.file.path,
      cloudinaryUrl: isCloudinary ? req.file.secure_url : null,
      status: "Pending", 
      feedback: "", 
      verifiedBy: null,
      verifiedAt: null,
    };
    application.history.push({
      status: `Document re-uploaded: ${doc.name}`,
      updatedBy: req.user.id,
      comments: "Student re-uploaded a rejected document",
    });
    await application.save();
    const currentOfficer =
      application.certificateType.workflow[application.currentStep];
    const officerRole = currentOfficer;
    await Notification.create({
      user: doc.verifiedBy || null, 
      title: "Document Re-uploaded",
      message: `A document has been re-uploaded for application: ${application._id}`,
      type: "info",
      link: `/officer/applications/${application._id}`,
    });
    const user = await User.findById(req.user.id);
    await sendEmail({
      to: user.email,
      subject: "SmartCert: Document Re-uploaded Successfully",
      text: `Hello ${user.name},\n\nYour document "${doc.name}" has been re-uploaded successfully and is pending review. Your application status remains at: ${application.status}`,
      html: getDocumentReuploadedTemplate(user.name, doc.name, application.status),
    });
    res.status(200).json({
      message: "Document re-uploaded successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
