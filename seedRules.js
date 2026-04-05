import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ValidationRule from './src/models/ValidationRule.js';
import User from './src/models/User.js';
dotenv.config();
const rules = [
  {
    role: 'Finance',
    metricField: 'feeDues',
    blockingOperator: '>',
    blockingValue: 0,
    errorMessage: 'Student has pending fee dues. Cannot approve.'
  },
  {
    role: 'Library',
    metricField: 'libraryDues',
    blockingOperator: '>',
    blockingValue: 0,
    errorMessage: 'Student has pending library fines or unreturned books. Cannot approve.'
  },
  {
    role: 'Hostel',
    metricField: 'hostelDues',
    blockingOperator: '>',
    blockingValue: 0,
    errorMessage: 'Student has pending hostel settlement. Cannot approve.'
  }
];
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartcert')
  .then(async () => {
    console.log('Connected to MongoDB');
    await ValidationRule.deleteMany({});
    await ValidationRule.insertMany(rules);
    console.log('Validation Rules seeded successfully!');
    const student = await User.findOne({ role: 'Student' });
    if (student) {
        student.feeDues = 5000;
        student.libraryDues = 100;
        student.hostelDues = 0;
        await student.save();
        console.log(`Mocked dues for student ${student.email}`);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to seed rules', err);
    process.exit(1);
  });
