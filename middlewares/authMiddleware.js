//use "_" in args when the arg remains unused in the function.
//for ex. res is not used anywhere in the code then use (req, _, next)

const { verifyAccessJWT } = require("../utils/jwtToken.js");

exports.authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            status: false,
            message: "Access denied. Token is required",
        });
    }

    const token = authHeader.split(" ")[1].trim();
    try {
        const decoded = verifyAccessJWT(token);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification error: ", error);
        return res
            .status(401)
            .json({ status: false, message: "Invalid Token" });
    }
};
