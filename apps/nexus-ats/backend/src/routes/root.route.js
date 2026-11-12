import { Router } from "express";
import { getHealth } from "#controllers/root/root.controller.js";

export const rootRouter = Router();

rootRouter.get("/health", getHealth);
rootRouter.get("/", getHealth);
