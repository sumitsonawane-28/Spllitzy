import { RequestHandler } from "express";
import { DemoResponse } from "@shared/api";
import { ok } from "../utils/response";

export const handleDemo: RequestHandler = (req, res) => {
  const response: DemoResponse = {
    message: "Hello from Express server",
  };
  ok(res, response);
};
