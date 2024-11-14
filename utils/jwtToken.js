const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
    const accessToken = jwt.sign(
        { _id: user._id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );

    const refreshToken = jwt.sign(
        { _id: user._id, email: user.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
};

exports.verifyAccessJWT = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        return decoded;
    } catch (error) {
        return {
            status: false,
            message: "Access Token Verification Failed:",
        };
    }
};

exports.verifyRefreshJWT = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        return decoded;
    } catch (error) {
        return {
            status: false,
            message: "Refresh Token Verification Failed:",
            error,
        };
    }
};
