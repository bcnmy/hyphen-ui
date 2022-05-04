import config from 'config';
import { BigNumber, ethers } from 'ethers';
import formatRawEthValue from './formatRawEthValue';
import toFixed from './toFixed';
import erc20ABI from 'abis/erc20.abi.json';
import { Network } from 'hooks/useNetworks';
import { Token } from 'hooks/useTokens';
import { DEFAULT_FIXED_DECIMAL_POINT } from 'config/constants';

async function getTokenBalance(
  accountAddress: string,
  chain: Network,
  token: Token | undefined,
) {
  if (!accountAddress || !chain || !token || !chain.rpc) return;

  const { chainId, nativeDecimal, rpc } = chain;
  const {
    [chainId]: { address: tokenAddress },
  } = token;

  const provider = new ethers.providers.JsonRpcProvider(rpc);
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
  const displayBalance = toFixed(formattedBalance, DEFAULT_FIXED_DECIMAL_POINT);

  return {
    displayBalance,
    formattedBalance,
    userRawBalance,
  };
}

export default getTokenBalance;
