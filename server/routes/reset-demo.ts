import { RequestHandler } from "express";
import { ok } from "../utils/response";
import { resetDemo } from "../store/demoStore";

export const handleResetDemo: RequestHandler = (_req, res) => {
  resetDemo();
  return ok(res, { reset: true }, "Demo data reset");
};
