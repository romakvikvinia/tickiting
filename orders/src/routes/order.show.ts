import { authMiddleware, NotFoundError } from "@ge_tickets/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order.entity";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  authMiddleware,
  async (req: Request, res: Response) => {
    const order = await Order.findOne({
      userId: req.user!.id,
      id: req.params.orderId,
    }).populate("ticket");

    if (!order) throw new NotFoundError();

    res.json(order);
  }
);

export { router as ShowOrderRouter };
