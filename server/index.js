import "dotenv/config";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { initFirebase } from "./firebase.js";
import { createSocketGateway } from "./websocket/SocketGateway.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

initFirebase();

// 정적 클라이언트 제공
app.use(express.static(path.join(__dirname, "../client")));

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

const server = http.createServer(app);
createSocketGateway(server);

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
