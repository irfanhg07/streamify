import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({

    username: {
        tyep: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index:true
    },

    email: {
        tyep: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    fullName: {
        tyep: String,
        required: true,
        trim: true,
        index:true
    },

    avatar: {
        tyep: String,
        required: true
    },

    coverImage: {
        tyep: String,
    },

    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref:"Video"
        }
    ],

    password: {
        type: String,
        required: [true, "Password is required.."]
    },

    refreshToken: {
        type: String
    }

}, 

{timestamps: true})

// pre hook before saving encrpt the password if it is created or modified
userSchema.pre("save", async function (next) {

    if(!this.isModified("password")) return next()
    
    this.password =await bcrypt.hash(this.password, 10)

    next()
})

// checking if the password entered is correct or not
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
    
}
// Generating Access token
userSchema.methods.generateAccessToken = async function () {

    return await jwt.sign({

        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)

}

// Generating Refresh token
userSchema.methods.generateRefreshToken = async function () {

    return await jwt.sign({

        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)

}


export const User = mongoose.model("User", userSchema)