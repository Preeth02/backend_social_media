import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "Not a valid id")
    }

    const user = await User.findById(channelId)
    if (!user) {
        throw new ApiError(404, "Channel not found")
    }

    const subscriber = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id
    })

    let toggleSubscribe;
    if (!subscriber) {
        toggleSubscribe = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })

    }
    else {
        await Subscription.findOneAndDelete({
            subscriber: req.user._id
        })
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200,
                toggleSubscribe,
                toggleSubscribe !== undefined ? "Subscribed to the channel" : "Unsubscribed from the channel")
        )

})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const user = await User.findById(channelId)
    if (!user) {
        throw new ApiError(404, "Channel not found")
    }

    const subscription = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelInfo",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,

                        }
                    }]
            }
        },
        {
            $facet: {
                channelInfo: [
                    { $unwind: "$channelInfo" },         // Unwind to access each channel info document
                    { $replaceRoot: { newRoot: "$channelInfo" } } // Replace root to maintain original structure
                ],
                subscriberCount: [
                    { $group: { _id: null, count: { $sum: 1 } } }, // Count the number of documents
                    { $project: { _id: 0, count: 1 } }
                ]
            }
        },
        {
            $project: {
                channelInfo: { $first: "$channelInfo" },
                subscriberCount: { $first: "$subscriberCount.count" }
            }
        }
    ])

    return res
        .status(201)
        .json(
            new ApiResponse(200, subscription[0], "All the subscribers fetched successfully")
        )

})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Not a valid id")
    }

    const user = await User.findById(subscriberId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const subscription = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelInfo",
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

    ])

    return res
        .status(201)
        .json(
            new ApiResponse(200, subscription, "All subscribed channel fetched successfully")
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}