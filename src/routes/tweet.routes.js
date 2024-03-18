import { Router } from "express";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyTweetOwner } from "../middlewares/isTweetOwner.middleware.js";


const router = Router()

router.route("/create-tweet").post(verifyJWT, createTweet)
router.route("/get-tweets/:owner").get(getUserTweets)
router.route("/update-tweet/:tweetId").patch(verifyJWT, verifyTweetOwner, updateTweet)
router.route("/delete-tweet/:tweetId").post(verifyJWT, verifyTweetOwner, deleteTweet)

export default router;