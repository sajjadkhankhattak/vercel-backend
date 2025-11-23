import express from "express";
import { getAllUsers, updateUser, deleteUser } from "../controller/quiz_app.js";

const router = express.Router();

// Get all users
router.get("/", getAllUsers);

// Update user
router.put("/:userId", updateUser);

// Delete user
router.delete("/:userId", deleteUser);

export default router;
