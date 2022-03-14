import { TokenConfig } from ".";
import { AVALANCHE } from "../chains/constants/Avalanche";
import { ETHEREUM } from "../chains/constants/Ethereum";
import { GOERLI } from "../chains/constants/Goerli";
import { MUMBAI } from "../chains/constants/Mumbai";
import { POLYGON } from "../chains/constants/Polygon";
import usdcIcon from "../../assets/images/tokens/usdc-icon.svg";

export const USDC: TokenConfig = {
  symbol: "USDC",
  image: usdcIcon,
  [MUMBAI.chainId]: {
    address: "0xdA5289fCAAF71d52a80A254da614a192b693e977",
    transferOverhead: 116000,
    decimal: 18,
    symbol: "USDC",
    chainColor: MUMBAI.chainColor
  },
  [GOERLI.chainId]: {
    address: "0xb5B640E6414b6DeF4FC9B3C1EeF373925effeCcF",
    transferOverhead: 138000,
    decimal: 18,
    symbol: "USDC",
    chainColor: GOERLI.chainColor
  },
  [POLYGON.chainId]: {
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    transferOverhead: 116000,
    decimal: 6,
    symbol: "USDC",
    chainColor: POLYGON.chainColor
  },
  [ETHEREUM.chainId]: {
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    transferOverhead: 138000,
    decimal: 6,
    symbol: "USDC",
    chainColor: ETHEREUM.chainColor
  },
  [AVALANCHE.chainId]: {
    address: "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
    transferOverhead: 127000,
    decimal: 18,
    symbol: "USDC",
    chainColor: AVALANCHE.chainColor
  },
};
