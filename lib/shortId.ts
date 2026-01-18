import { nanoid } from "nanoid";

export function generateShortId(): string {
  return nanoid(6);
}
