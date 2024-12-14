import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";

import "../Styles/gamePage.css";

import axios from "axios";

const RoomPage = () => {
  const API_URL = import.meta.env.VITE_API_URL; // Get the API URL from environment variables

  const { roomID } = useParams(); // Room ID

  const [you, setYou] = useState(localStorage.getItem("username")); // You are the username
  const [opponent, setOpponent] = useState("");

  // States for game management
  const [gameStart, setGameStart] = useState(false);

  // States for gameplay
  const [hand, setHand] = useState([]);
  const [currentDeck, setCurrentDeck] = useState([]);

  // Function used to fetch a user's deck
  const fetchDeck = () => {
    axios
      .get(`${API_URL}/fetchUserDeck/${localStorage.getItem("userID")}`)
      .then((res) => {
        // Shuffle the deck while we have easy access to the user's deck data
        const shuffledDeck = shuffleDeck(res.data);
        setCurrentDeck(shuffledDeck);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const test = () => {
    console.log(currentDeck);
  };

  useEffect(() => {
    // Join the room
    socket.emit("join_room", {
      room_id: roomID,
      user: {
        username: localStorage.getItem("username"),
        user_id: localStorage.getItem("userID"),
      },
    });

    // Cleanup on unmount
    return () => {
      socket.emit("leave_room", { room_id: roomID });
    };
  }, [roomID]);

  // Function for shuffling the deck
  const shuffleDeck = (userDeck) => {
    let shuffledDeck = userDeck;

    for (let i = shuffledDeck.length - 1; i > 0; i--) {
      // Generate a random index from 0 to i
      const randomIndex = Math.floor(Math.random() * (i + 1));

      // Swap elements at index i and randomIndex
      [shuffledDeck[i], shuffledDeck[randomIndex]] = [
        shuffledDeck[randomIndex],
        shuffledDeck[i],
      ];
    }

    return shuffledDeck;
  };

  // Function to draw cards
  const drawCard = () => {
    // Save a state of the current deck
    let deckState = [...currentDeck];

    // Save a state of the current hand
    let handState = hand;

    // Drawn card
    const drawnCard = deckState.shift();
    handState.push(drawnCard);

    // Update states
    setHand(handState);
    setCurrentDeck(deckState);

    console.log(handState);
    console.log(deckState);
  };

  // Use effect on page launch
  useEffect(() => {
    // Fetch user's deck
    fetchDeck();
  }, []);

  // Use effect for socket listening
  useEffect(() => {
    // Testing
    socket.on("test", (data) => {
      console.log(data.username + " has connected");
    });

    // Listen for users who join the roome
    socket.on("room_joined", (data) => {
      data.users.forEach((user) => {
        // Update the opponent if they did join
        if (user.user_id != localStorage.getItem("userID")) {
          setOpponent(user.username);
        }
      });
    });

    // Listen for game start
    socket.on("game_start", () => {
      console.log("GAME START!");

      // Wait 2 seconds before starting the game so that you can inspect the opponent
      setTimeout(() => {
        setGameStart(true);
      }, 2000);
    });
  }, [socket]);

  const gameSetUp = () => {
    drawCard();
    drawCard();
    drawCard();
  };

  return (
    <div style={styles.container}>
      {gameStart ? (
        <div className="gameBoardContainer">
          {/* Opponent's side  */}
          <div className="opponentContainer">
            <div className="playerName">{opponent}</div>
          </div>

          <button onClick={gameSetUp}>Start Match</button>

          {/* Your side  */}
          <div className="youContainer">
            <div className="playerName">{you}</div>
          </div>

          <div>
            {hand.map((card, index) => (
              <div key={index}>{card.name}</div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div>{you}</div>
          {opponent == "" ? (
            <div>Waiting for an opponent...</div>
          ) : (
            <div>
              <div>Opponent Found!</div>
            </div>
          )}
        </div>
      )}
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
