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
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://ad min.socket.io"],
    credentials: true,
  },
});
instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  const {
    sockets: {
      adapter: { rooms, sids },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (backSocket) => {
  backSocket["nickname"] = "Anon";

  // console.log(event)
  backSocket.onAny((event) => {
    console.log(wsServer.sockets.adapter);
    console.log(`backSocket Event: ${event}`);
  });

  // Send message when joining the specific room
  backSocket.on("enter_room", (roomName, done) => {
    backSocket.join(roomName);
    done();
    backSocket
      .to(roomName)
      .emit("welcome_Message", backSocket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });

  // disconnecting
  backSocket.on("disconnecting", () => {
    backSocket.rooms.forEach((room) =>
      backSocket.to(room).emit("bye", backSocket.nickname, countRoom(room) - 1)
    );
  });

  backSocket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });

  // send msg
  backSocket.on("new_message", (roomName, msg, done) => {
    backSocket
      .to(roomName)
      .emit("new_message", `${backSocket.nickname}: ${msg}`);
    done();
  });

  // set nickname
  backSocket.on("nickname", (nickname) => (backSocket["nickname"] = nickname));
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
