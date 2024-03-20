import mongoose from "mongoose";
import { Video } from "../models/video.models.js"
import { Like } from "../models/like.models.js"
import { Subscription } from "../models/subscription.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const video = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $group: {
                _id: "$owner",
                totalVideos: {
                    $sum: 1
                },
                totalViews: {
                    $sum: "$views"
                }
            }
        },
        {
            $project: {
                _id: 1,
                totalViews: 1,
                totalVideos: 1
            }
        }
    ])

    const like = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoInfo",
            }
        },
        {
            $match: {
                "videoInfo.owner": new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $group: {
                _id: null,
                likes: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                _id: 0,
                likes: 1
            }
        }
    ])

    const subscription = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $group: {
                _id: "$channel",
                Totalsubscribers: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                Totalsubscribers: 1
            }
        }
    ])

    return res
        .status(201)
        .json(
            new ApiResponse(200, [video[0], like[0], subscription[0]], "All the channel info")
        )

})

const getChannelVideos = asyncHandler(async (req, res) => {
    const video = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerInfo",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$ownerInfo"
                }
            }
        },
        {
            $project: {
                thumbnail: 1,
                videoFile: 1,
                title: 1,
                description: 1,
                owner: 1
            }
        }
    ])

    if (!video) {
        throw new ApiError(400, "Something went wrong whil fetching all the channel videos")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, video, "All the videos of the channel fetched successfully")
        )

})

export {
    getChannelVideos,
    getChannelStats
}