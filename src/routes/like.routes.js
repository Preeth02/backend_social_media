import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router()

router.use(verifyJWT)

router.route("/c/:videoId").post(toggleVideoLike)
router.route("/co/:commentId").post(toggleCommentLike)
router.route("/t/:tweetId").post(toggleTweetLike)

router.route("/likedVideos").get(getLikedVideos)
export default router;
