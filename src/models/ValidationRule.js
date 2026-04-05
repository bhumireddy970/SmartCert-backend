import mongoose from 'mongoose';
const validationRuleSchema = new mongoose.Schema({
  role: { type: String, required: true }, 
  metricField: { type: String, required: true }, 
  blockingOperator: { type: String, enum: ['>', '<', '>=', '<=', '==', '!='], required: true }, 
  blockingValue: { type: Number, required: true }, 
  errorMessage: { type: String, required: true } 
}, { timestamps: true });
export default mongoose.model('ValidationRule', validationRuleSchema);
