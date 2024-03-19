import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    console.log(content)
    if (!content) {
        throw new ApiError(400, "Content is too small")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    }
    )

    return res
        .status(201)
        .json(
            new ApiResponse(200, tweet, "Tweet created successfully")
        )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { owner } = req.params

    if (!isValidObjectId(owner)) {
        throw new ApiError(404, "Invalid owner id")
    }

    console.log(owner)
    const tweet = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(owner)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                content: 1,
                owner: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ])

    return res
        .status(201)
        .json(
            new ApiResponse(200, tweet, "All the tweets of a user fetched successfully")
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "Invalid tweet id")
    }


    if (!content && content.length < 8) {
        throw new ApiError(400, "Content is too small to update")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: content
            }
        },
        { new: true }
    )

    if (!tweet) {
        throw new ApiError(400, "Following tweet is not available")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, tweet, "Tweet has been successfully updated")
        )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "Invalid tweet id")
    }


    const tweet = await Tweet.findByIdAndDelete(tweetId)

    return res
        .status(201)
        .json(
            new ApiResponse(200, {}, "Tweet deleted successfully")
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}