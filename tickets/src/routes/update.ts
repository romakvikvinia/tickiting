import { Request, Response, Router } from "express";
import { body } from "express-validator";
import {
  authMiddleware,
  BadRequestError,
  NotFoundError,
  UnAuthorizedError,
  validateRequest,
} from "@ge_tickets/common";
import { Ticket } from "../models/ticket.entity";
import { natsWrapper } from "../nats-wrapper";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-update.publisher";
const router = Router();

router.put(
  "/api/tickets/:id",
  authMiddleware,
  [
    body("title").not().isEmpty().isString().withMessage("Title is require"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("price must be greater than 0 "),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const item = await Ticket.findById(req.params.id);
    if (!item) {
      throw new NotFoundError();
    }

    if (item.userId != req.user!.id) {
      throw new UnAuthorizedError();
    }

    if (item.orderId) {
      throw new BadRequestError("Can not edit reserved ticket");
    }

    item.set({ title, price });
    await item.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: item.id,
      title: item.title,
      price: item.price,
      userId: item.userId,
      version: item.version,
    });

    res.json(item);
  }
);

export { router as updateTicketRouter };
