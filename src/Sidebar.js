import React, { forwardRef } from "react";

const Sidebar = forwardRef(
  (
    {
      onClose,
      showMyComics,
      setShowMyComics,
      handleLogout,
      isLoggedIn,
      setCurrentView,
      currentView,
    },
    ref
  ) => {
    const handleSearchClick = () => {
      setShowMyComics(false);
      setCurrentView(null); // Set to default comics search view
      onClose();
    };

    const handleMyComicsClick = () => {
      setShowMyComics(true);
      setCurrentView(null); // Reset other view
      onClose();
    };

    const handleCharactersClick = () => {
      setCurrentView("characters");
      setShowMyComics(false); // Ensure My Comics is closed
      onClose();
    };

    return (
      <div className="side-nav full-height-sidenav" ref={ref}>
        <div className="menu-header">
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
          <span className="menu-text">Menu</span>
        </div>
        <button
          onClick={handleSearchClick}
          className={`search-tab ${
            !showMyComics && currentView !== "characters" ? "active" : ""
          }`}
        >
          Search
        </button>
        <button
          onClick={handleMyComicsClick}
          className={`my-comics-button ${showMyComics ? "active" : ""}`}
        >
          My Comics
        </button>
        {isLoggedIn && (
          <button
            onClick={handleCharactersClick}
            className={`characters-button ${
              currentView === "characters" ? "active" : ""
            }`}
          >
            Characters
          </button>
        )}
        {isLoggedIn && (
          <div className="bottom-logout-container">
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
        {!isLoggedIn && (
          <div className="sidenav-guest-message">
            Please log in to access all features.
          </div>
        )}
      </div>
    );
  }
);

export default Sidebar;
