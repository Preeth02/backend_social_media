import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "It's not a valid video id")
    }

    const video = await Video.findById(videoId)
    if (!video || video.isPublished === false) {
        throw new ApiError(404, "Video not available")
    }

    const like = await Like.findOne({
        likedBy: req.user._id,
        video: videoId
    })

    let toggleLike;

    if (like) {
        await Like.findOneAndDelete(like)

        return res
            .status(201)
            .json(
                new ApiResponse(200, {}, "Disliked the video")
            )
    }
    else {
        toggleLike = await Like.create({
            likedBy: req.user._id,
            video: videoId
        })

        return res
            .status(201)
            .json(
                new ApiResponse(200, toggleLike, "Liked the video")
            )

    }



})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "It's not a valid id")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "tweet  not found")
    }

    const like = await Like.findOne({
        likedBy: req.user._id,
        tweet: tweetId
    })

    let toggleTweet;

    if (like) {
        await Like.findOneAndDelete(like)

        return res
            .status(201)
            .json(
                new ApiResponse(200, {}, "Disliked the tweet")
            )
    }
    else {
        toggleTweet = await Like.create({
            likedBy: req.user._id,
            tweet: tweetId
        })

        return res
            .status(201)
            .json(
                new ApiResponse(200, toggleTweet, "Liked the tweet")
            )
    }


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "It's not a valid id")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment  not found")
    }

    const like = await Like.findOne({
        likedBy: req.user._id,
        comment: commentId
    })

    let toggleComment;

    if (like) {
        await Like.findOneAndDelete(like)

        return res
            .status(201)
            .json(
                new ApiResponse(200, {}, "Disliked the comment")
            )
    }
    else {
        toggleComment = await Like.create({
            likedBy: req.user._id,
            comment: commentId
        })

        return res
            .status(201)
            .json(
                new ApiResponse(200, toggleComment, "Liked the comment")
            )
    }


})

const getLikedVideos = asyncHandler(async (req, res) => {

    const like = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoInfo",
                pipeline: [
                    {
                        $project: {
                            thumbnail: 1,
                            videoFile: 1,
                            title: 1,
                            description: 1,
                            owner: 1,
                        }
                    }, {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerInfo",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }, {
            $match: {
                //***** Both the methods work . where $ne: notempty*****
                // $expr: {
                //     $ne: [{ $size: "$videoInfo" }, 0]
                // }
                "videoInfo": { $ne: [] }
            }
        },
        {
            $project: {
                likedBy: 1,
                video: "$videoInfo"
            }
        }
    ])

    return res
        .status(201)
        .json(
            new ApiResponse(200, like, "All liked videos fetched successfully")
        )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}