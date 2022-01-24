import { TokenConfig } from ".";
import { ETHEREUM } from "../chains/constants/Ethereum";
import { GOERLI } from "../chains/constants/Goerli";
import { MUMBAI } from "../chains/constants/Mumbai";
import { POLYGON } from "../chains/constants/Polygon";
import daiIcon from "../../assets/images/tokens/dai-icon.svg";

export const DAI: TokenConfig = {
  symbol: "DAI",
  image: daiIcon,
  [MUMBAI.chainId]: {
    address: "0x27a44456bEDb94DbD59D0f0A14fE977c777fC5C3",
    transferOverhead: 86147,
    decimal: 18,
    symbol: "DAI",
  },
  [GOERLI.chainId]: {
    address: "0x2686eca13186766760a0347ee8eeb5a88710e11b",
    transferOverhead: 96061,
    decimal: 18,
    symbol: "DAI",
  },
  [POLYGON.chainId]: {
    address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    transferOverhead: 96061,
    decimal: 18,
    symbol: "DAI",
  },
  [ETHEREUM.chainId]: {
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    transferOverhead: 96061,
    decimal: 18,
    symbol: "DAI",
  },
};
