import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({
    limit: "16kb"
}))
app.use(express.urlencoded({extended:true , limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import
import userRouter from './routes/user.routes.js'
import examRouter from './routes/exam.routes.js'
import trackedExamsRouter from './routes/trackedexams.routes.js'

app.use("/api/v1/users",userRouter)
app.use("/api/v1/exams",examRouter)
app.use("/api/v1/tracked-exams",trackedExamsRouter)

import { errorHandler } from "./middlewares/errorhandler.middleware.js"
app.use(errorHandler)

export {app}