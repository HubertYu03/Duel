import React from "react";

import { motion } from "framer-motion";
import "../Styles/selectableCard.css";

const AnnouncementCard = ({ card }) => {
  return (
    <motion.div className="cardContainer" style={{ scale: 0.8 }}>
      <div className="cardTitle">{card.name}</div>
      <img src={card.img} alt="cardIMG" className="cardIMG" />
      <div className="cardDesc">{card.description}</div>
      <div className="cardQuip">{card.quip}</div>
    </motion.div>
  );
};

export default AnnouncementCard;
