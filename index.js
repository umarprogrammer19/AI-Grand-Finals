import express from "express";
import "dotenv/config";
import connectDB from "./db/connection.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js"

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", userRouter);

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