import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();
const appSchema = new mongoose.Schema({}, { strict: false });
const AppModel = mongoose.model('Application', appSchema);
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const app = await AppModel.findOne().sort({ createdAt: -1 });
  console.log(JSON.stringify(app?.documents, null, 2));
  process.exit(0);
}
run();
