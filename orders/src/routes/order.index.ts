import { authMiddleware } from "@ge_tickets/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order.entity";

const router = express.Router();

router.get(
  "/api/orders",
  authMiddleware,
  async (req: Request, res: Response) => {
    const orders = await Order.find({ userId: req.user!.id }).populate(
      "ticket"
    );
    res.json(orders);
  }
);

export { router as IndexOrderRouter };
