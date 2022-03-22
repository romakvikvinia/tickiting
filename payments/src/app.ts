import express, { Application } from "express";
import "express-async-errors";
import { json } from "body-parser";
import {
  currentUserMiddleware,
  errorHandler,
  NotFoundError,
} from "@ge_tickets/common";
import cookieSession from "cookie-session";
import { CreatChargeRouter } from "./routes/create";

//routers

const app: Application = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUserMiddleware);
// not found
// create
app.use(CreatChargeRouter);

app.all("*", () => {
  throw new NotFoundError();
});

// error handler
app.use(errorHandler);

export { app };
