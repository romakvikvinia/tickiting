import express, { Application } from "express";
import "express-async-errors";
import { json } from "body-parser";
import {
  currentUserMiddleware,
  errorHandler,
  NotFoundError,
} from "@ge_tickets/common";
import cookieSession from "cookie-session";
import { createTicketRouter } from "./routes/create";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";

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
app.use(createTicketRouter);
// show
app.use(showTicketRouter);
// index lists
app.use(indexTicketRouter);
// update ticket
app.use(updateTicketRouter);

app.all("*", () => {
  throw new NotFoundError();
});

// error handler
app.use(errorHandler);

export { app };
