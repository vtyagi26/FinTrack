import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import express from "express"; // to create backend server and APIS
import dotenv from "dotenv"; // load env var
import mongoose from "mongoose"; // define schemas
import cookieParser from "cookie-parser"; // middleware to parse cookies from incoming req
import cors from "cors"; // enable cross origin res sharing -> any frontend can access backend
import helmet from "helmet"; // secure headers
import morgan from "morgan"; // logger middleware

import portfolioRoutes from "./routes/portfolio.js";
import marketRoutes from "./routes/market.js";
import authRoutes from "./routes/authRoutes.js";
import tradeRoutes from "./routes/trades.js";
import userRoutes from "./routes/userRoutes.js";
import watchlistRoutes from "./routes/watchlist.js";
import quantRoutes from "./routes/quantRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { getBatchQuotesFromCache } from "./services/marketCache.js";

dotenv.config(); // loads env var

const app = express(); // initializes express applications

app.use(express.json()); // allows server to parse json req bodies
app.use(cookieParser()); // parses cookies and makes them available as req.cookies
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(helmet()); // secure http headers
app.use(morgan("dev")); // logs incoming req in readable format

app.use("/api/notifications", notificationRoutes);
app.use("/api/trades", tradeRoutes); // routes
app.use("/api/auth", authRoutes); // routes
app.use("/api/portfolio", portfolioRoutes); // routes
app.use("/api/market", marketRoutes); // routes
app.use("/api/users", userRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/quant", quantRoutes);

app.get("/", (req, res) => res.send("API running...")); // simple test route to confirm server is running

const PORT = process.env.PORT || 3002; // uses the port from .env or default 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
      // Pre-warm market cache on startup so first user never gets fallback data
      console.log("[Startup] Pre-fetching market data...");
      getBatchQuotesFromCache().then((data) => {
        console.log(`[Startup] Market cache warm-up: got ${data.length} quotes (first: ${data[0]?.symbol} $${data[0]?.price})`);
      }).catch((err) => {
        console.warn("[Startup] Market cache warm-up failed:", err.message);
      });
    })
  )
  .catch((err) => console.error("MongoDB connection error:", err));