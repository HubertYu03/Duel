import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";

const RoomPage = () => {
  const { roomID } = useParams();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    // Join the room
    socket.emit("join_room", { room_id: roomID, username: localStorage.getItem("username") });

    // Listen for incoming messages
    socket.on("receive_message", (data) => {
      setChat((prevChat) => [...prevChat, { username: data.username, message: data.message }]);
    });

    // Cleanup on unmount
    return () => {
      socket.emit("leave_room", { room_id: roomID });
      socket.off("receive_message");
    };
  }, [roomID]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const username = localStorage.getItem("username");
    socket.emit("send_message", { room_id: roomID, message, username });

    setChat((prevChat) => [...prevChat, { username: "You", message }]);
    setMessage("");
  };

  return (
    <div style={styles.container}>
      <h1>Room: {roomID}</h1>
      <div style={styles.chatBox}>
        {chat.map((msg, index) => (
          <p key={index} style={styles.message}>
            <strong>{msg.username}:</strong> {msg.message}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
        style={styles.input}
      />
      <button onClick={handleSendMessage} style={styles.button}>
        Send
      </button>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    marginTop: "20px",
  },
  chatBox: {
    width: "500px",
    height: "300px",
    border: "1px solid #ccc",
    margin: "20px auto",
    padding: "10px",
    overflowY: "scroll",
    textAlign: "left",
  },
  input: {
    width: "300px",
    padding: "10px",
    marginRight: "10px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
  },
  message: {
    margin: "5px 0",
  },
};

export default RoomPage;
