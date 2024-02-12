import dotenv from "dotenv"
import connectingDB from "./db/index.js"
dotenv.config({ path: "./env" })
connectingDB()