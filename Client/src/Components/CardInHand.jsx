import React, { useRef } from "react";

import { AnimatePresence, motion } from "framer-motion";

import "../Styles/cardInHand.css";

const CardInHand = ({
  card,
  index,
  playCard,
  checkCardOverPlayArea,
  isDraggable,
}) => {
  const cardRef = useRef(null);

  const getPosition = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();

      checkCardOverPlayArea(rect.top, rect.bottom, rect.right, rect.left);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={cardRef}
        className="cardContainerInHand"
        whileHover={{
          scale: 1.1,
          y: -20,
        }}
        whileTap={{
          scale: 0.95,
        }}
        whileDrag={{
          cursor: "grab",
        }}
        initial={{
          opacity: 0,
          x: 20,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        exit={{
          opacity: 0,
        }}
        drag={isDraggable}
        dragSnapToOrigin={true}
        onDrag={() => getPosition()}
        onDragEnd={() => playCard(card, index)}
      >
        <div className="cardTitleInHand">{card.name}</div>
        <img
          src={card.img}
          alt="cardIMG"
          className="cardIMGInHand"
          draggable={false}
        />
        <div className="cardDescInHand">{card.description}</div>
        <div className="cardQuipInHand">{card.quip}</div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CardInHand;
