import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
  "cleanup expired pastes",
  { minuteUTC: 0 },
  internal.pastes.cleanupExpired
);

export default crons;
