import Application from "../models/Application.js";
import Notification from "../models/Notification.js";
import ValidationRule from "../models/ValidationRule.js";
import QRCode from "qrcode";
import sendEmail from "../utils/sendEmail.js";
import { getGeneralUpdateTemplate, getActionRequiredTemplate } from "../utils/emailTemplates.js";
export const getPendingApplications = async (req, res) => {
  try {
    const statusQuery = `Pending at ${req.user.role}`;
    let query;
    if (req.user.role === "Admin") {
      query = { status: { $nin: ["Completed", "Rejected"] } };
    } else {
      query = { status: { $in: [statusQuery, "Information Requested"] } };
    }
    const applications = await Application.find(query)
      .populate("student", "name email department studentId")
      .populate("certificateType", "name workflow")
      .sort({ createdAt: -1 });
    let filteredApplications = applications.filter((app) => {
      if (app.status === "Information Requested") {
        const currentOfficerActive = app.certificateType.workflow[app.currentStep] === req.user.role;
        if (!currentOfficerActive) return false;
      }
      if (req.user.role === "HOD" && req.user.department) {
        if (!app.student || app.student.department !== req.user.department) {
          return false;
        }
      }
      return true;
    });
    res.status(200).json(filteredApplications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getApplicationDetails = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("student", "name email feeDues libraryDues hostelDues")
      .populate("certificateType")
      .populate("history.updatedBy", "name role");
    if (!application)
      return res.status(404).json({ message: "Application not found" });
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const updateApplicationStatus = async (req, res) => {
  try {
    const { action, comments, appointmentDate, appointmentLocation } = req.body;
    const application = await Application.findById(req.params.id)
      .populate("certificateType")
      .populate("student");
    if (!application)
      return res.status(404).json({ message: "Application not found" });
    let newStatus = application.status;
    let notifyMsg = "";
    if (action === "approve") {
      const pendingOrRejectedDocs = application.documents.filter(
        (doc) => doc.status !== "Verified",
      );
      if (pendingOrRejectedDocs.length > 0) {
        return res
          .status(400)
          .json({
            message: `Cannot approve application. ${pendingOrRejectedDocs.length} document(s) have not been explicitly marked Verified.`,
          });
      }
      const rules = await ValidationRule.find({ role: req.user.role });
      for (const rule of rules) {
        const studentMetric = application.student[rule.metricField];
        let isBlocked = false;
        switch (rule.blockingOperator) {
          case ">":
            isBlocked = studentMetric > rule.blockingValue;
            break;
          case "<":
            isBlocked = studentMetric < rule.blockingValue;
            break;
          case ">=":
            isBlocked = studentMetric >= rule.blockingValue;
            break;
          case "<=":
            isBlocked = studentMetric <= rule.blockingValue;
            break;
          case "==":
            isBlocked = studentMetric == rule.blockingValue;
            break;
          case "!=":
            isBlocked = studentMetric != rule.blockingValue;
            break;
        }
        if (isBlocked) {
          return res.status(400).json({ message: rule.errorMessage });
        }
      }
      const template = application.certificateType.workflow;
      let nextStep = application.currentStep + 1;
      if (nextStep >= template.length) {
        if (!appointmentLocation || !appointmentDate) {
          return res
            .status(400)
            .json({
              message:
                "Appointment Date and Location are strongly required for Final Approval.",
            });
        }
        const qrPayload = JSON.stringify({
          appId: application._id,
          studentId: application.student._id,
        });
        const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);
        application.appointmentDetails = {
          date: new Date(appointmentDate),
          location: appointmentLocation,
          qrCodeUrl: qrCodeDataUrl,
        };
        newStatus = "Ready for Collection";
        notifyMsg =
          "Your certificate is ready! An appointment has been scheduled for collection.";
      } else {
        newStatus = `Pending at ${template[nextStep]}`;
        application.currentStep = nextStep;
        notifyMsg = `Your application has moved to the next stage: ${newStatus}`;
      }
    } else if (action === "reject") {
      newStatus = "Rejected";
      notifyMsg = `Your application was Rejected. ${comments ? "Reason: " + comments : ""}`;
    } else if (action === "request_info") {
      newStatus = "Information Requested";
      notifyMsg = `Additional Information Requested: ${comments}`;
    } else if (action === "schedule") {
      newStatus = "Appointment Scheduled";
      application.appointmentDate = new Date(appointmentDate);
      notifyMsg = `An appointment has been scheduled for your application.`;
    }
    application.status = newStatus;
    application.history.push({
      status: newStatus,
      updatedBy: req.user.id,
      comments: comments || "",
    });
    await application.save();
    await application.save();
    const titleMap = {
      approve:
        newStatus === "Ready for Collection"
          ? "Appointment Scheduled"
          : "Application Forwarded",
      reject: "Application Rejected",
      request_info: "Information Requested",
      schedule: "Appointment Scheduled",
    };
    await Notification.create({
      user: application.student._id,
      title: titleMap[action] || "Application Update",
      message: notifyMsg,
      type:
        action === "reject"
          ? "error"
          : action === "approve" && newStatus === "Ready for Collection"
            ? "success"
            : "info",
      link: `/student/applications/${application._id}`,
    });
    await sendEmail({
      to: application.student.email,
      subject: `SmartCert Update: ${newStatus}`,
      text: `Hello ${application.student.name},\n\nThere is an update on your SmartCert application.\nUpdate: ${notifyMsg}\nStatus: ${newStatus}\n\nPlease check your portal for more details.`,
      html: getGeneralUpdateTemplate(application.student.name, notifyMsg, newStatus),
    });
    res.status(200).json({ message: "Success", application });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const signApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application)
      return res.status(404).json({ message: "Application not found" });
    if (!req.file)
      return res.status(400).json({ message: "Signature file is required" });
    application.signatures.push({
      role: req.user.role,
      signatureUrl: req.file.path,
    });
    await application.save();
    res
      .status(200)
      .json({ message: "Signature added successfully", application });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const verifyDocument = async (req, res) => {
  try {
    const { action, feedback } = req.body;
    const application = await Application.findById(req.params.id).populate(
      "student",
    );
    if (!application)
      return res.status(404).json({ message: "Application not found" });
    const document = application.documents.id(req.params.docId);
    if (!document)
      return res.status(404).json({ message: "Document not found" });
    if (action === "verify") {
      document.status = "Verified";
      document.feedback = "";
    } else if (action === "reject") {
      document.status = "Rejected";
      document.feedback = feedback || "Document rejected by officer.";
      application.status = "Information Requested";
      await Notification.create({
        user: application.student._id,
        title: "Document Rejected",
        message: `Your document '${document.name}' was rejected. Feedback: ${document.feedback}`,
        type: "error",
        link: `/student/applications/${application._id}`,
      });
      await sendEmail({
        to: application.student.email,
        subject: "SmartCert Action Required: Document Rejected",
        text: `Hello ${application.student.name},\n\nYour uploaded document '${document.name}' requires attention.\nFeedback: ${document.feedback}\n\nPlease log in to review your application.`,
        html: getActionRequiredTemplate(application.student.name, document.name, document.feedback),
      });
    }
    document.verifiedBy = req.user.id;
    document.verifiedAt = new Date();
    application.history.push({
      status:
        action === "verify"
          ? `Document Verified: ${document.name}`
          : `Document Rejected: ${document.name}`,
      updatedBy: req.user.id,
      comments: feedback || "",
    });
    await application.save();
    res
      .status(200)
      .json({
        message: `Document ${action === "verify" ? "verified" : "rejected"}`,
        application,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
