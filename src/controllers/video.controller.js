import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteOnCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;

  // Convert query parameters to appropriate data types
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const sortOrder = sortType === "asc" ? 1 : -1;

  try {
    // Build the aggregation pipeline
    const pipeline = [
      {
        $match: {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ],
          ...(userId && { owner: userId }), // Filter by owner if userId is provided
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      {
        $unwind: "$createdBy",
      },
      {
        $project: {
          thumbnail: 1,
          videoFile: 1,
          title: 1,
          description: 1,
          createdBy: {
            fullName: 1,
            username: 1,
            avatar: 1,
          },
        },
      },
      {
        $sort: {
          [sortBy]: sortOrder,
        },
      },
      {
        $skip: (pageNum - 1) * limitNum,
      },
      {
        $limit: limitNum,
      },
    ];

    // Execute the aggregation pipeline
    const videos = await Video.aggregate(pipeline);

    // Send the response
    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Fetched all videos successfully."));
  } catch (error) {
    // Handle errors
    return res.status(500).json(new ApiResponse(500, null, "An error occurred while fetching videos."));
  }
});


// get video, upload to cloudinary, create video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    
    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const videoFileLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "videoFileLocalPath is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnailLocalPath is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);


    if (!videoFile) {
        throw new ApiError(400, "Video file not found");
    }

    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail not found");
    }

    console.log("Uploaded video file:", videoFile);


    const video = await Video.create({
        title,
        description,
        duration: videoFile?.duration || 0, 
        videoFile: {
            url: videoFile.url,
            public_id: videoFile.public_id
        },
        thumbnail: {
            url: thumbnail.url,
            public_id: thumbnail.public_id
        },
        owner: req.user?._id,
        isPublished: false
    });

    const videoUploaded = await Video.findById(video._id);

    if (!videoUploaded) {
        throw new ApiError(500, "videoUpload failed please try again !!!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Vidoe Id")
    }

    const  video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found..")
    }

    res.status(200)
        .json(new ApiResponse(200, video, "Video retrieved successfully."))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const newThumbnailLocalPath = req.file?.path;
  
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid Video ID");
    }
  
    // Fetch the video
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
  
    // Check ownership
    if (video.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not allowed to update this video");
    }
  
    // Prepare updates
    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
  
    // Handle thumbnail update
    if (newThumbnailLocalPath) {
      const deleteThumbnailResponse = await deleteFromCloudinary(video.thumbnail);
      if (deleteThumbnailResponse.result !== "ok") {
        throw new ApiError(
          500,
          "Error while deleting old thumbnail from cloudinary"
        );
      }
  
      const newThumbnail = await uploadOnCloudinary(newThumbnailLocalPath);
      if (!newThumbnail.url) {
        throw new ApiError(500, "Error while uploading new thumbnail");
      }
      updates.thumbnail = newThumbnail.url;
    }
  
    // Update the video
    const updatedVideo = await Video.findByIdAndUpdate(videoId, { $set: updates }, { new: true });
  
    return res
      .status(200)
      .json(new ApiResponse(200, updatedVideo, "Video details updated"));
  });
  

const deleteVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
      }
    
      // Fetch the video
      const video = await Video.findById(videoId);
      if (!video) {
        throw new ApiError(404, "Video not found");
      }
    
      // Check ownership
      if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this video");
      }

      const cloudinaryDeleteVideoResponse = await deleteOnCloudinary(video.videoFile);

      if(cloudinaryDeleteVideoResponse !== "ok"){
        throw new ApiError(500, "Unable to delete video file from cloudinary..")
      }

      const cloudinaryDeleteThumbnailResponse = await deleteOnCloudinary(video.thumbnail);

      if(cloudinaryDeleteThumbnailResponse !== "ok"){
        throw new ApiError(500, "Unable to delete thumbnail file from cloudinary..")
      }

      const deleteVideo = await Video.findByIdAndDelete(videoId);

      if(!deleteVideo){
        throw new ApiError(500, "Unable to delete video file from database...");
      }

      res.status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully."))


})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
      throw new ApiError(400, "Invalid Video Id")
    }

    const video =  await Video.findById(videoId)

    if(!video){
      throw new ApiError(404, "Video not found.")
    }

    if(video.owner !== req.user?._id){
      throw new ApiError(404, "You are unauthorised to update the status..")
    }

    const modifyVideoStatus = await findByIdAndUpdate(
      videoId,
      {
        $set: {
          isPublished : !video.isPublished
        }
      },    
      {
        new : true
      }
    )

    res.status(200)
      .json(new ApiResponse( 200, modifyVideoStatus, "Status updated successfully.."));


})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}