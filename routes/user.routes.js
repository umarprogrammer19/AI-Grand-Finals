import express from "express";
import { registerUserOnCourse } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register-for-course", registerUserOnCourse);

export default router;