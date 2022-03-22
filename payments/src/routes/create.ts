import express, { Request, Response } from "express";
import { body } from "express-validator";

import {
  authMiddleware,
  BadRequestError,
  NotFoundError,
  OrderStatus,
  UnAuthorizedError,
  validateRequest,
} from "@ge_tickets/common";
import { Order } from "../models/Order";
import { stripe } from "../stripe";
import { Payment } from "../models/Pyament";
import { natsWrapper } from "../nats-wrapper";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created.publisher";

const router = express.Router();

router.post(
  "/api/payments",
  authMiddleware,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.user!.id) {
      throw new UnAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Can not pay for cancelled order");
    }

    const charge = await stripe.charges.create({
      amount: order.price * 1000,
      currency: "usd",
      source: token,
      // description:""
    });

    const payment = Payment.build({ orderId, stripeId: charge.id });
    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).json(payment);
  }
);

export { router as CreatChargeRouter };
