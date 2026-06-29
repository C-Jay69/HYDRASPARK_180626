import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import app from "./api";
import { db } from "./api/database";
import { messages } from "./api/database/schema";

const port = Number(process.env.PORT ?? 3020);
const distDir = `${import.meta.dir}/../dist`;
const indexPath = `${distDir}/index.html`;

// Create HTTP server wrapping Bun serve behavior
const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url!, `http://localhost:${port}`);

  // API routes → Hono
  if (url.pathname.startsWith("/api")) {
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") headers[k] = v;
    }

    let body: BodyInit | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk);
      body = Buffer.concat(chunks);
    }

    const honoRes = await app.fetch(
      new Request(url.toString(), { method: req.method, headers, body }),
    );

    res.writeHead(honoRes.status, Object.fromEntries(honoRes.headers));
    const buf = await honoRes.arrayBuffer();
    res.end(Buffer.from(buf));
    return;
  }

  // Static files
  const cleanPath = decodeURIComponent(url.pathname).replace(/^\/+/, "").replaceAll("..", "");
  const filePath = cleanPath ? `${distDir}/${cleanPath}` : indexPath;
  const file = Bun.file(filePath);

  if (await file.exists()) {
    const buf = await file.arrayBuffer();
    const ct = file.type || "application/octet-stream";
    res.writeHead(200, { "Content-Type": ct });
    res.end(Buffer.from(buf));
    return;
  }

  // SPA fallback
  const index = Bun.file(indexPath);
  if (await index.exists()) {
    const buf = await index.arrayBuffer();
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(Buffer.from(buf));
    return;
  }

  res.writeHead(500);
  res.end("Build not found. Run `bun run build`.");
});

// Socket.io
const io = new SocketServer(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  path: "/socket.io",
});

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId as string;

  socket.on("join-room", (connectionId: string) => {
    socket.join(connectionId);
  });

  socket.on("send-message", async (data: { connectionId: string; text: string; senderId: string }) => {
    try {
      const [msg] = await db.insert(messages).values({
        connectionId: data.connectionId,
        senderId: data.senderId,
        text: data.text,
      }).returning();

      // Broadcast to everyone in the room
      io.to(data.connectionId).emit("message", {
        id: msg.id,
        senderId: msg.senderId,
        text: msg.text,
        createdAt: msg.createdAt,
        isFlagged: msg.isFlagged,
      });
    } catch (err) {
      console.error("Socket send-message error:", err);
    }
  });

  socket.on("disconnect", () => {
    // cleanup if needed
  });
});

httpServer.listen(port, () => {
  console.log(`HydraSpark server running on http://localhost:${port}`);
  console.log(`Socket.io ready on /socket.io`);
});

export default httpServer;
