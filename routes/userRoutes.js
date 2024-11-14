const express = require("express");
const route = express.Router();
const userRegisterController = require("../controllers/userRegisterController.js");
const upload = require("../middlewares/multerMiddleware.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");
// const { authMiddleware } = require("../middlewares/authMiddleware.js");

// route.post("/register",  (req, res) => {createUser});

route.post(
    "/register",
    upload.single("image"),
    userRegisterController.createUser
);
route.get("/refreshToken", userRegisterController.refreshToken);
route.post("/loginUser" ,userRegisterController.loginUser);
route.patch("/updateUser/:id", userRegisterController.updateUser);
route.delete("/deleteUser/:id",authMiddleware, userRegisterController.deleteUser);
route.get("/getAllUsers", userRegisterController.getAllUsers);
route.post("/logoutUser/:id", userRegisterController.logoutUser);
// route.post('/add', upload.single('image'), userRegisterController.createBook);

module.exports = route;
