import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, default: null }, 
    feeDues: { type: Number, default: 0 },
    libraryDues: { type: Number, default: 0 },
    hostelDues: { type: Number, default: 0 },
    studentId: { type: String, default: null },
    mobileNumber: { type: String, default: null },
    employeeId: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    rollNumber: { type: String, default: null },
  },
  { timestamps: true },
);
export default mongoose.model("User", userSchema);
