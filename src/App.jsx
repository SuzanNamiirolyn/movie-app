import React, { useEffect, useState } from "react"
import Search from "./components/Search"
import Spinner from "./components/Spinner"
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { updateSearhCount, getTrendingMovies } from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  
  const [trendingError, setTrendingError] = useState(null);

// Debounce the search term to prevent making too many API requests
// by waiting for the user to stop typing for 500ms
  useDebounce( () => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])


  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if (data.response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if(query && data.results.length > 0){
        await updateSearhCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Failed to fetch movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies || []);
      setTrendingError(null);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
      setTrendingError('Failed to load trending movies.');
      setTrendingMovies([]);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
    
    }, [debouncedSearchTerm]);

    
  useEffect(() => {
    loadTrendingMovies();
    
    }, []);

  

  return (
    <main>
    <div className="pattern">

    <div className="wrapper"></div>

    <header>
      <img src="./hero.png" alt="Hero Banner" />
      <h1>Find <span className="text-blue-500">Movies</span> you like without a hussle</h1>

      <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </header>

      <section className="trending">
        <h2>Trending Movies</h2>

        {trendingError ? (
          <p className="text-red-500">{trendingError}</p>
        ) : trendingMovies.length > 0 ? (
          <ul>
            {trendingMovies.map((movie, index) => (
              <li key={movie.$id || movie.id || index}>
                <p>{index + 1}</p>
                <img
                  src={movie.poster_url || '/no-movie.png'}
                  alt={movie.title || 'Trending movie'}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-300">No trending movies yet. Search for movies to build trending data.</p>
        )}
      </section>
      
      <section className="all-movies">
        <h2>All movies</h2>

        {isLoading ? (
          <Spinner/>
        ) : errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>
        ) : (
          <ul>
            {movieList.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
            
            ))}
          </ul>
        )
      }

        
      </section>
    </div>
    </main>
  )
}


export default App;

