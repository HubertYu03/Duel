import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import socket from "../socket";

import "../Styles/roomNavigation.css";

const RoomNavigation = () => {
  const [roomID, setRoomID] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!roomID.trim()) {
      setError("Room ID cannot be empty.");
      return;
    }

    // Tell socket you are creating a room
    socket.emit("create_room", { room_id: roomID });
  };

  const handleJoinRoom = () => {
    if (!roomID.trim()) {
      setError("Room ID cannot be empty.");
      return;
    } else {
      navigate(`/room/${roomID}`); // Navigate to the room page
    }
  };

  useEffect(() => {
    // Create the room is the room is valid
    socket.on("create_room_valid", (data) => {
      navigate(`/room/${data.room_id}`);
    });

    // If the room already exists when creating a room
    socket.on("create_room_invalid", () => {
      setError("Room ID already taken!");
    });
  }, [socket, error]);

  return (
    <div style={styles.container}>
      {/* button to return to dashboard */}
      <motion.button
        className="navBackButton"
        whileHover={{
          scale: 1.05,
        }}
        whileTap={{
          scale: 0.95,
        }}
        onClick={() => navigate("/Dashboard")}
      >
        ⬅ Back to Dashboard
      </motion.button>

      <div className="roonNavTitle">Join or Create a Room</div>
      <input
        type="text"
        value={roomID}
        onChange={(e) => setRoomID(e.target.value)}
        placeholder="Enter Room ID"
        className="roomIdInput"
      />
      {error && (
        <motion.p
          style={styles.error}
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          {error}
        </motion.p>
      )}

      <div className="navButtonContainer">
        <motion.button
          className="navButton"
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
          onClick={handleCreateRoom}
        >
          Create Room
        </motion.button>
        <motion.button
          className="navButton"
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
          onClick={handleJoinRoom}
        >
          Join Room
        </motion.button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
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
    fontSize: "16px",
    marginTop: "20px",
  },
};

export default RoomNavigation;
