import React, { useState, useEffect } from "react";
import axios from "axios";
import md5 from "md5";

const CharacterModal = ({ character, onClose }) => {
  const [comics, setComics] = useState(null);
  const [series, setSeries] = useState(null);
  const [stories, setStories] = useState(null);
  const [events, setEvents] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const apiKey = "0b1a64cd0435e620b8a8b731ee78178e";
  const privateKey = "dc0e546de50ee20a7236c29151d4b0ca46e53173";

  const fetchData = async (dataType, url, setState) => {
    if (activeTab === dataType && setState(null)) {
      setActiveTab(null);
      return;
    }

    setActiveTab(dataType);
    setState("loading");

    try {
      const ts = new Date().getTime();
      const hash = md5(ts + privateKey + apiKey);
      const response = await axios.get(url, {
        params: {
          apikey: apiKey,
          ts: ts,
          hash: hash,
          limit: 5, // Adjust limit as needed
        },
      });
      setState(response.data.data.results);
    } catch (error) {
      setState("error");
      console.error(`Error fetching ${dataType}:`, error);
    }
  };

  const fetchComics = () => {
    fetchData("comics", character.comics.collectionURI, setComics);
  };

  const fetchSeries = () => {
    fetchData("series", character.series.collectionURI, setSeries);
  };

  const fetchStories = () => {
    fetchData("stories", character.stories.collectionURI, setStories);
  };

  const fetchEvents = () => {
    fetchData("events", character.events.collectionURI, setEvents);
  };

  return (
    <div className="comic-modal-overlay">
      <div className="comic-modal-content">
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="dark-mode-text">{character.name}</h2>
        {character.description && (
          <p className="dark-mode-text modal-description">
            {character.description}
          </p>
        )}

        <div className="modal-buttons">
          <button
            className={`dark-mode-button modal-info-button ${
              activeTab === "comics" ? "active" : ""
            }`}
            onClick={fetchComics}
          >
            Comics
          </button>
          <button
            className={`dark-mode-button modal-info-button ${
              activeTab === "series" ? "active" : ""
            }`}
            onClick={fetchSeries}
          >
            Series
          </button>
          <button
            className={`dark-mode-button modal-info-button ${
              activeTab === "stories" ? "active" : ""
            }`}
            onClick={fetchStories}
          >
            Stories
          </button>
          <button
            className={`dark-mode-button modal-info-button ${
              activeTab === "events" ? "active" : ""
            }`}
            onClick={fetchEvents}
          >
            Events
          </button>
        </div>

        <div className="modal-details">
          {comics === "loading" && (
            <p className="dark-mode-text">Loading comics...</p>
          )}
          {comics === "error" && (
            <p className="dark-mode-text text-red-500">Error loading comics.</p>
          )}
          {activeTab === "comics" &&
            Array.isArray(comics) &&
            comics.length > 0 && (
              <ul className="dark-mode-text modal-list">
                {comics.map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
              </ul>
            )}
          {activeTab === "comics" &&
            Array.isArray(comics) &&
            comics.length === 0 && (
              <p className="dark-mode-text">
                No comics found for this character.
              </p>
            )}

          {series === "loading" && (
            <p className="dark-mode-text">Loading series...</p>
          )}
          {series === "error" && (
            <p className="dark-mode-text text-red-500">Error loading series.</p>
          )}
          {activeTab === "series" &&
            Array.isArray(series) &&
            series.length > 0 && (
              <ul className="dark-mode-text modal-list">
                {series.map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
              </ul>
            )}
          {activeTab === "series" &&
            Array.isArray(series) &&
            series.length === 0 && (
              <p className="dark-mode-text">
                No series found for this character.
              </p>
            )}

          {stories === "loading" && (
            <p className="dark-mode-text">Loading stories...</p>
          )}
          {stories === "error" && (
            <p className="dark-mode-text text-red-500">
              Error loading stories.
            </p>
          )}
          {activeTab === "stories" &&
            Array.isArray(stories) &&
            stories.length > 0 && (
              <ul className="dark-mode-text modal-list">
                {stories.map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
              </ul>
            )}
          {activeTab === "stories" &&
            Array.isArray(stories) &&
            stories.length === 0 && (
              <p className="dark-mode-text">
                No stories found for this character.
              </p>
            )}

          {events === "loading" && (
            <p className="dark-mode-text">Loading events...</p>
          )}
          {events === "error" && (
            <p className="dark-mode-text text-red-500">Error loading events.</p>
          )}
          {activeTab === "events" &&
            Array.isArray(events) &&
            events.length > 0 && (
              <ul className="dark-mode-text modal-list">
                {events.map((item) =>
                  item.title && item.title.trim() !== "" ? (
                    <li key={item.id}>{item.title}</li>
                  ) : null
                )}
                {events.every(
                  (event) => !event.title || event.title.trim() === ""
                ) && (
                  <p className="dark-mode-text">
                    No event titles available for this character.
                  </p>
                )}
              </ul>
            )}
          {activeTab === "events" &&
            Array.isArray(events) &&
            events.length === 0 && (
              <p className="dark-mode-text">
                No events found for this character.
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default CharacterModal;
