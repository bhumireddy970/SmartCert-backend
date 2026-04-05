import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CertificateType from './src/models/CertificateType.js';
dotenv.config();
const certTypes = [
  {
    name: 'NOC',
    description: 'No Objection Certificate required for various purposes.',
    requiredDocuments: ['Aadhar Card', 'College ID Card', 'Fee Receipt'],
    workflow: ['Finance', 'Library', 'Hostel', 'HOD', 'Exam', 'Director']
  },
  {
    name: 'Internship Certificate',
    description: 'Approval required to pursue external internships.',
    requiredDocuments: ['Offer Letter', 'Company Profile', 'Permission Letter'],
    workflow: ['HOD', 'Placement', 'Dean']
  },
  {
    name: 'Bonafide Certificate',
    description: 'A certificate confirming that the student is a bona fide student of the institution.',
    requiredDocuments: ['Aadhar Card', 'College ID Card'],
    workflow: ['HOD', 'Administrative Officer']
  }
];
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartcert')
  .then(async () => {
    console.log('Connected to MongoDB');
    await CertificateType.deleteMany({});
    await CertificateType.insertMany(certTypes);
    console.log('Certificate Types seeded successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to seed', err);
    process.exit(1);
  });
