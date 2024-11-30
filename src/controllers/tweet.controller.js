import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {

    const {content} =req.body

    if(!content){

        throw new ApiError(400, "Content is required..")
    }

    const createTweet = await Tweet.create(
        {
            content,
            owner: req.user._id

        }
    )

    if(!createTweet){
        throw new ApiError(500, "Failed to create tweeet..")
    }

    res.status(201)
        .json(new ApiResponse(201, createTweet, "Tweet created successfully.."))
})

const getUserTweets = asyncHandler(async (req, res) => {

    const {userId} = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
      }
    
    const userTweets = await Tweet.findById({ owner:userId })

    if(userTweets.length == 0){
        throw new ApiError(404, "Tweets not found for this user.." )
    }

    res.status(200)
        .json(new ApiResponse(200, userTweets, "Tweets fetched successfully.."))
})

const updateTweet = asyncHandler(async (req, res) => {

    const {tweetId} = req.params

    const { content } = req.body

    if(!content){
        throw new ApiError(400, "Content is required.")
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid user id");
      }

    const tweet = await Tweet.findById( tweetId )

    if(!tweet){
        throw new ApiError(404, "No tweet found for this Id ..")
    }

    if(tweet.owner !== req.user._id){

        throw new ApiError(403, "You are not authorised to update this tweet..")
        
    }

    const modifiedTweet = await Tweet.findByIdAndUpdate(

        {
            $set:{
                content
            }

        },
        {
            new : true
        }
)
    if(!modifiedTweet){
        throw new ApiError(500, "Something went wrong while updating tweet..")
    }

    res.status(200)
        .json(new ApiResponse(200, modifiedTweet, "Tweet udpated successfully.."))
    


})

const deleteTweet = asyncHandler(async (req, res) => {

    const tweetId = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Tweet id is not valid..")
    }

    const tweet = await Tweet.findById(tweetId)
    
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deleteTweet){
        throw new ApiError(500, "Something went wrong while deleting ..")

    }

    res.status(200)
        .json(200, {}, "Tweet deleted Successfully..")
    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}