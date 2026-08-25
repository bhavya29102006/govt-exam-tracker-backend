import dotenv  from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { startDeadlineReminderJob } from "./jobs/deadlinereminder.job.js";



dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.on("error" , (error) => {
        console.log("ERRR: ", error);
        throw error 
    })

    app.listen(process.env.PORT, () => {
        console.log(`app is listening on port ${process.env.PORT}`);
        startDeadlineReminderJob();
    })

})
.catch((error) => {
   console.log("MONGO DB connection failed !!!", error);
})

