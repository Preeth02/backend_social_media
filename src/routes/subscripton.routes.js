import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";


const router = Router()

router.use(verifyJWT)

router.route("/:channelId").post(toggleSubscription)

router.route("/c/:channelId").get(getUserChannelSubscribers)
router.route("/get/c/:subscriberId").get(getSubscribedChannels)

export default router;