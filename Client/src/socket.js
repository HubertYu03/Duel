import { io } from "socket.io-client";

const API_URL = "http://127.0.0.1:5000"; // Update to Flask's running URL

const socket = io(API_URL, {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected to the server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from the server.");
});

export default socket;
