import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import rateLimiter from "./middlewares/rateLimiteMiddleware.js";
import bodySanitizer from "./middlewares/sanitizeMiddleware.js";
import router from "./routers/index.router.js";
import { initSwagger } from "./services/swagger.js";

const app = express();
// Initilise Swagger
initSwagger(app);
// autorise cors from the env variable
app.use(cors({ origin: process.env.CORS_ORIGIN.split(",") || "", credentials: true, maxAge: 600 }));
//parse json and urlencoded data and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// rate limiter middleware to limit the number of request to the api check the rateLimiter middleware
app.use(rateLimiter);
// sanitize the request body check the bodySanitizer middleware
app.use(bodySanitizer);

app.use(router);
// error middleware check if the error is an instance of ApiError and return the error
app.use(errorMiddleware);

export default app;
