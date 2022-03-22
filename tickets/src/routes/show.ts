import { Request, Response, Router } from "express";
import { NotFoundError } from "@ge_tickets/common";
import { Ticket } from "../models/ticket.entity";
const router = Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const item = await Ticket.findById(req.params.id);

  if (!item) {
    throw new NotFoundError();
  }
  res.json(item);
});

export { router as showTicketRouter };
