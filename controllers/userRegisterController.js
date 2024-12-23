const User = require("../models/userRegisterModel");
const bcrypt = require("bcrypt");
const { generateToken, verifyRefreshJWT } = require("../utils/jwtToken.js");

//--------------------refreshing a token---------------
exports.refreshToken = async (req, res) => {
    try {
        console.log("Obtaining a new access token: ");

        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res
                .status(401)
                .json({ status: false, message: "Unauthorized access" });
        }

        const decoded = verifyRefreshJWT(refreshToken);

        const user = await User.findById(decoded._id);
        if (!user) {
            return res
                .status(401)
                .json({ status: false, message: "User not found." });
        }

        if (user.refreshToken !== refreshToken) {
            return res
                .status(401)
                .json({ status: false, message: "Invalid refresh token" });
        }

        const { accessToken } = generateToken(user);

        return res.status(200).json({
            status: true,
            message: "Access token refreshed successfully",
            accessToken,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
        });
    }
};

//------------------Register User---------------------

exports.createUser = async (req, res) => {
    const { username, email, password } = req.body;
    if (!(username || email || password)) {
        return res
            .status(400)
            .json({ status: false, message: "Please enter all fields" });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(409)
                .json({ status: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        //console.log(hashedPassword);
        const image = req.file ? req.file.path : null;

        const user = new User({
            username,
            email,
            password: hashedPassword,
            profilePic: image,
        });
        await user.save();

        return res.status(201).json({
            status: true,
            message: "User created successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                password: user.password,
                profilePic: user.profilePic,
            },
        });
    } catch (error) {
        //console.log();

        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error,
        });
    }
};

//------------------Login User---------------------
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    //console.log(req.body);
    if (!(email || password)) {
        res.status(400).json({
            status: false,
            message: "Please enter all fields",
        });
    }
    try {
        const user = await User.findOne({ email });
        // console.log(user);

        if (!user) {
            return res
                .status(404)
                .json({ status: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        //console.log(isMatch);
        if (!isMatch) {
            return res
                .status(401)
                .json({ status: false, message: "Invalid Credentials" });
        }

        const { accessToken, refreshToken } = generateToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        return res.status(200).json({
            status: true,
            message: "User logged in successfully",
            id: user._id,
            username: user.username,
            email: user.email,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
        });
    }
};

//-----------------------Logout User-----------------
exports.logoutUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ status: false, message: "User not found" });
        }
        user.refreshToken = null;
        await user.save();
        return res.status(200).json({
            status: true,
            message: "User logged out successfully",
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
        });
    }
};

//----------------------Update User----------------
exports.updateUser = async (req, res) => {
    const { username, email, password } = req.body;
    const uid = req.params.id;
    // console.log(req);

    try {
        const user = await User.findById({ _id: uid });
        if (!user) {
            return res
                .status(400)
                .json({ status: false, message: "User not found." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            { _id: uid },
            req.body,
            { new: true }
        );
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedUser.password = hashedPassword;
        }
        console.log(updatedUser);

        const token = generateToken(updatedUser);
        await updatedUser.save();

        return res.status(200).json({
            status: true,
            message: "User updated successfully",
            token,
            updatedUser,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ status: false, message: "Internal server error" });
    }
};

//----------------------Delete User----------------export const deleteUser = async (req, res) => {

exports.deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res
                .status(400)
                .json({ status: false, message: "User not Found" });
        }
        const token = generateToken(user);
        return res.status(200).json({
            status: true,
            message: "User deleted successfully",
            token,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ status: false, message: "Internal server error" });
    }
};

//----------------------Get All Users----------------
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res
            .status(200)
            .json({ status: true, message: "Users found successfully", users });
    } catch (error) {
        return res
            .status(500)
            .json({ status: false, message: "Internal server error" });
    }
};

//---------------------Get User Channel Profile-----------------------
exports.getUserChannelProfile = async (req, res) => {
    const { username } = req.params;
    try {
        if (!username) {
            return res
                .status(400)
                .json({ statyus: false, message: "Username not found." });
        }

        const channel = await User.aggregate([
            {
                $match: {
                    username: username?.tolowerCase(),
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo",
                },
            },
            {
                $addFields: {
                    subscriberCount: { $size: "$subscribers" },
                    channelsSubscribedToCount: { $size: "$subscribedTo" },
                    /* $cond to check a condition and return a value based on that condition
                        $in selects the documents where the value of a field equals any value in the specified array or an object.
                    */  
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [req.user?._id, "$subscribers.subscriber"],
                            },
                            then:  true,
                            else: false
                        },
                    },
                },
            },
            {
                $project: {
                    
                }
            }
        ]);
    } catch (error) {}
};
