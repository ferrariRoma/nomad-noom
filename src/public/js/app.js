const frontSocket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(msg) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const inputvalue = input.value;
  frontSocket.emit("new_message", roomName, input.value, () => {
    addMessage(`You: ${inputvalue}`);
  });
  input.value = "";
}

function handleNameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#name input");
  frontSocket.emit("nickname", input.value);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNameSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  frontSocket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

frontSocket.on("welcome_Message", (nickname, newCount) => {
  addMessage(`${nickname} 님이 입장하셨습니다.`);
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount} 명)`;
});

frontSocket.on("bye", (nickname, newCount) => {
  addMessage(`${nickname} 님이 떠났습니다.`);
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount} 명)`;
});

frontSocket.on("new_message", (msg) => {
  addMessage(msg);
});

frontSocket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  if (rooms.length === 0) {
    roomList.innerHTML = "";
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.appendChild(li);
  });
});
