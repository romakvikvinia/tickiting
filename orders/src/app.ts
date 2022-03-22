import express, { Application } from "express";
import "express-async-errors";
import { json } from "body-parser";
import {
  currentUserMiddleware,
  errorHandler,
  NotFoundError,
} from "@ge_tickets/common";
import cookieSession from "cookie-session";
import { CreateOrderRouter } from "./routes/order.create";
import { ShowOrderRouter } from "./routes/order.show";
import { IndexOrderRouter } from "./routes/order.index";
import { DeleteOrderRouter } from "./routes/order.delete";

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
app.use(CreateOrderRouter);
// show
app.use(ShowOrderRouter);
// index lists
app.use(IndexOrderRouter);
// update order
app.use(DeleteOrderRouter);

app.all("*", () => {
  throw new NotFoundError();
});

// error handler
app.use(errorHandler);

export { app };
