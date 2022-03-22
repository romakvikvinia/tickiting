import { Router } from "express";
import { authMiddleware } from "@ge_tickets/common";
import { currentUserMiddleware } from "@ge_tickets/common";
const router = Router();

router.get(
  "/api/users/current",
  currentUserMiddleware,
  authMiddleware,
  (req, res) => {
    res.json({ user: req.user });
  }
);

export { router as CurrentUserRouter };
