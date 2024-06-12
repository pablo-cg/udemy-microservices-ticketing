import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@pcg-tickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';

const router = express.Router();

const validations = [
  body('title').not().isEmpty().withMessage('Title is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
];

router.put(
  '/api/tickets/:id',
  requireAuth,
  validations,
  validateRequest,
  async (req: Request, res: Response) => {
    const foundTicket = await Ticket.findById(req.params.id);

    if (!foundTicket) {
      throw new NotFoundError();
    }

    if (foundTicket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    const { title, price } = req.body;

    foundTicket.set({ title, price });

    await foundTicket.save();

    res.send(foundTicket);
  },
);

export { router as updateTicketRouter };
