import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 5 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
        throw new ApiError(400, "Invalid pagination parameters. Page and limit must be positive integers.");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId format.");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found for the given Id.");
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "createdBy",
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
                createdBy: { $first: "$createdBy" }
            }
        },
        {
            $project: {
                content: 1,
                createdBy: 1
            }
        },
        {
            $sort: { created_at: -1 } 
        },
        {
            $skip: (pageNum - 1) * limitNum 
        },
        {
            $limit: limitNum 
        }
    ]);

    const totalComments = await Comment.countDocuments({ video: videoId });

    if (comments.length === 0) {
        return res.status(200).json(new ApiResponse(200, { comments: [], totalComments: 0 }, "No comments found."));
    }

    res.status(200).json(new ApiResponse(200, { comments, totalComments }, "Comments fetched successfully."));
});



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
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required to update the comment.");
    }

    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "CommentId is required.");
    }

    const originalComment = await Comment.findById(commentId);

    if (!originalComment) {
        throw new ApiError(404, "Comment not found with this id.");
    }

    const originalOwnerId = originalComment.owner;

    if (!req.user?._id.equals(originalOwnerId)) {
        throw new ApiError(403, "You are not authorized to update the comment.");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content } },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(500, "Error while updating the comment.");
    }

    res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully.")
    );
});


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const owner = req.user?._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found with the given ID.");
    }

    if (!owner.equals(comment.owner)) {
        throw new ApiError(403, "You are not authorized to delete this comment.");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
        throw new ApiError(500, "An error occurred while deleting the comment.");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedComment, "Comment deleted successfully.")
    );
});



export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }