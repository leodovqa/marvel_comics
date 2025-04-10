// ComicModal.js
import React, { useState, useEffect } from "react";
import "./ComicModal.css";

const ComicModal = ({ comic, onClose, handleReadChange }) => {
  if (!comic) return null;
  const [localRead, setLocalRead] = useState(comic.read || false);

  useEffect(() => {
    setLocalRead(comic.read || false);
  }, [comic.read]);

  const handleCheckboxChange = () => {
    const newRead = !localRead;
    handleReadChange(comic.id, newRead);
    setLocalRead(newRead);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <img
          src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
          alt={comic.title}
          className="modal-image"
        />
        <h2 className="modal-title">{comic.title}</h2>
        <p className="modal-description">
          {comic.description || "No description available"}
        </p>
        <label>
          Read:
          <input
            type="checkbox"
            checked={localRead}
            onChange={handleCheckboxChange}
          />
        </label>
      </div>
    </div>
  );
};

export default ComicModal;
