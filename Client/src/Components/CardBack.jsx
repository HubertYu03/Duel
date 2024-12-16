import React from "react";

import { motion } from "framer-motion";

import "../Styles/cardBack.css";

const CardBack = () => {
  return (
    <motion.div
      className="cardBackContainer"
      initial={{
        x: -20,
        opacity: 0,
      }}
      animate={{
        x: 0,
        opacity: 1,
      }}
    >
      <div className="cardBackText">Duel ⚔️</div>
    </motion.div>
  );
};

export default CardBack;
