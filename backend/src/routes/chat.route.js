import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { generateResponse, getHistory, getStreamToken } from "../controllers/chat.controller.js";

const router=express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/ai", protectRoute, generateResponse);
router.get("/ai/history/:id/:language", protectRoute, getHistory);

export default router;