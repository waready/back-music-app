import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { generateTokens } from "../utils/jwt.js";
import { addRefreshTokenToWhitelist } from "./auth.services.js";
import {
  findUserByEmail,
  createUserByEmailAndPassword,
} from "./users.services.js";
import bcrypt from "bcryptjs";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { user } = req.body;
    if (!user || !user.email || !user.password) {
      res.status(400);
      throw new Error("You must provide an email and a password.");
    }

    const existingUser = await findUserByEmail(user.email);

    if (existingUser) {
      res.status(400);
      throw new Error("Email already in use.");
    }

    const newUser = await createUserByEmailAndPassword({
      email: user.email,
      password: user.password,
    });
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(newUser, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: newUser.id });

    res.json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { user } = req.body;
    if (!user || !user.email || !user.password) {
      res.status(400);
      throw new Error("You must provide an email and a password.");
    }

    const existingUser = await findUserByEmail(user.email);

    if (!existingUser) {
      res.status(403);
      throw new Error("Invalid login credentials.");
    }

    const validPassword = await bcrypt.compare(
      user.password,
      existingUser.password
    );
    if (!validPassword) {
      res.status(403);
      throw new Error("Invalid login credentials.");
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: existingUser.id,
    });

    res.json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
