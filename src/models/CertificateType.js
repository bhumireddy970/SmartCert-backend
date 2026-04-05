import mongoose from 'mongoose';
const certificateTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  requiredDocuments: [{ type: String }],
  workflow: [{ type: String, required: true }]
}, { timestamps: true });
export default mongoose.model('CertificateType', certificateTypeSchema);
