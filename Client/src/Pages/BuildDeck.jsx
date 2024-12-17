import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

import socket from "../socket";
import SelectableCard from "../Components/SelectableCard";

import "../Styles/buildDeck.css";
import CardInList from "../Components/CardInList";

const BuildDeck = () => {
  const { userID } = useParams(); // Get the user ID from the route params
  const API_URL = import.meta.env.VITE_API_URL; // Get the API URL from environment variables

  const navigate = useNavigate(); // Navigation object

  const [deck, setDeck] = useState([]); // State for the user's deck
  const [availableCards, setAvailableCards] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch the user's current deck
  const fetchUserDeck = () => {
    axios
      .get(`${API_URL}/fetchUserDeck/${userID}`)
      .then((res) => {
        if (res.data[0].length == 0) {
          setDeck(res.data[0]);
        } else {
          setDeck(res.data); // Update state with fetched data
        }

        // Fetch the available cards
        fetchAvailableCards(res.data);
      })
      .catch((err) => {
        console.error("Error fetching user deck:", err);
      });
  };

  // Fetch available cards
  const fetchAvailableCards = (deck) => {
    axios
      .get(`${API_URL}/fetchAvailableCards`)
      .then((res) => {
        // Save data for preperation
        const cards = res.data;

        const available = [];

        // Set two copies of each card then add to available list
        cards.forEach((card) => {
          available.push(card);
          available.push(card);
        });

        available.sort((a, b) => a.id - b.id);

        if (deck) {
          for (let i = 0; i < deck.length; i++) {
            for (let j = 0; j < available.length; j++) {
              // Remove the first instance of a card from the available cards
              if (deck[i].id == available[j].id) {
                available.splice(j, 1);
                continue;
              }
            }
          }
        }

        console.log(available);

        // Set the state
        setAvailableCards(available);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Function that adds a card to user's deck
  const addToDeck = (card, index) => {
    // Reset errors
    setError("");
    setSuccess("");

    // Update the user's deck
    let curr = [...deck];

    curr.push(card);
    curr.sort((a, b) => a.id - b.id);

    setDeck(curr);

    // Change the available cards
    setAvailableCards((prev) => availableCards.filter((_, i) => i !== index));
  };

  // Function to remove card from deck and return it to the available cards
  const removeFromDeck = (index) => {
    // Reset errors
    setError("");
    setSuccess("");

    let curr = deck;

    curr.splice(index, 1);
    setDeck(curr);

    fetchAvailableCards(curr);
  };

  // Function to save deck to database and update available cards
  const saveDeck = () => {
    // Reset error
    setError("");

    // Check if deck length is enough
    if (deck.length < 20) {
      setError("Not Enough Cards!");
    } else if (deck.length > 20) {
      setError("Too Many Cards!");
    } else {
      // Update database
      axios
        .post(`${API_URL}/updateDeck/${userID}`, deck)
        .then((res) => {
          if (res.data == "success") {
            setSuccess("Successfully Saved Deck!");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  // Function to clear the deck
  const clearDeck = () => {
    // Clear user deck
    setDeck([]);
    fetchAvailableCards([]);
    setError("");
    setSuccess("");
  };

  useEffect(() => {
    // Fetch the user's deck
    fetchUserDeck();
  }, []);

  return (
    <div className="pageContainer">
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

      <div className="buildDeckTitle">DECK EDITOR</div>

      <div className="pageSplit">
        <div className="userDeck">
          {/* Deck length indicator */}
          <div className="yourDeck">
            Your Deck{" "}
            {deck &&
              (deck.length > 20 ? (
                <b
                  style={{
                    color: "red",
                  }}
                >
                  {deck.length}/20:
                </b>
              ) : (
                <b>{deck.length}/20:</b>
              ))}
          </div>

          {/* Button to save deck */}
          <div className="buttonContainer">
            <motion.button
              onClick={saveDeck}
              className="saveButton"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Save Deck
            </motion.button>
            <motion.button
              onClick={clearDeck}
              className="clearButton"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear Deck
            </motion.button>
          </div>

          {/* Error message if any */}
          {error != "" && <div className="warning">{error}</div>}

          {/* Success message if any */}
          {success != "" && <div className="success">{success}</div>}

          {/* Users current deck selection */}
          {deck &&
            (deck.length == 0 ? (
              <div
                style={{
                  color: "gray",
                  textAlign: "center",
                  marginTop: "30px",
                }}
              >
                Click on cards to add to deck!
              </div>
            ) : (
              <div className="userDeckListContainer">
                {deck.map((card, index) => (
                  <CardInList
                    key={index}
                    card={card}
                    index={index}
                    removeCard={removeFromDeck}
                  />
                ))}
              </div>
            ))}
        </div>
        <div className="availableCardsContainer">
          {availableCards.map((card, index) => (
            <SelectableCard
              key={index}
              card={card}
              addToDeck={addToDeck}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuildDeck;
