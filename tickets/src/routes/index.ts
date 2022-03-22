import { Request, Response, Router } from "express";
import { NotFoundError } from "@ge_tickets/common";
import { Ticket } from "../models/ticket.entity";
const router = Router();

router.get("/api/tickets", async (req: Request, res: Response) => {
  const items = await Ticket.find({ orderId: undefined });

  res.json(items);
});

export { router as indexTicketRouter };
