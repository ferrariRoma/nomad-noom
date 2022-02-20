import http from "http";
import express from "express";
import { Server, Socket } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { parse } from "path";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

wsServer.on("connection", (backSocket) => {
  // Join Room
  backSocket.on("join_room", (roomName) => {
    backSocket.join(roomName);
    backSocket.to(roomName).emit("welcome");
  });

  // Offer
  backSocket.on("offer", (offer, roomName) => {
    backSocket.to(roomName).emit("offer", offer);
  });

  // Answer
  backSocket.on("answer", (answer, roomName) => {
    backSocket.to(roomName).emit("answer", answer);
  });

  // icecandidate
  backSocket.on("ice", (ice, roomName) => {
    backSocket.to(roomName).emit("ice", ice);
  });
});

const handleListen = () => console.log(`Listening on http://localhost:4000`);
httpServer.listen(4000, handleListen);
