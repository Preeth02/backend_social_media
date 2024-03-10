import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body
    // console.log(fullName, email, username, password)
    // console.log("REQ.BODY:", req.body)

    // *************** Checking if the field is empty or not ******************
    // if (fullName === "") {
    //     throw new ApiError(400,"All the fields are required")
    // }              ************ But here's the best way to check ************                 

    if ([fullName, email, password, username].some(fields => fields?.trim() === "")) {
        throw new ApiError(400, "All the fields are required")
    }

    const userexisted = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (userexisted) {
        throw new ApiError(409, "User with email or username already existed.")
    }
    // console.log("req.files: ", req.files)
    const localAvatarPath = req.files?.avatar[0]?.path;
    // const localCoverImagePath = req.files?.coverImage[0]?.path;
    let localcoverImagePath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        localcoverImagePath = req.files.coverImage[0].path
    }

    if (!localAvatarPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(localAvatarPath)
    const coverImage = await uploadOnCloudinary(localcoverImagePath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required.")
    }

    const user = await User.create({

        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export { registerUser }