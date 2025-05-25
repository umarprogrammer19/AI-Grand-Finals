import express from "express";
import { registerUserOnCourse, renderCardByCNIC } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register-for-course", upload.single("image"), registerUserOnCourse);
router.post("/card", renderCardByCNIC);

export default router;