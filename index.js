import express from "express";
import "dotenv/config";
import connectDB from "./db/connection.js";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World");
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log("Server Is Running On The Port", process.env.PORT);
        })
    })
    .catch((err) => {
        console.log(err);
    })