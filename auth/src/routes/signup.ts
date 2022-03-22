import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user.entity";
import { BadRequestError, validateRequest } from "@ge_tickets/common";

import jwt from "jsonwebtoken";

const router = Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email is not correct"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 16 })
      .withMessage("Password is not correct"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const user = User.build({ email, password });
      await user.save();

      // Generate jwt
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_KEY!
      );

      req.session = { jwt: token };
      // set to cookie

      return res.status(201).json(user);
    } catch (error) {
      throw new BadRequestError("Email Already exists");
    }
  }
);

export { router as SignUpRouter };
