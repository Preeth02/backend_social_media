import { Router } from "express";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyUser } from "../middlewares/isOwner.middleware.js";

const router = Router()

router.route("/publish-video").post(verifyJWT, upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]),
    publishAVideo
)
//Not added verifyJWT middleware as user can also get the video without being logged in
router.route("/get-video/:videoId").get(getVideoById)

router.route("/update-video/:videoId").patch(verifyJWT, verifyUser, upload.single("thumbnail"), updateVideo)
router.route("/delete-video/:videoId").post(verifyJWT, verifyUser, deleteVideo)
router.route("/toggle-video/:videoId").patch(verifyJWT, verifyUser, togglePublishStatus)

//Not added verifyJWT middleware as user can also get the video without being logged in
router.route("/get-all-videos").get(getAllVideos)

export default router;