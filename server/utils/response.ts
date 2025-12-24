import { Response } from "express";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
}

export function ok<T>(res: Response, data: T, message?: string, status = 200) {
  const payload: ApiResponse<T> = { success: true, data, message };
  return res.status(status).json(payload);
}

export function fail<T>(res: Response, message: string, data: T | null = null, status = 400) {
  const payload: ApiResponse<T> = { success: false, data, message };
  return res.status(status).json(payload);
}
