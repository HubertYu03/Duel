import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import "../Styles/Dashboard.css";

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleNavigateToBuildDeck = () => {
    navigate(`/buildDeck/${user.id}`);
  };

  const handleNavigateToRoomSystem = () => {
    navigate("/roomNavigation");
  };

  return (
    <div style={styles.container}>
      {/* title of the game */}
      <div className="gameTitle">DUEL ⚔️</div>

      {/* Displaying user name */}
      <div className="username">
        Welcome, <b>{user.username}</b>
      </div>
      <div className="battleAwaits">Battle Awaits!</div>

      <div className="dashboardButtonContainers">
        {/* Button for finding a match */}
        <div className="buttonDescContainer">
          <motion.button
            className="dashboardButton"
            style={{
              background: "#48cae4",
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={handleNavigateToRoomSystem}
          >
            Find An Opponent
          </motion.button>
          <div className="buttonDesc">
            Challenge your friends to game to duel to see who will come up on
            top!
          </div>
        </div>

        {/* Button for deck building */}
        <div className="buttonDescContainer">
          <motion.button
            className="dashboardButton"
            style={{
              background: "green",
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={handleNavigateToBuildDeck}
          >
            Build Your Deck
          </motion.button>
          <div className="buttonDesc">
            Edit your arsenal of cards to defeat your next opponent! There are
            endless combinations to choose from!
          </div>
        </div>

        {/* Button for logging out */}
        <div className="buttonDescContainer">
          <motion.button
            className="dashboardButton"
            style={{
              background: "red",
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={onLogout}
          >
            Logout
          </motion.button>
          <div className="buttonDesc">
            It's sad to see you go for now. We hope you see you again!
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
  },
  buttonContainer: {
    marginTop: "20px",
  },
  logoutButton: {
    margin: "5px",
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "#fff",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  buildDeckButton: {
    margin: "5px",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  roomSystemButton: {
    margin: "5px",
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "#fff",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Dashboard;
