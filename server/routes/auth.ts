import { RequestHandler } from "express";
import { ok, fail } from "../utils/response";
import { getDemoUser, getUserByMobile } from "../store/demoStore";

export const requestOtp: RequestHandler = (req, res) => {
  const { mobile } = req.body || {};
  if (!mobile) return fail(res, "mobile is required");
  return ok(res, { otp: "1234" }, "OTP generated (demo)");
};

export const verifyOtp: RequestHandler = (req, res) => {
  const { mobile, otp } = req.body || {};
  if (!mobile) return fail(res, "mobile is required");
  if (otp !== "1234") return fail(res, "Invalid OTP", null, 401);
  const user = getUserByMobile(mobile) || getDemoUser();
  return ok(res, { userId: user.userId, name: user.name, mobile: user.mobile }, "Authenticated (demo)");
};
