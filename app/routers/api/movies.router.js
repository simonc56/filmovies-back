import express from "express";
import moviesController from "../../controllers/moviesController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import controllerWrapper from "../../middlewares/controllerWrapper.js";
import validationMiddleware from "../../middlewares/validationMiddleware.js";
import genericSchema from "../../validation/genericSchemas.js";
import movieSchema from "../../validation/movieSchemas.js";

const router = express.Router();

/**
 * A movie object
 * @typedef {object} Movie
 * @property {number} id - The movie id
 * @property {string} title_fr - The movie title in french
 * @property {string} original_title - The movie original title
 * @property {boolean} adult - The movie adult
 * @property {string} release_date - The movie release date
 * @property {number} budget - The movie budget
 * @property {number} popularity - The movie popularity
 * @property {string} genres - The movie genres
 * @property {string} overview - The movie overview
 * @property {string} poster_path - The movie poster path
 * @property {string} cast - The movie cast
 * @property {string} crew - The movie crew
 */

/**
 * A rating object
 * @typedef {object} Rating
 * @property {number} rating_id - The rating id
 * @property {number} value - The rating value
 */

/**
 * A review object
 * @typedef {object} Review
 * @property {number} review_id - The review id
 * @property {string} content - The review content
 */

/**
 * A movie userdata object
 * @typedef {object} MovieUserdata
 * @property {number} user_id - The user id
 * @property {Rating} rating - The rating object
 * @property {Review} review - The review object
 * @property {boolean} viewed - The viewed status
 * @property {Array<number>} in_playlists - The list of playlists id where the movie is
 */

/**
 * GET /api/movie/genre
 * @summary Get movie genres
 * @tags Movies
 * @return {Array<string>} 200 - success response
 * @return {ApiError} 500 - internal server error response
 * @return {ApiError} 400 - bad input response
 */
router.get("/genre", controllerWrapper(moviesController.getMovieGenres));

/**
 * GET /api/movie/search
 * @summary To search movies
 * @tags Movies
 * @param {string} query.query.required - search query
 * @return {Array<Movie>} 200 - success response
 * @return {ApiError} 400 - bad input response
 * @return {ApiError} 500 - internal server error response
 */
router.get(
  "/search",
  validationMiddleware({ query: movieSchema.getMovieSearch }),
  controllerWrapper(moviesController.getMovieBySearch)
);

/**
 * GET /api/movie/upcoming
 * @summary Get upcoming movies
 * @tags Movies
 * @return {Array<Movie>} 200 - success response
 * @return {ApiError} 400 - bad input response
 * @return {ApiError} 500 - internal server error response
 */
router.get("/upcoming", controllerWrapper(moviesController.getUpcomingMovies));

/**
 * GET /api/movie/nowplaying
 * @summary Get now playing movies
 * @tags Movies
 * @return {Array<Movie>} 200 - success response*
 * @return {ApiError} 400 - bad input response
 * @return {ApiError} 500 - internal server error response
 */
router.get("/nowplaying", controllerWrapper(moviesController.getNowPlayingMovies));

/**
 * GET /api/movie/popular
 * @summary Get popular movies
 * @tags Movies
 * @return {Array<Movie>} 200 - success response
 * @return {ApiError} 400 - bad input response
 * @return {ApiError} 500 - internal server error response
 */
router.get("/popular", controllerWrapper(moviesController.getPopularMovies));

/**
 * GET /api/movie/toprated
 * @summary Get top rated movies
 * @tags Movies
 * @return {Array<Movie>} 200 - success response
 * @return {ApiError} 400 - bad input response
 * @return {ApiError} 500 - internal server error response
 */
router.get("/toprated", controllerWrapper(moviesController.getTopRatedMovies));

/**
 * GET /api/movie/:id
 * @summary Get a movie
 * @tags Movies
 * @param {string} id.params.required - movie id
 * @return {Movie} 200 - success response
 * @return {ApiError} 400 - bad input response
 * @return {ApiError} 500 - internal server error response
 */
router.get(
  "/:id",
  validationMiddleware({ params: genericSchema.paramsId }),
  controllerWrapper(moviesController.getMovieById)
);

/**
 * GET /api/movie/:id/userdata
 * @summary Get userdata about a movie
 * @tags Movies
 * @param {string} id.params.required - movie id
 * @return {MovieUserdata} 200 - success response
 * @return {ApiError} 400 - bad input response
 * @return {ApiError} 500 - internal server error response
 */
router.get(
  "/:id/userdata",
  verifyToken,
  validationMiddleware({ params: genericSchema.paramsId }),
  controllerWrapper(moviesController.getUserdataAboutMovieById)
);

/**
 * GET /api/movie
 * @summary Get movies with parameters
 * @tags Movies
 * @param {string} sort_by.query - Sorting criteria
 *       ['popularity.asc', 'popularity.desc',
 *        'release_date.asc', 'release_date.desc',
 *         'revenue.asc', 'revenue.desc', 'primary_release_date.asc',
 *          'primary_release_date.desc', 'title.asc', 'title.desc',
 *           'vote_average.asc', 'vote_average.desc', 'vote_count.asc', 'vote_count.desc']
 * @param {string} page.query - movie page
 * @param {string} with_genres.query - movie genres
 *        'with_genres' must be a list of positive integers separated by commas
 * @return {Array<Movie>} 200 - success response
 * @return {ApiError} 400 - bad input response
 * @return {ApiError} 500 - internal server error response
 */
router.get(
  "",
  validationMiddleware({ query: movieSchema.getMoviesWithQueries }),
  controllerWrapper(moviesController.getMovies)
);

export default router;
