import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

import socket from "../socket";

import "../Styles/gamePage.css";

import CardInHand from "../Components/CardInHand";
import CardBack from "../Components/CardBack";
import AnnouncementCard from "../Components/AnnouncementCard";

import Shield from "../assets";

const RoomPage = () => {
  const API_URL = import.meta.env.VITE_API_URL; // Get the API URL from environment variables

  const { roomID } = useParams(); // Room ID
  const navigate = useNavigate();

  const [you, setYou] = useState(localStorage.getItem("username")); // You are the username
  const [opponent, setOpponent] = useState("");

  // States for game management
  const [gameStart, setGameStart] = useState(false);
  const [gameSetUpComplete, setGameSetUpComplete] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [battleAnnouncement, setBattleAnnouncement] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState("");
  const [loser, setLoser] = useState("");
  const [gameOverMessage, setGameOverMessage] = useState("");

  // States for gameplay
  const [hand, setHand] = useState([]);
  const [currentDeck, setCurrentDeck] = useState([]);
  const [hp, setHp] = useState(20);
  const [shield, setShield] = useState(0);

  const [playerList, setPlayerList] = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState("");
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  const [playedCard, setPlayedCard] = useState(null);

  // Opponent states
  const [opponentHandCount, setOpponentHandCount] = useState(0);
  const [opponentHp, setOpponentHp] = useState(0);
  const [opponentShield, setOpponentShield] = useState(0);

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
          user_id: localStorage.getItem("userID"),
        });

        setHand(handState);

        // Apply the cards effect
        socket.emit("apply_card_effect", {
          card: card,
          user_id: currentPlayerId,
          room_id: roomID,
        });

        // Once you play a card, end your turn and move on to next player
        socket.emit("turn_over", {
          currentIndex: currentTurnIndex,
          playerList: playerList,
          room_id: roomID,
        });
      }
    }
  };

  const startTurn = () => {
    // Check to see who is going, they will first draw a card
    if (currentPlayerId == localStorage.getItem("userID")) {
      console.log("Your turn");

      // Draw a card and tell all users in the room
      drawCard(1);

      socket.emit("opponent_card_update", {
        count: hand.length + 1,
        room_id: roomID,
        user_id: localStorage.getItem("userID"),
      });
    }
  };

  const makeBattleAnnouncement = (message) => {
    // Make a battle announcement based on the message
    setBattleAnnouncement(message);
    setTimeout(() => {
      setBattleAnnouncement("");
    }, 1500);
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

      // Send an announcement of who is going first for 2 Seconds
      setAnnouncement(data.user.username + "'s Turn");
      setTimeout(() => {
        setAnnouncement("");
      }, 2000);

      // Set going first index
      setCurrentPlayerId(data.user.user_id);
      setCurrentTurnIndex(data.turnIndex);

      // Draw 3 cards and the game can begin
      drawCard(3);
      setGameSetUpComplete(true);

      // Update all users on how many cards and hp we each have
      socket.emit("update_player_inital", {
        hp: hp,
        cardsInHand: 3,
        room_id: roomID,
        user_id: localStorage.getItem("userID"),
      });
    });

    // Socket listener for when another player plays a card
    socket.on("card_played_by_opponent", (data) => {
      // Announce what card was played
      setPlayedCard(data.card);
      setTimeout(() => {
        setPlayedCard(null);
      }, 2000);
    });

    socket.on("receive_player_data_initial", (data) => {
      // Check for opponent's data an update accordingly
      data.forEach((user) => {
        if (user.user_id != localStorage.getItem("userID")) {
          // Set their HP and handcount
          setOpponentHp(user.hp);
          setOpponentHandCount(user.cardsInHand);
        }
      });

      // Start the turn
      startTurn();
    });

    // Listening for opponents change in card count
    socket.on("update_opponent_card_count", (data) => {
      // If the player who had the card count update is not you, it is your opponent
      if (data.user_id != localStorage.getItem("userID")) {
        setOpponentHandCount(data.cardsInHand);
      }
    });

    // Listening for opponent card update on draw
    socket.on("receive_opponent_card_update", (data) => {
      // Checking to see if the person who drew the card was not you
      if (data.user_id != localStorage.getItem("userID")) {
        console.log(data.count);
        setOpponentHandCount(data.count);
      }
    });

    // Listening for turn updates
    socket.on("update_turn_order", (data) => {
      console.log(data.username + " is next.");
      console.log(data.user_id);

      if (gameOver) {
        return; // Prevent any further actions
      }

      setTimeout(() => {
        setAnnouncement(data.username + "'s Turn");

        setTimeout(() => {
          setAnnouncement("");

          // Update current turn data
          setCurrentPlayerId(data.user_id);
          setCurrentTurnIndex(data.index);
        }, 2000);

        // Check to see who is going, they will first draw a card
        if (data.user_id == localStorage.getItem("userID")) {
          console.log("Your turn");

          // Draw a card and tell all users in the room
          drawCard(1);

          socket.emit("opponent_card_update", {
            count: hand.length + 1,
            room_id: roomID,
            user_id: localStorage.getItem("userID"),
          });
        }
      }, 2000);

      socket.emit("start_next_turn", { room_id: roomID });
    });

    // Listening for updating opponents health
    socket.on("update_player_health", (data) => {
      if (data.type == "damage") {
        // If the target of the attack was the opponent, change their life total
        // Otherwise, change you own life total
        if (data.user_id != localStorage.getItem("userID")) {
          setOpponentHp(data.hp);

          // Remove the shield if it was destroyed this turn
          if (data.shieldDestroyed) {
            makeBattleAnnouncement(
              `You dealt ${
                data.amount - opponentShield > 0
                  ? data.amount - opponentShield
                  : "0"
              } damage!`
            );

            setOpponentShield(0);
          } else {
            // Announce how much damage you dealt
            makeBattleAnnouncement(`You dealt ${data.amount} damage!`);
          }
        } else {
          setHp(data.hp);

          // Remove the shield if it was destroyed this turn
          if (data.shieldDestroyed) {
            makeBattleAnnouncement(
              `You took ${
                data.amount - shield > 0 ? data.amount - shield : "0"
              } damage!`
            );

            setShield(0);
          } else {
            // Announce how much damage you took
            makeBattleAnnouncement(`You took ${data.amount} damage!`);
          }
        }
      } else if (data.type == "heal") {
        // Heal the player who used the card
        if (data.user_id == localStorage.getItem("userID")) {
          setHp(data.hp);

          // Announce how much you healed
          makeBattleAnnouncement(`You healed ${data.amount} HP!`);
        } else {
          setOpponentHp(data.hp);

          // Announce how much your opponent healed
          makeBattleAnnouncement(`${opponent} healed ${data.amount} HP!`);
        }
      } else if (data.type == "shield") {
        // Heal the player who used the card
        if (data.user_id == localStorage.getItem("userID")) {
          setShield(data.shield);

          // Announce how much you healed
          makeBattleAnnouncement(
            `You are shielding for ${data.amount} damage!`
          );
        } else {
          setOpponentShield(data.shield);

          // Announce how much you healed
          makeBattleAnnouncement(
            `${opponent} is shielding for ${data.amount} damage!`
          );
        }
      }
    });

    // Listening for when the game ends
    socket.on("game_over", (data) => {
      console.log(data);
      socket.off("update_turn_order");

      setGameOver(true);
      setAnnouncement("GAME OVER!");

      if (localStorage.getItem("userID") == data.user_id) {
        setGameOverMessage("You have been defeated!");
      } else {
        setGameOverMessage("You have defeated " + data.username + "!");
      }
    });

    return () => {
      socket.off("game_first");
      socket.off("update_turn_order"); // Clean up
    };
  }, [socket, currentDeck, hand, opponentHandCount]);

  const gameSetUp = () => {
    // Reset the game
    setGameOver(false);

    // On game set up many things need to happen
    // Choose who goes first and tell all users
    console.log(playerList);
    const randomIndex = Math.floor(Math.random() * playerList.length);

    // Tell the room who is going first
    socket.emit("game_setup", {
      user: playerList[randomIndex],
      turnIndex: randomIndex,
      room_id: roomID,
    });
  };

  // Return to dahboard
  const returntoDashboard = () => {
    // When user leaves room, clean room data in server
    socket.emit("user_leaving_room", {
      user_id: localStorage.getItem("userID"),
      room_id: roomID,
    });

    navigate("/Dashboard");
  };

  return (
    <div style={styles.container}>
      {!gameOver ? (
        gameStart ? (
          <motion.div
            className="gameBoardContainer"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Opponent's side  */}
            <div className="opponentContainer">
              <div>{opponent}</div>
              <div>{opponentHp}</div>
              <div className="opponentCardContainer">
                {Array.from({ length: opponentHandCount }, (_, index) => (
                  <CardBack key={index} />
                ))}
              </div>
            </div>

            {/* The person who made the lobby will get to start the game */}
            {currentPlayerId == localStorage.getItem("userID") &&
              !gameSetUpComplete && (
                <button onClick={gameSetUp}>Start Match</button>
              )}

            {/* Battle Announcement */}
            <AnimatePresence>
              {battleAnnouncement != "" && (
                <motion.div
                  className="battleAnnouncement"
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
                  {battleAnnouncement}
                </motion.div>
              )}
            </AnimatePresence>

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

            {/* Played Card Announcement */}
            <AnimatePresence>
              {playedCard != null && (
                <motion.div
                  className="playedCardAnnoucement"
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
                  <AnnouncementCard card={playedCard} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Play Area */}
            {inPlayArea && gameSetUpComplete ? (
              <motion.div
                className="playAreaHover"
                ref={playAreaRef}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
              >
                Drop card to play.
              </motion.div>
            ) : (
              gameSetUpComplete && (
                <motion.div
                  className="playArea"
                  ref={playAreaRef}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                ></motion.div>
              )
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
                      isDraggable={
                        currentPlayerId == localStorage.getItem("userID")
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="yourSideProfile">
                <div className="playerName">{you}</div>
                {gameSetUpComplete && (
                  <>
                    <progress
                      value={hp}
                      max={20}
                      className="healthBar"
                      style={{
                        width: "200px",
                        height: "30px",
                        border: "1px solid", // Optional: Border to make the health bar more defined
                        backgroundColor: "#e0e0e0", // Light gray background for the empty bar
                      }}
                    ></progress>
                    <div>{hp}/20</div>

                    {/* shield container */}
                    {shield != 0 && (
                      <div className="shieldContainer">
                        <img src={Shield} alt="shield" className="shield" />
                        <div>{shield}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
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
        )
      ) : (
        <div className="gameBoardContainer">
          {/* Announcement component */}
          <AnimatePresence>
            {announcement != "" && (
              <motion.div className="winning">
                <motion.div
                  className="gameOverMessage"
                  initial={{
                    opacity: 0,
                    scale: 1.5,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                >
                  {announcement}
                </motion.div>

                {/* Game message */}
                {gameOverMessage != "" && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 2,
                    }}
                    style={{
                      fontSize: "30px",
                    }}
                  >
                    {gameOverMessage}
                  </motion.div>
                )}

                {/* Buttons for post game options */}
                <motion.div
                  className="postGameButtonContainer"
                  initial={{
                    opacity: 0,
                    y: -20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 3,
                  }}
                >
                  <motion.div
                    onClick={returntoDashboard}
                    className="returnButton"
                    whileHover={{
                      scale: 1.05,
                    }}
                    whileTap={{
                      scale: 0.95,
                    }}
                  >
                    Return To Dashboard
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
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
