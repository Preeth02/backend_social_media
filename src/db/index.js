import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectingDB = async () => {
    try {
        const connectInstance = await mongoose.connect(`${process.env.MONGODB_URL}${DB_NAME}`)
        console.log(`\n Connection successful with MONGO_DB !!! DB HOST: ${connectInstance.connection.host}`)
    } catch (err) {
        console.log("ERROR: FALIED TO CONNECT WITH MONGO_DB", err)
        process.exit(1)
    }
}
export default connectingDB;