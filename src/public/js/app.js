const frontSocket = new WebSocket(`ws://${window.location.host}`);
const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");

frontSocket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

frontSocket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

frontSocket.addEventListener("close", () => {
  console.log("Disconnected from server ❌");
});

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  frontSocket.send(makeMessage("new_message", input.value));
  input.value = "";
}

function handleNick(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  frontSocket.send(makeMessage("new_nickname", input.value));
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNick);
