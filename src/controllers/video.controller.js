import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, owner } = req.query


    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
    }
    let myAggregrate = Video.aggregate()


    if (sortBy && sortType) {
        myAggregrate.sort({ [sortBy]: sortType === "asc" ? 1 : -1 })
        // console.log(myAggregrate.sort({ [sortBy]: sortType === "asc" ? 1 : -1 }))
    }

    const filter = {}
    if (owner) {
        filter.owner = new mongoose.Types.ObjectId(owner)
        // console.log(filter.ownerId = ownerId)
    }

    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
        ]
        // console.log(filter.$or = [
        //     { title: { $regex: query, $options: "i" } },
        //     { description: { $regex: query, $options: "i" } },
        // ])
    }

    //matching based on query and also if the video isPublished is true

    let clg = await myAggregrate.match({
        $and: [filter, {
            isPublished: true
        }]
    })

    // console.log(clg)

    const result = await Video.aggregatePaginate(myAggregrate, options)

    if (!result) {
        throw new ApiError(404, "Unable to fetch the user videos")
    }

    // console.log(myAggregrate)
    return res
        .status(200)
        .json(
            new ApiResponse(200, { result }, "All user's video fetched successsfully")
        )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if (!(title || description)) {
        throw new ApiError(401, "Title or description must not be empty")
    }

    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(401, "User not found")
    }

    const localVideoPath = req.files?.videoFile[0]?.path;
    const localThumbnailPath = req.files?.thumbnail[0]?.path;

    if (!(localVideoPath && localThumbnailPath)) {
        throw new ApiError(400, "Video file and thumbnail file is required")
    }

    const videoFile = await uploadOnCloudinary(localVideoPath)

    if (!videoFile) {
        throw new ApiError(400, "Error while uploading video file")
    }

    const thumbnail = await uploadOnCloudinary(localThumbnailPath)

    if (!thumbnail) {
        throw new ApiError(400, "Error while uploading thumbnail file")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        // views,
        owner: req.user?._id,
        // isPublished
    })

    const createdVideo = await Video.findById(video?._id)
    if (!createdVideo) {
        throw new ApiError(400, "There was an error while uploading the video")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdVideo, "Video uploaded successfully")
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // console.log(req.params)
    // console.log(req.params.videoId)
    // console.log(videoId)

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video-Url is not available")
    }
    // console.log(video)
    if (video.isPublished == false) {
        throw new ApiError(404, "Video is not available")
    }

    // Views will increase if anybody see the video
    video.views += 1
    await video.save({ validateBeforesave: false })

    return res
        .status(201)
        .json(
            new ApiResponse(200,
                video.videoFile,
                "Video fetched successfully"
            )
        )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    const localThumbnailPath = req.file?.path

    if (!localThumbnailPath) {
        throw new ApiError(400, "Thumbnail file is required")
    }

    const thumbnail = await uploadOnCloudinary(localThumbnailPath)

    if (!thumbnail) {
        throw new ApiError(400, "Error while uploading thumbnail")
    }

    const cloudId = await req.video.thumbnail.split("/").pop().split(".")[0]
    await cloudinary.uploader
        .destroy(cloudId)
        .then(result => console.log(result))

    // console.log(cloudId)
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title,
                description: description,
                thumbnail: thumbnail.url
            }
        }, { new: true }
    )
    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video update successfull")
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const videoFile = req.video.videoFile.split("/").pop().split(".")[0]
    const thumbnail = req.video.thumbnail.split("/").pop().split(".")[0]

    console.log(req.video.videoFile)

    await cloudinary.uploader
        .destroy(videoFile, { resource_type: "video" })
        .then(result => console.log(result))

    await cloudinary.uploader
        .destroy(thumbnail)
        .then(result => console.log(result))

    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Video deleted successfully")
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    let video;
    if (req.video.isPublished == true) {
        video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    isPublished: false
                }
            },
            { new: true }
        )
    }
    else {
        video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    isPublished: true
                }
            },
            { new: true }
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200,
                video.isPublished,
                video.isPublished == true ? "Video has been made public successfully" : "Video has been made private successfully")
        )
})

export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos
}
