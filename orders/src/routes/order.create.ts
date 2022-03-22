import mongoose from "mongoose";
import express, { Request, Response } from "express";
import {
  authMiddleware,
  BadRequestError,
  NotFoundError,
  OrderStatus,
  validateRequest,
} from "@ge_tickets/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket.entity";
import { Order } from "../models/order.entity";
import { OrderCreatePublisher } from "../events/publishers/order-cancelled.publisher";
import { natsWrapper } from "../nats-wrapper";
const router = express.Router();

const EXPIRATION_WINDOW_TIME = 1 * 60;

router.post(
  "/api/orders",
  authMiddleware,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("ticketId is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    // find the ticket teh user trying to order in the database
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) throw new NotFoundError();
    // make sure that his ticket is not already reserved

    if (await ticket.isReserved())
      throw new BadRequestError("Ticket already reserved");

    // Calculate expires date for this ticket
    const expiration = new Date();
    expiration.toLocaleString("ka-GE", { timeZone: "Asia/Tbilisi" });
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_TIME);

    // Build the order and save it  database

    const order = Order.build({
      ticket,
      userId: req.user!.id,
      expiresAt: expiration,
      status: OrderStatus.Created,
    });
    await order.save();
    // Publish an event that an order was created
    new OrderCreatePublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
      // version: order
    });
    res.status(201).json(order);
  }
);

export { router as CreateOrderRouter };
