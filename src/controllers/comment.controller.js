import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    let comment = Comment.aggregate()


    await comment.match({
        video: new mongoose.Types.ObjectId(videoId)
    })

    const commentAggregate = await Comment.aggregatePaginate(comment, options)

    return res
        .status(201)
        .json(
            new ApiResponse(200, commentAggregate, "Aggregated successfully")
        )

})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "It's not a valid video Id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not available")
    }

    const comment = await Comment.create({
        content,
        owner: req.user._id,
        video: videoId
    })

    return res
        .status(201)
        .json(
            new ApiResponse(200, comment, "Comment added successfully")
        )

})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "It's not a valid id")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content
            }
        }
    )

    return res
        .status(201)
        .json(
            new ApiResponse(200, comment, "Comment updated successfully")
        )
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(404, "It's not a valid comment id")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
        .status(201)
        .json(
            new ApiResponse(200, {}, "Comment has been deleted successfully")
        )

})

export {
    addComment,
    updateComment,
    deleteComment,
    getVideoComments
}