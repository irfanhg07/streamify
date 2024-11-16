import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser,
    changeCurrentPassword ,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory

} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        { name : "avatar",
          maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),

    registerUser)

router.route("/login").post(loginUser)

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refreshToken").post(verifyJWT, refreshAccessToken)

router.route("/changePassword").post(verifyJWT, changeCurrentPassword)

router.route("/getCurrentUser").post(verifyJWT, getCurrentUser)

router.route("/updateAccountDetails").patch(verifyJWT, updateAccountDetails)

router.route("/updateUserAvatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)

router.route("/updateUserCoverImage").patch(verifyJWT,upload.single("coverImage"), updateUserCoverImage)

router.route("/channel/:username").get(verifyJWT,getUserChannelProfile);

router.route("/watchHistory").get(verifyJWT, getWatchHistory)

router.route("")



export default router