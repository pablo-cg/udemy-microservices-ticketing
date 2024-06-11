import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { Password } from '../services/password';
import { User } from '../models/user';
import { BadRequestError, validateRequest } from '@pcg-tickets/common';

const router = express.Router();

const validations = [
  body('email').isEmail().withMessage('Invalid email.'),
  body('password').trim().notEmpty().withMessage('Must provide a password.'),
];

router.post(
  '/api/users/signin',
  validations,
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials.');
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password,
    );

    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials.');
    }

    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!,
    );

    req.session = { jwt: userJwt };

    res.send(existingUser);
  },
);

export { router as signInRouter };
