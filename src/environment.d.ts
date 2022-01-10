import { ENV } from "./types/environment";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_ENV: ENV;
    }
  }
}