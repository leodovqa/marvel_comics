// App.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./styles.css";
import md5 from "md5";
import ComicModal from "./ComicModal";
import { supabase } from "./supabaseClient";
import MyComics from "./MyComics";
import Sidebar from "./Sidebar";
import { createClient } from "@supabase/supabase-js";
import LoadingSpinner from "./LoadingSpinner";
import CharactersPage from "./CharactersPage";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const comicsListRef = useRef(null);
  const searchContainerRef = useRef(null);
  const apiKey = "0b1a64cd0435e620b8a8b731ee78178e";
  const baseUrl = "https://gateway.marvel.com/v1/public/comics";
  const privateKey = "dc0e546de50ee20a7236c29151d4b0ca46e53173";
  const itemsPerPage = 12;
  const suggestionLimit = 5;
  const [selectedComic, setSelectedComic] = useState(null);
  const [readComics, setReadComics] = useState({});
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showMyComics, setShowMyComics] = useState(false);
  const [showSideNav, setShowSideNav] = useState(false);
  const sidebarRef = useRef(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(true);
  const [recentSearchesLoading, setRecentSearchesLoading] = useState(true);
  const [authCompleted, setAuthCompleted] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [issueNumberFilter, setIssueNumberFilter] = useState("");
  const [dateDescriptorFilter, setDateDescriptorFilter] = useState("");
  const [dateRangeStartFilter, setDateRangeStartFilter] = useState("");
  const [dateRangeEndFilter, setDateRangeEndFilter] = useState("");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [currentView, setCurrentView] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (comicsListRef.current) {
        const scrolled = window.scrollY;
        const totalHeight = comicsListRef.current.offsetHeight;
        const scrollThreshold = totalHeight * 0.2;
        setShowScrollButton(scrolled > scrollThreshold);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Adjust delay as needed

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchSuggestions(debouncedSearchTerm);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSuggestions &&
        !event.target.closest(".suggestions-list") &&
        !event.target.closest(".search-container")
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  useEffect(() => {
    if (searchContainerRef.current && showSuggestions) {
      const searchContainerHeight = searchContainerRef.current.offsetHeight;
      const suggestionsList = document.querySelector(".suggestions-list");
      if (suggestionsList) {
        suggestionsList.style.top = `${searchContainerHeight + 8}px`;
      }
    }
  }, [showSuggestions]);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data && data.user) {
        setUserId(data.user.id);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setAuthCompleted(true);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchReadComics();
    }
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSideNav &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest(".hamburger-button")
      ) {
        setShowSideNav(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSideNav]);

  useEffect(() => {
    if (authCompleted && userId) {
      const fetchRecentSearchesFromDb = async () => {
        setRecentSearchesLoading(true);
        const { data, error } = await supabase.rpc("get_recent_searches", {
          // Use the imported 'supabase' client
          user_id_input: userId,
        });
        if (error) {
          console.error("Error fetching recent searches:", error);
          console.error("Fetch error details:", JSON.stringify(error, null, 2));
          setRecentSearchesLoading(false);
        } else {
          const searches = data.map((item) => item.search_term);
          setRecentSearches(searches);
          setRecentSearchesLoading(false);
        }
      };
      fetchRecentSearchesFromDb();
    }
  }, [authCompleted, userId]);

  useEffect(() => {}, [showRecentSearches]);

  const cleanSearchTerm = (term) => {
    return term
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/gi, "");
  };

  const fetchSuggestions = async (term) => {
    try {
      const ts = new Date().getTime();
      const hash = md5(ts + privateKey + apiKey);
      const cleanedTerm = cleanSearchTerm(term);
      const response = await axios.get(baseUrl, {
        params: {
          apikey: apiKey,
          ts: ts,
          hash: hash,
          titleStartsWith: cleanedTerm,
          limit: suggestionLimit,
        },
      });
      setSuggestions(response.data.data.results);
      setShowSuggestions(true);
    } catch (err) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const fetchComics = async (searchTerm, page, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const ts = new Date().getTime();
      const hash = md5(ts + privateKey + apiKey);
      const cleanedSearchTerm = cleanSearchTerm(searchTerm);
      const params = {
        apikey: apiKey,
        ts: ts,
        hash: hash,
        offset: (page - 1) * itemsPerPage,
        limit: itemsPerPage,
        ...filters,
      };

      if (cleanedSearchTerm) {
        params.title = cleanedSearchTerm;
      }

      let response = await axios.get(baseUrl, { params });

      if (response.data.data.results.length === 0 && cleanedSearchTerm) {
        const fallbackParams = {
          ...params,
          title: undefined,
          titleStartsWith: cleanedSearchTerm,
        };
        response = await axios.get(baseUrl, { params: fallbackParams });
      }

      setComics(response.data.data.results);
      setTotalPages(Math.ceil(response.data.data.total / itemsPerPage));

      if (response.data.data.results.length > 0) {
        if (userId) {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();
          if (session) {
            const { error } = await supabase
              .from("recent_searches")
              .insert(
                { user_id: session.user.id, search_term: searchTerm },
                { returning: "minimal" }
              );
            if (error) {
              console.error("Error saving search term:", error);
              console.error(
                "Insert error details:",
                JSON.stringify(error, null, 2)
              );
            } else {
              console.log("Search term saved to DB:", searchTerm);
            }
          } else {
            console.log("No active session:", sessionError);
          }
        }
      }

      if (response.data.data.results.length === 0) {
        setError(
          `No results found for "${searchTerm}". Please try a broader search or a variation of the title.`
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          `No results found for "${searchTerm.trim()}" with the applied filters.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowRecentSearches(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setComics([]);
    setError(null);
    setPage(1);
    setTotalPages(1);
    setSuggestions([]);
    setShowSuggestions(false);
    setShowRecentSearches(true);
  };

  const handlePagination = (newPage) => {
    setPage(newPage);
    fetchComics(searchTerm, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyFilters = () => {
    setPage(1);
    const filters = getActiveFilters();
    fetchComics(searchTerm, 1, filters); // Pass '1' as the currentPage
    setShowFilterOptions(false);
  };

  const getActiveFilters = () => {
    const filters = {};
    if (issueNumberFilter) {
      filters.issueNumber = issueNumberFilter;
    }
    if (dateDescriptorFilter) {
      filters.dateDescriptor = dateDescriptorFilter;
      if (dateDescriptorFilter === "dateRange") {
        if (dateRangeStartFilter) {
          filters.dateRange = dateRangeStartFilter;
          if (dateRangeEndFilter) {
            filters.dateRange += `,${dateRangeEndFilter}`;
          }
        }
      }
    }
    return filters;
  };

  const saveRecentSearch = async (userId, searchTerm) => {
    try {
      const { data, error } = await supabase
        .from("recent_searches")
        .insert([{ user_id: userId, search_term: searchTerm }]);

      if (error) {
        console.error("Error saving recent search:", error);
      } else {
        console.log("Search term saved to DB:", searchTerm);
      }
    } catch (error) {
      console.error("An error occurred while saving recent search:", error);
    }
  };

  const handleSearchClick = () => {
    setPage(1);
    const filters = getActiveFilters();
    fetchComics(searchTerm, 1, filters); // Pass '1' as the currentPage
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowSuggestions(false);
    setShowRecentSearches(false);
    if (isLoggedIn && userId && searchTerm.trim()) {
      saveRecentSearch(userId, searchTerm);
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuggestionClick = (title) => {
    let trimmedTitle = title;
    trimmedTitle = trimmedTitle.replace(/\s*\([^)]*\)/g, "");
    trimmedTitle = trimmedTitle.replace(/\s*#\d+/g, "");
    setSearchTerm(trimmedTitle.trim());
    setShowSuggestions(false);
    setShowRecentSearches(false);
  };

  const handleComicClick = (comic) => {
    setSelectedComic({ ...comic, read: readComics[comic.id] || false });
  };

  const handleCloseModal = () => {
    setSelectedComic(null);
  };

  const fetchReadComics = async () => {
    const { data, error } = await supabase
      .from("read_comics")
      .select("*")
      .eq("user_id", userId);
    if (error) {
    } else {
      const readComicsMap = {};
      data.forEach((item) => {
        readComicsMap[item.comic_id] = item.read;
      });
      setReadComics(readComicsMap);
    }
  };

  const handleReadChange = async (comicId) => {
    if (!userId) {
      return;
    }
    const newReadStatus = !readComics[comicId];
    setReadComics({ ...readComics, [comicId]: newReadStatus });

    if (newReadStatus) {
      // Comic is checked (read), insert/update
      const { error } = await supabase
        .from("read_comics")
        .upsert({ user_id: userId, comic_id: comicId, read: newReadStatus });

      if (error) {
      } else {
        if (selectedComic && selectedComic.id === comicId) {
          setSelectedComic({ ...selectedComic, read: newReadStatus });
        }
      }
    } else {
      // Comic is unchecked (not read), delete the row
      const { error } = await supabase
        .from("read_comics")
        .delete()
        .eq("user_id", userId)
        .eq("comic_id", comicId);

      if (error) {
      } else {
        if (selectedComic && selectedComic.id === comicId) {
          setSelectedComic({ ...selectedComic, read: newReadStatus });
        }
      }
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setAuthError("Please enter both email and password.");
      return;
    }

    try {
      setAuthError("");
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      if (error) {
        setAuthError(error.message);
      } else {
        window.location.reload();
      }
    } catch (error) {
      setAuthError("An unexpected error occurred.");
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setAuthError("Please enter both email and password.");
      return;
    }

    try {
      setAuthError("");
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        setAuthError(error.message);
      } else {
        window.location.reload();
      }
    } catch (error) {
      setAuthError("An unexpected error occurred.");
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
    } else {
      window.location.reload();
    }
  };

  const handleClearRecentSearches = async () => {
    if (userId) {
      const { error } = await supabase
        .from("recent_searches")
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error("Error clearing recent searches:", error);
      } else {
        setRecentSearches([]);
      }
    }
  };

  return (
    <div className="App dark-mode">
      <div className="top-bar">
        <button
          className="hamburger-button"
          onClick={() => setShowSideNav(!showSideNav)}
        >
          ☰
        </button>
        <div className="search-warning dark-mode-text text-3xl font-bold text-center py-4">
          Marvel Comics DB
        </div>
      </div>
      {showSideNav && (
        <Sidebar
          ref={sidebarRef}
          onClose={() => setShowSideNav(false)}
          showMyComics={showMyComics}
          setShowMyComics={setShowMyComics}
          handleLogout={handleLogout}
          isLoggedIn={isLoggedIn}
          setCurrentView={setCurrentView}
          currentView={currentView} // Make sure this is still being passed
        />
      )}
      {!isLoggedIn ? (
        <div className="flex items-center justify-center h-screen">
          <div className="auth-container-modal">
            <h2 className="dark-mode-text text-2xl font-semibold mb-6 text-center">
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />
            {authError && <p className="auth-error-message">{authError}</p>}
            <button
              onClick={isSignUp ? handleSignUp : handleSignIn}
              className="auth-button"
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
            <p className="dark-mode-text mt-4 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="auth-switch-button"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Create one"}
              </button>
            </p>
          </div>
        </div>
      ) : showMyComics ? (
        <MyComics userId={userId} onBack={() => setShowMyComics(false)} />
      ) : (
        <div>
          {currentView === "characters" ? (
            <CharactersPage />
          ) : (
            <div>
              <div className="dark-mode-search" ref={searchContainerRef}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search for comics..."
                  className="dark-mode-input"
                />
                <button onClick={handleClearSearch} className="clear-btn">
                  &times;
                </button>
                <button
                  onClick={handleSearchClick}
                  className="dark-mode-button"
                >
                  Search
                </button>
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion.title)}
                    >
                      {suggestion.title}
                    </li>
                  ))}
                </ul>
              )}
              {showRecentSearches &&
                !recentSearchesLoading &&
                recentSearches.length > 0 && (
                  <ul className="suggestions-list">
                    {recentSearches.map((search, index) => (
                      <li
                        key={index}
                        onClick={() => handleSuggestionClick(search)}
                      >
                        {search}
                      </li>
                    ))}
                  </ul>
                )}
              {showRecentSearches && recentSearchesLoading && (
                <div className="dark-mode-text">
                  <LoadingSpinner />
                </div>
              )}
              {showRecentSearches && recentSearches.length > 0 && (
                <button
                  onClick={handleClearRecentSearches}
                  className="clear-btn"
                >
                  Clear Recent Searches
                </button>
              )}
              {loading && (
                <div className="dark-mode-text">
                  <LoadingSpinner />
                </div>
              )}
              {error && (
                <div className="dark-mode-text text-red-500">{error}</div>
              )}
              <div className="comics-list columns" ref={comicsListRef}>
                {comics.map((comic) => (
                  <div
                    key={comic.id}
                    className="dark-mode-comic-card"
                    onClick={() => handleComicClick(comic)}
                  >
                    <img
                      src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
                      alt={comic.title}
                      className="comic-image"
                    />
                    <h3 className="dark-mode-text">{comic.title}</h3>
                    <p className="dark-mode-text">
                      {comic.description || "No description available"}
                    </p>
                    <p className="dark-mode-text">
                      Read: {readComics[comic.id] ? "Yes" : "No"}
                    </p>
                  </div>
                ))}
              </div>
              {isLoggedIn && (
                <ComicModal
                  comic={selectedComic}
                  onClose={handleCloseModal}
                  handleReadChange={handleReadChange}
                />
              )}
              {totalPages > 1 && (
                <div className="dark-mode-pagination">
                  <button
                    className="dark-mode-button"
                    onClick={() => handlePagination(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <span className="dark-mode-text">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="dark-mode-button"
                    onClick={() => handlePagination(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
              <div className="pagination-bottom-spacer">
                © Copyright LeoTest
              </div>
              {showScrollButton && (
                <button
                  className="scroll-to-top-button"
                  onClick={handleScrollToTop}
                >
                  &#8593;
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
