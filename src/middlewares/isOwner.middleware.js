import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyUser = asyncHandler(async (req, res, next) => {
    try {
        const { videoId } = req.params

        const video = await Video.findById(videoId)

        if (!video) {
            throw new ApiError(404, "Video not available")
        }

        req.video = video
        // console.log(req.video)

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
        // console.log(video.owner.toString())
        if (!(req.user._id.toString() == video.owner.toString())) {
            throw new ApiError(403, "Unauthorized request, cannot access the option")
        }
        next()
    } catch (error) {
        throw new ApiError(400, error?.message || "Something went wrong")
    }


})