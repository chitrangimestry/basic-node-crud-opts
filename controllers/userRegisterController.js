const User = require("../models/userRegisterModel");
const bcrypt = require("bcrypt");
const { generateToken, verifyRefreshJWT, verifyAccessJWT } = require("../utils/jwtToken.js");

//--------------------refreshing a token---------------
exports.refreshToken = async (req, res) => {
    try {
        console.log("Obtaining a new access token: ");

        const refreshToken = req.cookies.refreshToken;
        console.log(refreshToken);
        if (!refreshToken) {
            return res
                .status(401)
                .json({ status: false, message: "Unauthorized access" });
        }

        const { email } = verifyRefreshJWT(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const accessToken = verifyAccessJWT(
            { email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        res.cookies("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });

        return res.status(200).json({
            status: true,
            message: "Access token refreshed successfully",
            accessToken,
        })
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
                profilePic: user.profilePic,
            },
        });
    } catch (error) {
        //console.log();

        return res.status(500).json({
            status: false,
            message: "Internal server error",
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
        console.log(user);

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
            token: accessToken,
            refreshToken: refreshToken,
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
        //user.refreshToken = null;
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
    // const { username, email, password } = req.body;
    const uid = req.params.id;
    // console.log(req);

    // if (!(username || email || password)) {
    //     return res
    //         .status(200)
    //         .json({ status: false, message: "Please enter all fields" });
    // }

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
        console.log(updatedUser);
        await updatedUser.save();

        const token = generateToken(updatedUser);

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

//----------------------Delete User----------------
exports.deleteUser = async (req, res) => {
    const id = req.params.id;
    const userExist = await User.findOne({ _id: id });
    if (!userExist) {
        return res
            .status(404)
            .json({ status: false, message: "User not found" });
    }
    try {
        await User.findByIdAndDelete(id);

        const token = generateToken(userExist);

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
