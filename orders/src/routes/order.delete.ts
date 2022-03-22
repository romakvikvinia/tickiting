import { authMiddleware, NotFoundError } from "@ge_tickets/common";
import express, { Request, Response } from "express";
import { OrderCancelledPublisher } from "../events/publishers/order-created.publisher";
import { Order, OrderStatus } from "../models/order.entity";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  authMiddleware,
  async (req: Request, res: Response) => {
    const order = await Order.findOne({
      userId: req.user!.id,
      id: req.params.orderId,
    }).populate("ticket");
    if (!order) throw new NotFoundError();
    order.status = OrderStatus.Cancelled;
    await order.save();
    // publishing an event
    new OrderCancelledPublisher(natsWrapper.client).publish({
      orderId: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });
    res.status(204).json(order);
  }
);

export { router as DeleteOrderRouter };
