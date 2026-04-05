import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/auth.js";
import {
  getCertificateTypes,
  applyForCertificate,
  getStudentApplications,
  getApplicationDetails,
  getNotifications,
  reuploadDocument,
} from "../controllers/studentController.js";
import upload from "../middlewares/upload.js";
const router = express.Router();
router.use(verifyToken);
router.use(authorizeRoles("Student"));
router.get("/certificates", getCertificateTypes);
router.post("/applications", upload.array("documents"), applyForCertificate);
router.get("/applications", getStudentApplications);
router.get("/applications/:id", getApplicationDetails);
router.get("/notifications", getNotifications);
router.put(
  "/applications/:applicationId/reupload-document/:docIndex",
  upload.single("document"),
  reuploadDocument,
);
export default router;
