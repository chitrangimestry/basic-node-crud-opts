const User = require("../models/userRegisterModel");

const jwt = require("jsonwebtoken");


//use "_" in args when the arg remains unused in the function.
//for ex. res is not used anywhere in the code then use (req, _, next)


exports.verifyJWT = async (req, res, next) => {
    try {
        const token =
            req.cookies.accessToken ||
            req.headers("Authorization").replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded._id).select(
            "-_password -refreshToken"
        );

        if (!user) {
            return res
                .status(401)
                .json({ status: false, message: "Invalid Access Token." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res
            .status(401)
            .json({ status: false, message: "Invalid Access Token" });
    }
};
