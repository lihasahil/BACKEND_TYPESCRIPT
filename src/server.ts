import express, { Application } from "express";
import path from "path";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "./connect.db";
import userRoutes from "./controllers/user.controller";
import adminRoutes from "./controllers/admin.controller";
import morganMiddleware from "./loggers/morgan.logger";
import logger from "./loggers/winston.logger";

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "5000", 10);
dotenv.config();
// Connect to database
connectDB();

// Middleware
app.use(morganMiddleware);
app.use(express.json());
app.use(helmet());
app.disable("x-powered-by");

// Routes
app.use(userRoutes);
app.use(adminRoutes);

// Static file serving
app.use("/files", express.static(path.join(__dirname, "../files")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
