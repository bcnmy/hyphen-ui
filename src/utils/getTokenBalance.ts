import config from 'config';
import { ChainConfig } from 'config/chains';
import { TokenConfig } from 'config/tokens';
import { BigNumber, ethers } from 'ethers';
import formatRawEthValue from './formatRawEthValue';
import toFixed from './toFixed';
import erc20ABI from 'abis/erc20.abi.json';

async function getTokenBalance(
  accountAddress: string,
  chain: ChainConfig,
  token: TokenConfig,
) {
  const { chainId, nativeDecimal, rpcUrl } = chain;
  const {
    [chainId]: { address: tokenAddress },
  } = token;

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, provider);

  let formattedBalance: string;
  let userRawBalance: BigNumber;

  if (tokenAddress.toLowerCase() === config.constants.NATIVE_ADDRESS) {
    userRawBalance = await provider.getBalance(accountAddress);
    const decimals = nativeDecimal;

    formattedBalance = formatRawEthValue(userRawBalance.toString(), decimals);
  } else {
    userRawBalance = await tokenContract.balanceOf(accountAddress);
    const decimals = await tokenContract.decimals();

    formattedBalance = formatRawEthValue(userRawBalance.toString(), decimals);
  }
  const displayBalance = toFixed(
    formattedBalance,
    token[chainId].fixedDecimalPoint || 4,
  );

  return {
    displayBalance,
    formattedBalance,
    userRawBalance,
  };
}

export default getTokenBalance;
