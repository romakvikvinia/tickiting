import { Response, Router, Request } from "express";
import { User } from "../models/user.entity";
import { body } from "express-validator";
import { validateRequest, BadRequestError } from "@ge_tickets/common";
import { Password } from "../services/password";
import jwt from "jsonwebtoken";

const router = Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email is not correct"),
    body("password")
      .trim()
      // .isLength({ min: 4, max: 16 })
      .notEmpty()
      .withMessage("Supply Password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await Password.compare(user.password, password)))
      throw new BadRequestError("User or Password is incorrect");

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

    return res.status(200).json({ user });
  }
);

export { router as SignInRouter };
