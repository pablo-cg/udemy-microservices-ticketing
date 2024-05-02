import express from 'express';
import type { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

const validations = [
  body('email').isEmail().withMessage('Email is not valid'),
  body('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Password must be between 4 and 20 characters'),
];

router.post('/api/users/signup', validations, (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).send(errors.array());
  }

  const { email, password } = req.body;

  console.log('creating user...');

  res.send({});
});

export { router as signUpRouter };
