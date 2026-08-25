import cron from "node-cron";
import { TrackedExams } from "../models/trackedexams.models.js";
import { sendDeadlineReminderEmail } from "../utils/mailer.js";

const REMINDER_WINDOW_DAYS = 3; // send reminder when deadline is within next 3 days

const checkAndSendReminders = async () => {
    try {
        const now = new Date();
        const windowEnd = new Date();
        windowEnd.setDate(now.getDate() + REMINDER_WINDOW_DAYS);

        const trackedExams = await TrackedExams.find({
            reminderSent: { $ne: true } // don't re-send if already notified
        })
            .populate("exam")
            .populate("user");

        for (const tracked of trackedExams) {
            const exam = tracked.exam;
            const user = tracked.user;

            if (!exam || !exam.applicationlastdate || !user) continue;

            const lastDate = new Date(exam.applicationlastdate);

            // check if deadline falls within our reminder window
            if (lastDate >= now && lastDate <= windowEnd) {
                await sendDeadlineReminderEmail(
                    user.email,
                    user.fullname,
                    exam.examname,
                    exam.applicationlastdate
                );

                // mark as sent so we don't spam the same reminder daily
                tracked.reminderSent = true;
                await tracked.save();
            }
        }

        console.log(`Deadline reminder check completed at ${now.toISOString()}`);
    } catch (error) {
        console.log("Error in deadline reminder job:", error.message);
    }
};

// runs every day at 9:00 AM server time
const startDeadlineReminderJob = () => {
    cron.schedule("0 9 * * *", checkAndSendReminders);
    console.log("Deadline reminder cron job scheduled (daily at 9 AM)");
};

export { startDeadlineReminderJob, checkAndSendReminders };