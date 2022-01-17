import { chains, chainMap } from "./chains";
import tokens from "./tokens";
import constants from "./constants";
import { ENV } from "types/environment";

let hyphenBaseUrl;
if (process.env.REACT_APP_ENV === ENV.production) {
  hyphenBaseUrl = "https://hyphen-api.biconomy.io";
} else if (process.env.REACT_APP_ENV === ENV.test) {
  hyphenBaseUrl = "https://hyphen-test-api.biconomy.io";
} else {
  hyphenBaseUrl = "https://hyphen-staging-api.biconomy.io";
}

const hyphen = {
  baseURL: hyphenBaseUrl,
  getTokenGasPricePath: "/api/v1/insta-exit/get-token-price",
};

export const config = {
  chains,
  chainMap,
  tokens,
  hyphen,
  constants,
};

export default config;
