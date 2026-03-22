import type { CorsOptions } from "cors";

const REQUEST_ORIGIN = process.env.ORIGIN;
export const corsOptions: CorsOptions = {
  origin: REQUEST_ORIGIN
    ? REQUEST_ORIGIN.split(";")
    : ["http://localhost:5173"],
};
