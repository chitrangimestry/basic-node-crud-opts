const mongoose = require("mongoose");

const userRegisterSchema = new mongoose.Schema({
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
        required: true,
       
    },
    profilePic: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    }
}, { timestamps: true });

const User = mongoose.model("User", userRegisterSchema);

module.exports = User;
