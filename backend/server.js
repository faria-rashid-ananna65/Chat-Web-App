import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { setupSocket } from "./src/socket/index.js";

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = setupSocket(server);
app.set("io", io);

const PORT = process.env.PORT || 5000;

server.listen(PORT);
