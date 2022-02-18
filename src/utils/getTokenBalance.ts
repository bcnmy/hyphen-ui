import config from "config";
import { ChainConfig } from "config/chains";
import { TokenConfig } from "config/tokens";
import { BigNumber, ethers } from "ethers";
import formatRawEthValue from "./formatRawEthValue";
import toFixed from "./toFixed";

async function getTokenBalance(accountAddress: string, selectedChain: ChainConfig, selectedChainRpcProvider: ethers.providers.JsonRpcProvider, selectedToken: TokenConfig, selectedTokenContract: ethers.Contract) {
  let formattedBalance: string;
  let userRawBalance: BigNumber;

  if (
    selectedToken[selectedChain.chainId].address.toLowerCase() ===
    config.constants.NATIVE_ADDRESS
  ) {
    userRawBalance = await selectedChainRpcProvider.getBalance(accountAddress);
    const decimals = selectedChain.nativeDecimal;

    formattedBalance = formatRawEthValue(userRawBalance.toString(), decimals);
  } else {
    userRawBalance = await selectedTokenContract.balanceOf(accountAddress);
    const decimals = await selectedTokenContract.decimals();

    formattedBalance = formatRawEthValue(userRawBalance.toString(), decimals);
  }
  const displayBalance = toFixed(
    formattedBalance,
    selectedToken[selectedChain.chainId].fixedDecimalPoint || 4
  );

  return {
    displayBalance,
    formattedBalance,
    userRawBalance
  }
}

export default getTokenBalance;