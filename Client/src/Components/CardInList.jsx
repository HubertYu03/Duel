import React, { useState } from "react";

import { motion } from "framer-motion";

import "../Styles/cardInList.css";
import CardDisplay from "./CardDisplay";

const CardInList = ({ card, index, removeCard }) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <motion.div
      className="cardListContainer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      onHoverStart={() => setShowPreview(true)}
      onHoverEnd={() => setShowPreview(false)}
      onClick={() => removeCard(index)}
    >
      <div className="cardListTextContainer">
        <div
          style={{
            fontSize: "18px",
          }}
        >
          {card.name}
        </div>
        <div className="cardListType">{card.type} card</div>
      </div>

      {/* Card preview */}
      {showPreview && (
        <div className="cardListPreview">
          <CardDisplay card={card} />
        </div>
      )}
    </motion.div>
  );
};

export default CardInList;
