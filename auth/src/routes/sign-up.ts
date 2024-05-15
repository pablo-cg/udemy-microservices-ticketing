import express from 'express';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ResquestValidationError } from '../errors/request-validation.error';
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request.error';

const router = express.Router();

const validations = [
  body('email').isEmail().withMessage('Email is not valid'),
  body('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Password must be between 4 and 20 characters'),
];

router.post(
  '/api/users/signup',
  validations,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new ResquestValidationError(errors.array());
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email already in use.');
    }

    const newUser = User.build({ email, password });
    await newUser.save();

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
      },
      process.env.JWT_KEY!,
    );

    // Store JWT on session
    req.session = { jwt: userJwt };

    return res.status(201).send(newUser);
  },
);

export { router as signUpRouter };
