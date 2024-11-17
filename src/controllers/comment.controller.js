import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found for the given id..")
    }

    const comments = await Comment.aggregate([

        {
            $match: new mongoose.Types.ObjectId(videoId)
        }
    ])

    console.log(comments);
    


})

const addComment = asyncHandler(async (req, res) => {

    const {videoId} = req.params;

    const {content} = req.body;

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found for the given id..")
    }

    const comment = await Comment.create({

        content,

        video: videoId,

        owner: req.user?._id

    });

    if(!comment){
        throw new ApiError(500, "Failed to add comment please try again")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment created successfully.."))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }