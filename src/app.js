import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// Routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import subscriptonRouter from "./routes/subscripton.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
// ******Routes declaration..*******
// app.use("/users", userRouter)          ***This can be used but more standard way practice is as follows***
app.use("/api/v1/users", userRouter)

app.use("/api/v1/video", videoRouter)

app.use("/api/v1/tweet", tweetRouter)

app.use("/api/v1/playlist", playlistRouter)

app.use("/api/v1/comment", commentRouter)

app.use("/api/v1/like", likeRouter)

app.use("/api/v1/subscription", subscriptonRouter)

app.use("/api/v1/healthcheck", healthcheckRouter)

app.use("/api/v1/dashboard", dashboardRouter)

export default app