const User = require("../models/userRegisterModel");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/jwtToken.js");
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

        const token = generateToken(user);
        
        return res.status(201).json({
            status: true,
            message: "User created successfully",
            token, 
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

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!(email || password)) {
        res.status(400).json({
            status: false,
            message: "Please enter all fields",
        });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ status: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ status: false, message: "Invalid Credentials" });
        }

        const token = generateToken(user);

        return res.status(200).json({
            status: true,
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
        });
    }
};

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

        return res
            .status(200)
            .json({ status: true, message: "User deleted successfully", token });
    } catch (error) {
        return res
            .status(500)
            .json({ status: false, message: "Internal server error" });
    }
};

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
