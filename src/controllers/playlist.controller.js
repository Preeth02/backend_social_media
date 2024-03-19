import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!(name || description)) {
        throw new ApiError(404, "name or decription of the playlist not found")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    return res
        .status(201)
        .json(
            new ApiResponse(200, playlist, "Playlist created successfully")
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "It's not a valid Id")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
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
                            fullName: 1
                        }
                    }
                ]
            }
        },
    ])

    return res
        .status(201)
        .json(
            new ApiResponse(200, playlist, "Playlists fetched successfully")
        )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not available")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, playlist, "Playlist fetched successfully")
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!(isValidObjectId(playlistId) || isValidObjectId(videoId))) {
        throw new ApiError(400, "Invalid id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video is not available, can't add it to the playlist")
    }

    await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: { videos: video }
        },
        { new: true }
    )

    const playlistAggregate = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videoInfo",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            thumbnail: 1,
                            videoFile: 1,
                            owner: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                name: 1,
                descriptions: 1,
                createdAt: 1,
                videos: "$videoInfo"
            }
        }
    ])

    return res
        .status(201)
        .json(
            new ApiResponse(200, playlistAggregate, "Video successfully added to the playlist")
        )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!(isValidObjectId(playlistId) || isValidObjectId(videoId))) {
        throw new ApiError(404, "Invalid id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Following video is not available")
    }

    await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        }, { new: true }
    )

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videoInfo",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            thumbnail: 1,
                            videoFile: 1,
                            owner: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                videos: "$videoInfo"
            }
        }
    ])

    return res
        .status(201)
        .json(
            new ApiResponse(200, playlist, "Video successfully removed from the playlist")
        )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Not a valid id")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res
        .status(201)
        .json(
            new ApiResponse(200, {}, "Playlist has been deleted successfully")
        )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Not a valid id")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name,
                description: description
            }
        }, { new: true }
    )

    return res
        .status(201)
        .json(
            new ApiResponse(200, playlist, "Playlist updated successfully")
        )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}