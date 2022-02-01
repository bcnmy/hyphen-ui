import { TokenConfig } from ".";
import { AVALANCHE } from "../chains/constants/Avalanche";
import { ETHEREUM } from "../chains/constants/Ethereum";
import { FUJI } from "../chains/constants/Fuji";
import { GOERLI } from "../chains/constants/Goerli";
import { MUMBAI } from "../chains/constants/Mumbai";
import { POLYGON } from "../chains/constants/Polygon";
import { RINKEBY } from "../chains/constants/Rinkeby";
import { NATIVE_ADDRESS } from "../constants";
import ethIcon from "../../assets/images/tokens/eth-icon.svg";

export const ETH: TokenConfig = {
  symbol: "ETH",
  image: ethIcon,
  [MUMBAI.chainId]: {
    address: "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa",
    transferOverhead: 124000,
    decimal: 18,
    symbol: "ETH",
    fixedDecimalPoint: 5,
  },
  [GOERLI.chainId]: {
    address: NATIVE_ADDRESS,
    transferOverhead: 97000,
    decimal: 18,
    symbol: "ETH",
    fixedDecimalPoint: 5,
  },
  [POLYGON.chainId]: {
    address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    transferOverhead: 124000,
    decimal: 18,
    symbol: "ETH",
    fixedDecimalPoint: 5,
  },
  [ETHEREUM.chainId]: {
    address: NATIVE_ADDRESS,
    transferOverhead: 97000,
    decimal: 18,
    symbol: "ETH",
    fixedDecimalPoint: 5,
  },
  [RINKEBY.chainId]: {
    address: NATIVE_ADDRESS,
    transferOverhead: 97000,
    decimal: 18,
    symbol: "ETH",
    fixedDecimalPoint: 5,
  },
  [FUJI.chainId]: {
    address: "0x7fcdc2c1ef3e4a0bcc8155a558bb20a7218f2b05",
    transferOverhead: 127000,
    decimal: 18,
    symbol: "ETH",
    fixedDecimalPoint: 5,
  },
  [AVALANCHE.chainId]: {
    address: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
    transferOverhead: 127000,
    decimal: 18,
    symbol: "ETH",
    fixedDecimalPoint: 5,
  },
};
