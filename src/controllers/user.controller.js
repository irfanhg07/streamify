import { response } from "express"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req, res) => {

    // Steps required to register user.
    // 1.get userDetails from frontend
    // 2.Validation not empty
    // 3.check if user is already exists: username , email
    // 4.check for images , check for avatar
    // 5.upload them to cloudinary, avatar
    // 6.create user object -create entry in db
    // 7.remove password and refreshtoken from response
    // 8.check for user creation 
    // 9.return response

    const {fullName , username, email, password} = req.body
    console.log("email: ", email);

    if([fullName, username, email, password].some((field)=>
    field?.trim() === "")){
        throw new ApiError(400, "All fields are required..")
    }
    
    const existingUser =  await User.findOne({
        $or: [{ username },{ email }]
    })

    if(existingUser){
        throw new ApiError(409, "User with email or username already exists ")
    }

    // Get filelocalpath from  multer
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath);
    

    const coverImageLocalPath = req.files?.coverImage[0].path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required..")
    }

    const avatar =  await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar is required..")
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

    if(!createdUser){
        throw new ApiError(500, "Something went wrong from server..")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully..")
    )



})

export {registerUser}