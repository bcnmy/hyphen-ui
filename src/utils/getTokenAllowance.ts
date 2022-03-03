import { ethers } from 'ethers';
import erc20ABI from 'abis/erc20.abi.json';

function getTokenAllowance(
  owner: string,
  provider: ethers.providers.JsonRpcProvider,
  spender: string,
  tokenAddress: string,
) {
  const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, provider);

  return tokenContract.allowance(owner, spender);
}

export default getTokenAllowance;
