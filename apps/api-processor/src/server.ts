import dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser"
import { router } from "./router"

dotenv.config()
const app = express()
const PORT = 3001

//ROUTES
app.use(cookieParser());
app.use("/api", router)

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`)
})
