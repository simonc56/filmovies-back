import schema from "../validation/movieSchemas.js";
import { sequelize } from "../models/associations.js";
import validateData from "../validation/validator.js";
import { fetchMovieTMDB } from "../services/axios.js";
import axios from "axios";
import querystring from "node:querystring";

const moviesController = {    
  async getMoviesById(req, res) {
    try  {
      const id = parseInt(req.params.id); 
      // Validate the id parameter   
      const  { parsedData , errors }= validateData(id, schema.getId);
      // If there are errors, return a 400 response with the errors
      if (errors) {
        return res.status(400).json({status: "fail", error: errors });
      }
      // Fetch the movie from the TMDB API
      const movie = await fetchMovieTMDB(`https://api.themoviedb.org/3/movie/${parsedData}?language=fr-FR`);
      // If the response is an error, return a 400 response with the error message
      if (axios.isAxiosError(movie)) {
        return res.status(400).json({status: "fail", error: movie.message });
      }      
      // Fetch the cast of the movie from the TMDB API
      const cast = await fetchMovieTMDB(`https://api.themoviedb.org/3/movie/${parsedData}/credits?language=fr-FR`);
      // doing a query to get the reviews of the movie with user information
      const reviews = await sequelize.query(`
                SELECT "review".id AS review_id, "review".content,  "user".email AS user_email, "user".firstname AS user_firstname, "user".lastname AS user_lastname,"media".id
                FROM media
                JOIN "review" ON "media".id = "review".media_id
                JOIN "user" ON review.user_id = "user".id
                WHERE "media".tmdb_id = :tmdb_id;
            `, {
        replacements: { tmdb_id: parsedData },
        type: sequelize.QueryTypes.SELECT
      });       
      // restructered data to send to the client                  
      const data = {
        tmdb_id: movie.id,
        id: reviews.length > 0 ? reviews[0].id : null,
        title_fr: movie.title,
        status: movie.status,
        original_title: movie.original_title,
        adult: movie.adult,
        original_language: movie.original_language,               
        release_date: movie.release_date,
        runtime: movie.runtime,
        budget: movie.budget,
        popularity: movie.popularity,
        rating: movie.vote_average,
        country: movie.origin_country,
        genres: movie.genres,
        tagline : movie.tagline,
        overview: movie.overview,
        poster_path: movie.poster_path ?`https://image.tmdb.org/t/p/w300_and_h450_bestv2/${movie.poster_path}` : null,
        cast: cast.cast.map(actor => {
          return { 
            id : actor.cast_id,
            name: actor.name, 
            character: actor.character, 
            profile_path: actor.profile_path ? `https://image.tmdb.org/t/p/w300_and_h300_bestv2${actor.profile_path}` : null }; }).slice(0,5),
        crew: cast.crew
        // i filter for getting only the director of the movie
          .filter(crew => crew.job === "Director")
          .map(crew => {
            return {
              id: crew.id,
              name: crew.name,
              job: crew.job,
              profile_path: crew.profile_path ? `https://image.tmdb.org/t/p/w300_and_h300_bestv2${crew.profile_path}` : null
            };
          }),
        reviews: reviews 
      };            
      // return the data to the client
      return res.json({status: "success", data: data });
    }
    catch (error) {
      return res.status(400).json( {status : "fail", error :error.message});
    }
  },
  async getMovies(req, res) {
    try {
      const {parsedData, errors} = validateData(req.query, schema.getMoviesWithQueries); 
      if (errors) {
        return res.status(400).json({status: "fail", error: errors });
      }            
      // node function to convert the object to a query string u need to import querystring
      const query = querystring.stringify(parsedData);   
      const moviesFetchFromTheApi= await fetchMovieTMDB(`https://api.themoviedb.org/3/discover/movie?language=fr-FR&${query}`);
      // if the response is an error, return a 400 response with the error message
      if (!moviesFetchFromTheApi.results) {
        return res.status(400).json({status: "fail", error: "No page found" });
      }
      const categoriesFetchFromTheapi = await fetchMovieTMDB("https://api.themoviedb.org/3/genre/movie/list?language=fr");
      // if movies exist in the response, restructure the data to send to the client
      const movies = moviesFetchFromTheApi.results.map(movie => {
        return {
          tmdb_id: movie.id,
          title_fr: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w300_and_h450_bestv2${movie.poster_path}` : null, 
          // i map the genre_ids to get the genre name and id
          genres: movie.genre_ids ? movie.genre_ids.map(genre_id => { 
            // i find the genre with the genre_id
            const genre = categoriesFetchFromTheapi.genres.find(category => category.id === genre_id);
            return { id: genre.id, name: genre.name };
          }) : null,        
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,     
        };
      });
      return res.json({status: "success", data: movies });
    } catch (error) {
      return res.status(400).json({status :"fail", error: error.message});
    }
  } 
};

export default moviesController;