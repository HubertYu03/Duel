import React, { useEffect, useRef, useState } from "react";
import { data, useParams } from "react-router-dom";
import socket from "../socket";

import { AnimatePresence, motion } from "framer-motion";

import "../Styles/gamePage.css";

import axios from "axios";
import CardInHand from "../Components/CardInHand";

const RoomPage = () => {
  const API_URL = import.meta.env.VITE_API_URL; // Get the API URL from environment variables

  const { roomID } = useParams(); // Room ID

  const [you, setYou] = useState(localStorage.getItem("username")); // You are the username
  const [opponent, setOpponent] = useState("");

  // States for game management
  const [gameStart, setGameStart] = useState(false);
  const [gameSetUpComplete, setGameSetUpComplete] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // States for gameplay
  const [hand, setHand] = useState([]);
  const [currentDeck, setCurrentDeck] = useState([]);
  const [hp, setHp] = useState(20);
  const [playerList, setPlayerList] = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState("");
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // State for play area
  const [inPlayArea, setInPlayArea] = useState(false);

  const playAreaRef = useRef(null);

  // Function to check if card is inside play area
  const checkCardOverPlayArea = (dragTop, dragBottom, dragRight, dragLeft) => {
    if (playAreaRef.current) {
      const rect = playAreaRef.current.getBoundingClientRect();

      const isOverlap = !(
        dragRight < rect.left + window.scrollX ||
        dragLeft > rect.right + window.scrollX ||
        dragBottom < rect.top + window.scrollY ||
        dragTop > rect.bottom + window.scrollY
      );

      // console.log(isOverlap);
      setInPlayArea(isOverlap);
    }
  };

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
  const drawCard = (num) => {
    // Create a new reference of the deck and hand to avoid direct mutation
    let deckState = [...currentDeck]; // Make a copy of currentDeck
    let handState = [...hand]; // Make a copy of hand

    // Draw a card based on the number of times
    for (let i = 0; i < num; i++) {
      const drawnCard = deckState.shift(); // Removes the first card from deckState
      handState.push(drawnCard);
    }

    setHand(handState); // Directly set the new state for hand
    setCurrentDeck(deckState); // Directly set the new state for deck
  };

  const playCard = (card, index) => {
    // Check to see if the card is in the play area
    if (inPlayArea) {
      // Reset play area
      setInPlayArea(false);

      // Check if it is the current player's turn so they can play a card
      if (currentPlayerId == localStorage.getItem("userID")) {
        let handState = [...hand];
        handState.splice(index, 1);

        socket.emit("card_played", {
          card: card,
          room_id: roomID,
          username: localStorage.getItem("username"),
        });

        setHand(handState);
      }
    }
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
    socket.on("game_start", (data) => {
      console.log("GAME START!");

      console.log(data.users);
      setPlayerList(data.users);

      setCurrentPlayerId(data.users[0].user_id);

      // Wait 2 seconds before starting the game so that you can inspect the opponent
      setTimeout(() => {
        setGameStart(true);
      }, 2000);
    });

    // Setting up who goes first
    socket.on("game_first", (data) => {
      console.log(data.user.username + " is going first.");

      drawCard(3);
      setGameSetUpComplete(true);

      // Send an announcement of who is going first for 2 Seconds
      setAnnouncement(data.user.username + "'s Turn");
      setTimeout(() => {
        setAnnouncement("");
      }, 2000);
    });

    // Socket listener for when another player plays a card
    socket.on("card_played_by_opponent", (data) => {
      console.log(data.username + " has played " + data.card.name);
    });

    return () => {
      socket.off("game_first");
    };
  }, [socket, currentDeck]);

  const gameSetUp = () => {
    // On game set up many things need to happen
    // Choose who goes first and tell all users
    console.log(playerList);
    const randomIndex = Math.floor(Math.random() * playerList.length);

    // A random player is selected to go first, and the index starts on them
    setCurrentPlayerId(playerList[randomIndex].user_id);
    setCurrentTurnIndex(randomIndex);

    // Tell the room who is going first
    socket.emit("game_setup", {
      user: playerList[randomIndex],
      turnIndex: randomIndex,
      room_id: roomID,
    });
  };

  return (
    <div style={styles.container}>
      {gameStart ? (
        <div className="gameBoardContainer">
          {/* Opponent's side  */}
          <div className="opponentContainer">
            <div className="playerName">{opponent}</div>
          </div>
          {/* The person who made the lobby will get to start the game */}
          {currentPlayerId == localStorage.getItem("userID") &&
            !gameSetUpComplete && (
              <button onClick={gameSetUp}>Start Match</button>
            )}

          {/* Announcement component */}
          <AnimatePresence>
            {announcement != "" && (
              <motion.div
                className="announcement"
                initial={{
                  opacity: 0,
                  y: -20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 20,
                }}
              >
                {announcement}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Play Area */}
          {inPlayArea ? (
            <div className="playAreaHover" ref={playAreaRef}>
              Drop card to play.
            </div>
          ) : (
            <div className="playArea" ref={playAreaRef}>
              Drag card here to play.
            </div>
          )}

          {/* Your side  */}
          <div className="yourSide">
            <div className="youContainer">
              {/* Hand container */}
              <div className="handContainer">
                {hand.map((card, index) => (
                  <CardInHand
                    key={index}
                    card={card}
                    playCard={playCard}
                    index={index}
                    checkCardOverPlayArea={checkCardOverPlayArea}
                  />
                ))}
              </div>
            </div>
            <div>{you}</div>
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
