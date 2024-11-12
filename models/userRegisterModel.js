const mongoose = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const jwt = require("jsonwebtoken");

const userRegisterSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        profilePic: {
            type: String,
            default:
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);

userRegisterSchema.methods.generateAccessToken = function()  {
    return jwt.sign({ _id: this._id, email: this.email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
};

userRegisterSchema.methods.generateRefreshToken = function()  {
    return jwt.sign({ _id: this._id, email: this.email }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRY});
};

const User = mongoose.model("User", userRegisterSchema);

module.exports = User;
