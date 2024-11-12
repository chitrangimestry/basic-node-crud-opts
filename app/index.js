const express = require("express");
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
const connectToDB = require("../db/db.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const route = require("../routes/userRoutes.js");

// app.get("/", (req, res) => {
//     res.send("Hello World!");
// });

app.use("/api", route);

connectToDB().then(() => {
    app.listen(3000, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((err) => {
    console.log("Something went wrong.", err);
})