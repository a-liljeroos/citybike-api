import { sign, verify } from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY;

export const generateToken = (payload: any): string => {
  return sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      data: payload,
    },
    secretKey
  );
};

let tokenBlacklist: string[] = [];

export const blacklistToken = (token: string): void => {
  tokenBlacklist.push(token);
};

const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.includes(token);
};

export const clearTokenBlacklist = (): void => {
  tokenBlacklist = [];
};

export const verifyToken = (token: string): any => {
  if (isTokenBlacklisted(token)) {
    throw new Error("Invalid token.");
  }
  try {
    const decoded = verify(token, secretKey);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token.");
  }
};
