/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVariables } from "./app/config/env";
import { connectRedis } from "./app/config/redis.config";
import seedSuperAdmin from "./utils/seedSuperAdmin";

let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(envVariables.DB_URL);
        console.log("Connected to database!")

        server = app.listen(envVariables.PORT, () => {
            console.log("Server is listening to port 5000");
        })
    } catch (error) {
        console.log(error)
    }
}

(async () => {
    await connectRedis()
    await startServer();
    await seedSuperAdmin();
})()


const closeServer = () => {
    return new Promise<void>((resolve, reject) => {
        if (!server) return resolve();

        server.close((error) => {
            if (error) return reject(error);
            resolve();
        })
    })
}

const gracefulShutdown = async (text: string, error?: Error) => {
    const errorMsg = error instanceof Error ? error.message : String(error || "");
    console.log(`${text} detected, Server shutting down...`, errorMsg);

    try {
        await closeServer();
        console.log("Server closed successfully!");
    } catch (error) {
        console.error("Error closing server", error)
    }
    try {
        await mongoose.disconnect();
        console.log("MongoDB database disconnected!");
    } catch (error) {
        console.error("Error disconnecting MongoDB", error)
    }

    process.exit(error ? 1 : 0);
}

// unhandled rejection error
process.on("unhandledRejection", (error) => gracefulShutdown("Unhandled Rejection", error as Error))

// uncaught rejeection error
process.on("uncaughtException", (error) => gracefulShutdown("Unhandled Exception", error as Error))

// signal termination - sigterm
process.on("SIGTERM", () => gracefulShutdown("SIGTERM Signal"))
process.on("SIGINT", () => gracefulShutdown("SIGINT Signal"))