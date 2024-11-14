import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser,
    changePassword ,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage

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

router.route("/changePassword").post(verifyJWT, changePassword)

router.route("/getCurrentUser").post(verifyJWT, getCurrentUser)

router.route("/updateAccountDetails").post(verifyJWT, updateAccountDetails)

router.route("/updateUserAvatar").post(verifyJWT, updateUserAvatar)

router.route("/updateUserCoverImage").post(verifyJWT, updateUserCoverImage)

router.route("")



export default router