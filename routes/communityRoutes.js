import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createCommunity,
    getCommunities,
    getCommunityById,
    joinCommunity,
    leaveCommunity,
    deleteCommunity,
} from "../controllers/communityController.js";

const router = express.Router();

router.route("/").post(protect, createCommunity).get(getCommunities);
router.route("/:id").get(getCommunityById).delete(protect, deleteCommunity);
router.route("/:id/join").post(protect, joinCommunity);
router.route("/:id/leave").post(protect, leaveCommunity);

export default router;
