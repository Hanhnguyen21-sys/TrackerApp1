import cron from "node-cron";
import Ticket from "../models/Ticket.js";
import Notification from "../models/Notification.js";

export const startDueDateReminderJob = () => {
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Running due date reminder job...");

    try {
      // ===== STEP 1: Calculate tomorrow range =====
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);

      const start = new Date(tomorrow);
      start.setHours(0, 0, 0, 0);

      const end = new Date(tomorrow);
      end.setHours(23, 59, 59, 999);

      console.log("📅 NOW:", now);
      console.log("📅 TOMORROW RANGE:");
      console.log("   START:", start);
      console.log("   END  :", end);

      // ===== STEP 2: Fetch tickets =====
      const tickets = await Ticket.find({
        dueDate: { $gte: start, $lte: end },
        reminderSent: false,
      }).populate("assignee reporter project");

      console.log(`🔍 Found ${tickets.length} ticket(s) for reminder`);

      // ===== STEP 3: Process each ticket =====
      for (const ticket of tickets) {
        console.log("--------------------------------------------------");
        console.log("🎫 Processing ticket:");
        console.log({
          id: ticket._id,
          title: ticket.title,
          dueDate: ticket.dueDate,
          reminderSent: ticket.reminderSent,
          assignee: ticket.assignee,
          reporter: ticket.reporter,
        });

        const usersToNotify = new Set();

        // ===== Add assignees =====
        if (ticket.assignee) {
          const assignees = Array.isArray(ticket.assignee)
            ? ticket.assignee
            : [ticket.assignee];

          assignees.forEach((user) => {
            const id = String(user?._id || user);
            console.log("👤 Add assignee:", id);
            usersToNotify.add(id);
          });
        } else {
          console.log("⚠️ No assignee found");
        }

        // ===== Add reporter =====
        if (ticket.reporter) {
          const reporterId = String(ticket.reporter?._id || ticket.reporter);
          console.log("👤 Add reporter:", reporterId);
          usersToNotify.add(reporterId);
        } else {
          console.log("⚠️ No reporter found");
        }

        console.log("📢 Users to notify:", [...usersToNotify]);

        // ===== Create notifications =====
        for (const userId of usersToNotify) {
          console.log(`📩 Creating notification for user ${userId}`);

          await Notification.create({
            recipient: userId, // ✅ FIXED (was "user")
            sender: ticket.reporter?._id || ticket.reporter,
            targetProject: ticket.project?._id || ticket.project,
            targetTicket: ticket._id,
            type: "dueDate",
            message: `Reminder: "${ticket.title}" is due tomorrow.`,
          });
        }

        // ===== Mark as sent =====
        ticket.reminderSent = true;
        await ticket.save();

        console.log("✅ Reminder sent & ticket updated");
      }

      console.log("🎉 Reminder job completed successfully");
    } catch (error) {
      console.error("❌ Reminder job error:", error);
    }
  });
};