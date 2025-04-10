import React, { useState, useEffect } from "react";
import axios from "axios";
import md5 from "md5";
import LoadingSpinner from "./LoadingSpinner";
import CharacterModal from "./CharacterModal"; // Import the new modal

const CharactersPage = () => {
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiKey = "0b1a64cd0435e620b8a8b731ee78178e";
  const privateKey = "dc0e546de50ee20a7236c29151d4b0ca46e53173";
  const baseUrl = "https://gateway.marvel.com/v1/public/characters";
  const itemsPerPage = 51;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null); // State for the selected character
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const fetchCharacters = async (letter) => {
    setLoading(true);
    setError(null);
    try {
      const ts = new Date().getTime();
      const hash = md5(ts + privateKey + apiKey);
      const response = await axios.get(baseUrl, {
        params: {
          apikey: apiKey,
          ts: ts,
          hash: hash,
          nameStartsWith: letter,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
        },
      });
      setCharacters(response.data.data.results);
      setTotalPages(Math.ceil(response.data.data.total / itemsPerPage));
      window.scrollTo(0, 0); // Scroll to top after fetching new page
    } catch (err) {
      setError(err.message || "Failed to fetch characters.");
      setCharacters([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLetter) {
      setCurrentPage(1); // Reset to page 1 when a new letter is selected
      fetchCharacters(selectedLetter);
    } else {
      setCharacters([]);
    }
  }, [selectedLetter]);

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    window.scrollTo(0, 0); // Scroll to top after selecting a letter
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (selectedLetter) {
      fetchCharacters(selectedLetter); // Re-fetch with the new page (scrolls to top inside)
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openModal = (character) => {
    setSelectedCharacter(character);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCharacter(null);
    // Remove these lines as these states are managed in CharacterModal
    // setComics(null);
    // setSeries(null);
    // setStories(null);
    // setEvents(null);
  };

  return (
    <div className="characters-page dark-mode">
      <h2 className="dark-mode-text text-2xl font-semibold mb-4">
        Marvel Characters
      </h2>
      <div className="alphabet-index mb-4 characters-page-grid">
        {alphabet.map((letter) => (
          <button
            key={letter}
            className={`dark-mode-button alphabet-button character-card-button ${
              selectedLetter === letter ? "selected" : ""
            }`}
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      {loading && (
        <div className="dark-mode-text">
          <LoadingSpinner />
        </div>
      )}
      {error && <p className="dark-mode-text text-red-500">Error: {error}</p>}

      <div className="char-list columns">
        {" "}
        {characters.map((character) => (
          <div
            key={character.id}
            className="dark-mode-char-card"
            onClick={() => openModal(character)} // Open modal on card click
            style={{ cursor: "pointer" }}
          >
            {" "}
            {character.thumbnail &&
            character.thumbnail.path !==
              "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available" ? (
              <div className="char-image-container">
                <img
                  src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
                  alt={character.name}
                  className="char-image"
                />
              </div>
            ) : (
              <div className="char-image-container">
                <div className="comic-image placeholder">
                  No Image Available
                </div>{" "}
              </div>
            )}
            <h3 className="dark-mode-text">{character.name}</h3>
          </div>
        ))}
      </div>

      {totalPages > 1 && selectedLetter && (
        <div className="dark-mode-pagination">
          <button
            className="dark-mode-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="dark-mode-text">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="dark-mode-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <div className="pagination-bottom-spacer">© Copyright LeoTest</div>
      {showScrollButton && (
        <button className="scroll-to-top-button" onClick={handleScrollToTop}>
          &#8593;
        </button>
      )}

      {isModalOpen && selectedCharacter && (
        <CharacterModal character={selectedCharacter} onClose={closeModal} />
      )}
    </div>
  );
};

export default CharactersPage;
