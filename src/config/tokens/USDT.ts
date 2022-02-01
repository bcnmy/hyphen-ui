import { TokenConfig } from ".";
import { AVALANCHE } from "../chains/constants/Avalanche";
import { ETHEREUM } from "../chains/constants/Ethereum";
import { FUJI } from "../chains/constants/Fuji";
import { GOERLI } from "../chains/constants/Goerli";
import { MUMBAI } from "../chains/constants/Mumbai";
import { POLYGON } from "../chains/constants/Polygon";
import { RINKEBY } from "../chains/constants/Rinkeby";
import usdtIcon from "../../assets/images/tokens/usdt-icon.svg";

export const USDT: TokenConfig = {
  symbol: "USDT",
  image: usdtIcon,
  [MUMBAI.chainId]: {
    address: "0xeaBc4b91d9375796AA4F69cC764A4aB509080A58",
    transferOverhead: 130000,
    decimal: 18,
    symbol: "USDT",
  },
  [GOERLI.chainId]: {
    address: "0x64ef393b6846114bad71e2cb2ccc3e10736b5716",
    transferOverhead: 135000,
    decimal: 18,
    symbol: "USDT",
  },
  [RINKEBY.chainId]: {
    address: "0xfab46e002bbf0b4509813474841e0716e6730136",
    transferOverhead: 135000,
    decimal: 18,
    symbol: "USDT",
  },
  [POLYGON.chainId]: {
    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    transferOverhead: 130000,
    decimal: 6,
    symbol: "USDT",
  },
  [ETHEREUM.chainId]: {
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    transferOverhead: 135000,
    decimal: 6,
    symbol: "USDT",
  },
};
