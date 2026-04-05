import mongoose from "mongoose";
const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    certificateType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CertificateType",
      required: true,
    },
    documents: [
      {
        name: { type: String, required: true },
        path: { type: String }, 
        cloudinaryUrl: { type: String }, 
        status: {
          type: String,
          enum: ["Pending", "Verified", "Rejected"],
          default: "Pending",
        },
        feedback: { type: String },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        verifiedAt: { type: Date },
      },
    ],
    status: {
      type: String,
      default: "Pending",
    },
    currentStep: {
      type: Number,
      default: 0,
    },
    history: [
      {
        status: { type: String, required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comments: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    signatures: [
      {
        role: { type: String },
        signatureUrl: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
    appointmentDetails: {
      date: { type: Date },
      location: { type: String },
      qrCodeUrl: { type: String },
    },
    certificateUrl: { type: String },
  },
  { timestamps: true },
);
export default mongoose.model("Application", applicationSchema);
