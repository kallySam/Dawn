import { useState, useEffect } from 'react';
import './App.css';

const API_KEY = 'ae373d90838494833ad709080535c46a';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingMovies();
  }, []);

  const fetchTrendingMovies = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
      );
      const data = await response.json();
      const moviesWithDetails = await Promise.all(
        data.results.map(async (movie) => {
          const details = await fetchMovieDetails(movie.id);
          return {
            id: movie.id,
            title: movie.title,
            poster: `${IMAGE_BASE_URL}${movie.poster_path}`,
            backdrop: `${IMAGE_BASE_URL}${movie.backdrop_path}`,
            rating: movie.vote_average,
            year: new Date(movie.release_date).getFullYear(),
            genres: details.genres.map(genre => genre.name.toLowerCase()),
            overview: movie.overview
          };
        })
      );
      setMovies(moviesWithDetails);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      setLoading(false);
    }
  };

  const fetchMovieDetails = async (movieId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return { genres: [] };
    }
  };

  const fetchMovieTrailer = async (movieId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
      );
      const data = await response.json();
      const trailer = data.results.find(
        video => video.type === 'Trailer' && video.site === 'YouTube'
      );
      return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
    } catch (error) {
      console.error('Error fetching trailer:', error);
      return null;
    }
  };

  const handleMovieClick = async (movie) => {
    setSelectedMovie(movie);
    const trailerUrl = await fetchMovieTrailer(movie.id);
    setTrailer(trailerUrl);
  };

  const closeTrailer = () => {
    setSelectedMovie(null);
    setTrailer(null);
  };

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const genres = [
    { id: 'all', name: 'All Genres' },
    { id: 'action', name: 'Action' },
    { id: 'adventure', name: 'Adventure' },
    { id: 'animation', name: 'Animation' },
    { id: 'comedy', name: 'Comedy' },
    { id: 'drama', name: 'Drama' },
    { id: 'horror', name: 'Horror' },
    { id: 'sci-fi', name: 'Sci-Fi' },
    { id: 'thriller', name: 'Thriller' }
  ];

  const handleGenreClick = (genreId) => {
    setSelectedGenre(genreId);
  };

  const genreFilteredMovies = selectedGenre === 'all' 
    ? movies 
    : movies.filter(movie => movie.genres.includes(selectedGenre));

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-logo">
          <img src="/logo.svg" alt="MovieBazer Logo" />
          <span>Movies Bazar</span>
        </div>
        <div className="nav-links">
          <a href="#" className="active">Home</a>
          <a href="#explore-section">Explore</a>
          <a href="#genre-section">Genre</a>
          <a href="#">News</a>
          <a href="#">Movies</a>
          <a href="#">TV Shows</a>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <h1>FIND MOVIES</h1>
            <h2>TV SHOWS AND MORE</h2>
            <p>Discover the latest and greatest movies from around the world. Watch trailers, read reviews, and find your next favorite film.</p>
            <button className="watch-tutorial">
              <span>Watch Tutorial</span>
            </button>
          </div>
          <div className="hero-slider">
            {/* Featured movie posters will go here */}
          </div>
        </section>

        <section className="trending">
          <div className="section-header">
            <h2>Trending</h2>
            <a href="#explore-section" className="see-more">See More</a>
          </div>
          <div className="movies-row">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              filteredMovies.map(movie => (
                <div 
                  key={movie.id} 
                  className="movie-card"
                  onClick={() => handleMovieClick(movie)}
                >
                  <div className="movie-poster">
                    <img src={movie.poster} alt={movie.title} />
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <div className="movie-meta">
                        <span className="year">{movie.year}</span>
                        <span className="rating">★ {movie.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section id="explore-section" className="explore">
          <div className="section-header">
            <h2>Explore Movies</h2>
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="movies-grid">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : filteredMovies.length > 0 ? (
              filteredMovies.map(movie => (
                <div 
                  key={movie.id} 
                  className="movie-card"
                  onClick={() => handleMovieClick(movie)}
                >
                  <div className="movie-poster">
                    <img src={movie.poster} alt={movie.title} />
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <div className="movie-meta">
                        <span className="year">{movie.year}</span>
                        <span className="rating">★ {movie.rating.toFixed(1)}</span>
                      </div>
                      <div className="movie-genres">
                        {movie.genres.map((genre, index) => (
                          <span key={index} className="genre-tag">{genre}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <h2>No movies found</h2>
                <p>Try adjusting your search</p>
              </div>
            )}
          </div>
        </section>

        <section id="genre-section" className="genre">
          <div className="section-header">
            <h2>Browse by Genre</h2>
          </div>
          <div className="genres-container">
            {genres.map(genre => (
              <button
                key={genre.id}
                className={`genre-btn ${selectedGenre === genre.id ? 'active' : ''}`}
                onClick={() => handleGenreClick(genre.id)}
              >
                {genre.name}
              </button>
            ))}
          </div>
          <div className="movies-grid">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : genreFilteredMovies.length > 0 ? (
              genreFilteredMovies.map(movie => (
                <div 
                  key={movie.id} 
                  className="movie-card"
                  onClick={() => handleMovieClick(movie)}
                >
                  <div className="movie-poster">
                    <img src={movie.poster} alt={movie.title} />
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <div className="movie-meta">
                        <span className="year">{movie.year}</span>
                        <span className="rating">★ {movie.rating.toFixed(1)}</span>
                      </div>
                      <div className="movie-genres">
                        {movie.genres.map((genre, index) => (
                          <span key={index} className="genre-tag">{genre}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <h2>No movies found</h2>
                <p>Try selecting a different genre</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {selectedMovie && (
        <div className="modal-overlay" onClick={closeTrailer}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={closeTrailer}>×</button>
            <h2>{selectedMovie.title}</h2>
            {trailer ? (
              <div className="trailer-container">
                <iframe
                  src={trailer}
                  title={`${selectedMovie.title} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <p>No trailer available</p>
            )}
            <p className="movie-overview">{selectedMovie.overview}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
