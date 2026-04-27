
// Define API endpoints and middleware in this file
import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.route.js";
import projectRoutes from "./routes/project.route.js";
import userRoutes from "./routes/user.route.js";
import columnRoutes from "./routes/column.route.js";
import ticketRoutes from "./routes/ticket.route.js";
import invitationRoutes from "./routes/invitation.route.js";
import notificationRoutes from "./routes/notification.route.js";
const app = express();



app.use(cors());
app.use(morgan("dev")); // Log HTTP requests in development mode and use to debug 
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Trello Fake API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api", columnRoutes);
app.use("/api", ticketRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/notifications", notificationRoutes);
export default app;
