const express = require("express");
const cors = require("cors");
const http = require("http");

const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors({
  origin: "http://localhost:8080", // 접근 권한을 부여하는 도메인
  credentials: true, // 응답 헤더에 Access-Control-Allow-Credentials 추가
  optionsSuccessStatus: 200, // 응답 상태 200으로 설정
}));

const config = {
  listenIp: "0.0.0.0",
  listenPort: 3000,
};

const videoRouter = require("./router/video.js");
const audioRouter = require("./router/audio.js");

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(config.listenPort, () => {
  console.log("Server is running on http://localhost:3000");
});

app.use("/video", videoRouter);
app.use("/audio", audioRouter);