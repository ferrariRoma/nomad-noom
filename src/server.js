import http from "http";
import express from "express";
import { Server } from "socket.io";
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
  backSocket.on("enter_room", (msg) => {
    console.log(msg);
  });
});

/*
const wss = new WebSocket.Server({ server });

let sockets = [];
wss.on("connection", (backSocket) => {
  sockets.push(backSocket);
  backSocket["nickname"] = "Anon";
  console.log("Connected to Browser ✅");
  backSocket.on("close", () => {
    console.log("Disconnected from the Browser ❎");
  });
  backSocket.on("message", (message) => {
    const parsed = JSON.parse(message);
    switch (parsed.type) {
      case "new_message":
        sockets.forEach((socket) =>
          socket.send(`${backSocket.nickname}: ${parsed.payload}`)
        );
        break;
      case "new_nickname":
        backSocket["nickname"] = parsed.payload;
        break;
    }
  });
}); */

const handleListen = () => console.log(`Listening on http://localhost:4000`);
httpServer.listen(4000, handleListen);
