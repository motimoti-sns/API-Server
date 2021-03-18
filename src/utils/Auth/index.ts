import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config()


const jwtSecret = process.env.JWT_SECRET

const jwtOptions: jwt.SignOptions = {
  algorithm: 'HS256',
}

type Payload = {
  email: string;
  userId: number;
}

export function createToken(payload: Payload): string {
  return jwt.sign(payload, jwtSecret, jwtOptions);
}

export async function verifyToken(token: string): Promise<string> {
  try {
    await jwt.verify(token, jwtSecret, jwtOptions);
    return 'ok'
  } catch (e) {
    return e.message
  }
}
