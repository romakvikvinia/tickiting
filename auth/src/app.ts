import express, { Application } from "express";
import "express-async-errors";
import { json } from "body-parser";
import { errorHandler, NotFoundError } from "@ge_tickets/common";
import cookieSession from "cookie-session";

//routers
import { CurrentUserRouter } from "./routes/current-user";
import { SignUpRouter } from "./routes/signup";
import { SignInRouter } from "./routes/signin";
import { SignOutRouter } from "./routes/signout";

const app: Application = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

// current user rout register
app.use(CurrentUserRouter);
// current user sign up
app.use(SignUpRouter);
// current user sign in
app.use(SignInRouter);
// current user sign out
app.use(SignOutRouter);

// not found

app.all("*", () => {
  throw new NotFoundError();
});

// error handler
app.use(errorHandler);

export { app };
