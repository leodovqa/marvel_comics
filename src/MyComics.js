// MyComics.js
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import ComicModal from "./ComicModal";
import md5 from "md5";
import LoadingSpinner from "./LoadingSpinner";

const MyComics = ({ userId }) => {
  const [readComicsData, setReadComicsData] = useState([]);
  const [comicsDetails, setComicsDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComic, setSelectedComic] = useState(null);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("read_comics")
        .select("*")
        .eq("user_id", userId)
        .eq("read", true);

      if (error) {
        setError(error.message);
      } else {
        setReadComicsData(data);
        await fetchComicDetails(data.map((item) => item.comic_id));
      }
    } catch (err) {
      setError("Failed to fetch read comics.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComicDetails = async (comicIds) => {
    if (comicIds.length === 0) {
      setComicsDetails([]);
      return;
    }

    const apiKey = "0b1a64cd0435e620b8a8b731ee78178e";
    const baseUrl = "https://gateway.marvel.com/v1/public/comics";
    const privateKey = "dc0e546de50ee20a7236c29151d4b0ca46e53173";
    const ts = new Date().getTime();
    const hash = md5(ts + privateKey + apiKey);

    try {
      const details = await Promise.all(
        comicIds.map(async (comicId) => {
          const response = await fetch(
            `${baseUrl}/${comicId}?apikey=${apiKey}&ts=${ts}&hash=${hash}`
          );
          const data = await response.json();
          return data.data.results[0];
        })
      );
      setComicsDetails(details);
    } catch (err) {
      setError("Failed to fetch comic details.");
    }
  };

  const fetchSingleComicDetails = async (comicId) => {
    const apiKey = "0b1a64cd0435e620b8a8b731ee78178e";
    const baseUrl = "https://gateway.marvel.com/v1/public/comics";
    const privateKey = "dc0e546de50ee20a7236c29151d4b0ca46e53173";
    const ts = new Date().getTime();
    const hash = md5(ts + privateKey + apiKey);

    try {
      const response = await fetch(
        `${baseUrl}/${comicId}?apikey=${apiKey}&ts=${ts}&hash=${hash}`
      );
      const data = await response.json();
      return data.data.results[0];
    } catch (err) {
      setError("Failed to fetch comic details.");
      return null;
    }
  };

  const handleComicClick = (comic) => {
    setSelectedComic({ ...comic, read: true });
  };

  const handleCloseModal = () => {
    setSelectedComic(null);
  };

  const handleComicUnchecked = (comicId) => {
    setComicsDetails((prevDetails) =>
      prevDetails.filter((comic) => comic.id !== comicId)
    );
    setReadComicsData((prevReadData) =>
      prevReadData.filter((item) => item.comic_id !== comicId)
    );
  };

  const handleReadChange = async (comicId, checked) => {
    if (checked) {
      const { error } = await supabase
        .from("read_comics")
        .upsert({ user_id: userId, comic_id: comicId, read: true });
      if (error) {
        console.log(error);
      } else {
        // Fetch the comic details again and add it to the existing list
        const comicDetails = await fetchSingleComicDetails(comicId);
        if (comicDetails) {
          setComicsDetails((prevDetails) => [...prevDetails, comicDetails]);
        }
      }
    } else {
      const { error } = await supabase
        .from("read_comics")
        .delete()
        .eq("user_id", userId)
        .eq("comic_id", comicId);
      if (error) {
        console.log(error);
      } else {
        handleComicUnchecked(comicId);
      }
    }
  };

  if (loading)
    return (
      <div className="dark-mode-text">
        <LoadingSpinner />
      </div>
    );
  if (error) return <div className="dark-mode-text text-red-500">{error}</div>;

  return (
    <div className="my-comics-page dark-mode">
      <div className="comics-list columns">
        {comicsDetails.map((comic) => (
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
            <p className="dark-mode-text">Read: Yes</p>
          </div>
        ))}
      </div>
      {selectedComic && (
        <ComicModal
          comic={selectedComic}
          onClose={handleCloseModal}
          handleReadChange={handleReadChange}
          onReadUnchecked={handleComicUnchecked}
        />
      )}
    </div>
  );
};

export default MyComics;
