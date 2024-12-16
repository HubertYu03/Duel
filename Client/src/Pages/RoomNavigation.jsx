import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

const RoomNavigation = () => {
  const [roomID, setRoomID] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!roomID.trim()) {
      setError("Room ID cannot be empty.");
      return;
    }
    socket.emit("create_room", { room_id: roomID }, () => {
      console.log(`Room ${roomID} created`);
      navigate(`/room/${roomID}`); // Navigate to the room page
    });
  };

  const handleJoinRoom = () => {
    if (!roomID.trim()) {
      setError("Room ID cannot be empty.");
      return;
    }
    navigate(`/room/${roomID}`); // Navigate to the room page
  };

  return (
    <div style={styles.container}>
      <h1>Join or Create a Room</h1>
      <input
        type="text"
        value={roomID}
        onChange={(e) => setRoomID(e.target.value)}
        placeholder="Enter Room ID"
        style={styles.input}
      />
      {error && <p style={styles.error}>{error}</p>}
      <div>
        <button onClick={handleCreateRoom} style={styles.button}>
          Create Room
        </button>
        <button onClick={handleJoinRoom} style={styles.button}>
          Join Room
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
  },
  input: {
    width: "300px",
    padding: "10px",
    margin: "10px 0",
    fontSize: "16px",
  },
  button: {
    margin: "5px",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
};

export default RoomNavigation;
