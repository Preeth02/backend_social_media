import app from ".app.js"
import dotenv from "dotenv"
import connectingDB from "./db/index.js"
dotenv.config({ path: "./env" })

connectingDB().then(() => {
    app.on("Error", (error) => {
        console.log("Error", error);
        throw error
    })
    app.listen(process.env.PORT || 500, () => {
        console.log(`Server is running at the port ${process.env.PORT}`);
    })
}).catch(err => {
    console.log("MONGODB Connection failed!!!", err)
})