import { User } from "../models/user.models.js";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyCommentOwner = asyncHandler(async (req, res, next) => {
    try {
        const { commentId } = req.params

        const comment = await Comment.findById(commentId)

        if (!comment) {
            throw new ApiError(404, "comment not available")
        }

        req.comment = comment
        // console.log(req.comment)

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user

        // console.log(req.user._id.toString())
        // console.log(comment.owner.toString())
        if (!(req.user._id.toString() == comment.owner.toString())) {
            throw new ApiError(403, "Unauthorized request, cannot access the option")
        }
        next()
    } catch (error) {
        throw new ApiError(400, error?.message || "Something went wrong")
    }


})