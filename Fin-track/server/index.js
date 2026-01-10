import express from "express"; // to create backend server and APIS
import dotenv from "dotenv"; // load env var
import mongoose from "mongoose"; // define schemas
import cookieParser from "cookie-parser"; // middleware to parse cookies from incoming req
import cors from "cors"; // enable cross origin res sharing -> any frontend can access backend
import helmet from "helmet"; // secure headers
import morgan from "morgan"; // logger middleware

import portfolioRoutes from "./routes/portfolio.js"; //endpoints
import marketRoutes from "./routes/market.js"; //endpoints
import authRoutes from "./routes/authRoutes.js"; //endpoints
import tradeRoutes from "./routes/trades.js"; //endpoints
import userRoutes from "./routes/userRoutes.js";
import watchlistRoutes from "./routes/watchlist.js"; // Import at top


dotenv.config(); // loads env var

const app = express(); // initializes express applications

app.use(express.json()); // allows server to parse json req bodies
app.use(cookieParser()); // parses cookies and makes them available as req.cookies
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // allows req from frontend and credentials allow cookies and authentication headers
app.use(helmet()); // secure http headers
app.use(morgan("dev")); // logs incoming req in readable format

app.use("/api/trades", tradeRoutes); // routes
app.use("/api/auth", authRoutes); // routes
app.use("/api/portfolio", portfolioRoutes); // routes
app.use("/api/market", marketRoutes); // routes
app.use("/api/users", userRoutes);
app.use("/api/watchlist", watchlistRoutes);

app.get("/", (req, res) => res.send("API running...")); // simple test route to confirm server is running

const PORT = process.env.PORT || 5000; // uses the port from .env or default 5000

mongoose
  .connect(process.env.MONGO_URI) // connects mongodb using connection string in env
  .then(() => app.listen(PORT, () => console.log(`Server running on ${PORT}`))) // start express server
  .catch((err) => console.error("MongoDB connection error:", err)); // logs error