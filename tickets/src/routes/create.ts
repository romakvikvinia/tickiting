import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { authMiddleware, validateRequest } from "@ge_tickets/common";
import { Ticket } from "../models/ticket.entity";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created.publisher";
import { natsWrapper } from "../nats-wrapper";
const router = Router();

router.post(
  "/api/tickets",
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

    const item = Ticket.build({ title, price, userId: req.user!.id });
    await item.save();
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: item.id,
      title: item.title,
      price: item.price,
      userId: item.userId,
      version: item.version,
    });
    res.status(201).json(item);
  }
);

export { router as createTicketRouter };
