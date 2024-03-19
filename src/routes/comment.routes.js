import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { verifyCommentOwner } from "../middlewares/isCommentOwner.middleware.js"
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router()

// router.use(verifyJWT)

router.route("/add-comment/:videoId").post(verifyJWT, addComment)
router.route("/update-comment/:commentId").patch(verifyJWT, verifyCommentOwner, updateComment)
router.route("/delete-comment/:commentId").post(verifyJWT, verifyCommentOwner, deleteComment)

// Not added verifyJWT since all can access to all comments
router.route("/comments/:videoId").get(getVideoComments)

export default router;