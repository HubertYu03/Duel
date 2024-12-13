import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BuildDeck = () => {
  const { userID } = useParams(); // Get the user ID from the route params
  const API_URL = import.meta.env.VITE_API_URL; // Get the API URL from environment variables

  const [deck, setDeck] = useState([]); // State for the user's deck

  // Fetch the user's current deck
  const fetchUserDeck = () => {
    axios
      .get(`${API_URL}/fetchUserDeck/${userID}`)
      .then((res) => {
        console.log("Deck data:", res.data);
        setDeck(res.data); // Update state with fetched data
      })
      .catch((err) => {
        console.error("Error fetching user deck:", err);
      });
  };

  useEffect(() => {
    fetchUserDeck(); // Fetch the deck when the component mounts
  }, []);

  return (
    <div>
      <h1>Build Your Deck</h1>
      <p>User ID: {userID}</p>
      <ul>
        {deck.map((card, index) => (
          <li key={index}>{card.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default BuildDeck;
