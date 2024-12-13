import React from "react";

import { motion } from "framer-motion";

import "../Styles/selectableCard.css";

const CardDisplay = ({ card }) => {
  return (
    <motion.div
      className="cardContainer"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
    >
      <div className="cardTitle">{card.name}</div>
      <img src={card.img} alt="cardIMG" className="cardIMG" />
      <div className="cardDesc">{card.description}</div>
      <div className="cardQuip">{card.quip}</div>
    </motion.div>
  );
};

export default CardDisplay;
