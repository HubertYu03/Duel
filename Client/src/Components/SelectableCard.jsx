import React from "react";
import { motion } from "framer-motion";

import "../Styles/selectableCard.css";

const SelectableCard = ({ card, index, addToDeck }) => {
  return (
    <motion.div
      className="cardContainer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => addToDeck(card, index)}
    >
      <div className="cardTitle">{card.name}</div>
      <img src={card.img} alt="cardIMG" className="cardIMG" />
      <div className="cardDesc">{card.description}</div>
      <div className="cardQuip">{card.quip}</div>
    </motion.div>
  );
};

export default SelectableCard;
