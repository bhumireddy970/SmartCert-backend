import express from "express";
import { verifyToken, authorizeOfficers } from "../middlewares/auth.js";
import {
  getPendingApplications,
  getApplicationDetails,
  updateApplicationStatus,
  signApplication,
  verifyDocument,
} from "../controllers/officerController.js";
import upload from "../middlewares/upload.js";
const router = express.Router();
router.use(verifyToken);
router.use(authorizeOfficers);
router.get("/applications", getPendingApplications);
router.get("/applications/:id", getApplicationDetails);
router.put("/applications/:id/status", updateApplicationStatus);
router.put("/applications/:id/verify-document/:docId", verifyDocument);
router.post(
  "/applications/:id/sign",
  upload.single("signature"),
  signApplication,
);
export default router;
