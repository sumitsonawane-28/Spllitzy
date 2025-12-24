import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { requestOtp, verifyOtp } from "./routes/auth";
import {
  createGroup,
  getGroupById,
  addMember,
  removeMember,
  addExpense,
  listExpenses,
  getSettlement,
} from "./routes/groups";
import { handleResetDemo } from "./routes/reset-demo";
import { ok } from "./utils/response";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    ok(res, { message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth (mock)
  app.post("/api/auth/request-otp", requestOtp);
  app.post("/api/auth/verify-otp", verifyOtp);

  // Groups
  app.post("/api/groups", createGroup);
  app.get("/api/groups/:groupId", getGroupById);
  app.post("/api/groups/:groupId/members", addMember);
  app.delete("/api/groups/:groupId/members/:memberId", removeMember);

  // Expenses
  app.post("/api/groups/:groupId/expenses", addExpense);
  app.get("/api/groups/:groupId/expenses", listExpenses);

  // Settlement
  app.get("/api/groups/:groupId/settlement", getSettlement);

  // Demo reset
  app.post("/api/reset-demo", handleResetDemo);

  return app;
}
