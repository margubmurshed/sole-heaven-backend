import express, { Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session";
import "./app/config/passport";
import { envVariables } from "./app/config/env";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";

const app = express();

app.use(expressSession({
    secret: envVariables.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: envVariables.FRONTEND_URL,
    credentials: true
}));


app.get("/", (_, res: Response) => {
    res.status(200).json({
        message: "Welcome to Sole Heaven Backend"
    })
})

app.use(globalErrorHandler);
app.use(notFound)


export default app;