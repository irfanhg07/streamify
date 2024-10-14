import { response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";


const generateAccessAndRefreshToken =  async (userId) =>{

    try {
        const user = await User.findById(userId);
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
        user.refreshToken = refreshToken;
    
        await user.save({ ValidateBeforeSave : false })
    
        return { accessToken, refreshToken } 
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh token and access token")

        
    }
}


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

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;

    // Input Validation
    if ([fullName, username, email, password].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields are required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format.");
    }

    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long.");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists.");
    }

    // Handle file uploads
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required.");
    }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    let avatar, coverImage;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
    } catch (error) {
        throw new ApiError(500, "Error uploading images.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password: hashedPassword,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong on the server.");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully.")
    );
});


const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    
    // Validate email/username and password
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required.");
    }
    if (!password) {
        throw new ApiError(400, "Password is required.");
    }

    // Find user by username or email
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist.");
    }

    // Validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials.");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Update refresh token in the user record (optional, for security)
    user.refreshToken = refreshToken;
    await user.save();

    // Prepare user data without sensitive fields
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // Cookie options
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',  // Secure cookies in production
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000  // 24 hours
    };

    // Send response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken },
            "User logged in successfully."
        ));
});

// Logout user 
    // 1: we need to create our own middleware in order to access the loggedin user.In req and well as in res we can access the user.
    // 2.clear cookies
    // 3.clear refresh token.

const logoutUser = asyncHandler( async(req, _)=>{

    User.findByIdAndUpdate(req.user._id,
    {
        $set: {refreshToken: undefined}
    },

    {
        new: true
    }
)
const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // Secure cookies in production
    sameSite: 'Strict',
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
};

    return res.status(200)
    .clearCookie("accessToken", options).
    clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{}, "user logged out successfully"))
})


export { 
    registerUser, 
    loginUser, 
    logoutUser
     };
