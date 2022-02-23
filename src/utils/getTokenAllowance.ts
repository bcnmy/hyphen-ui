import { ethers } from 'ethers';
import erc20ABI from 'contracts/erc20.abi.json';

function getTokenAllowance(
  owner: string,
  spender: string,
  tokenAddress: string,
) {
  const tokenContract = new ethers.Contract(
    tokenAddress,
    erc20ABI,
    new ethers.providers.Web3Provider(window.ethereum),
  );

  return tokenContract.allowance(owner, spender);
}

export default getTokenAllowance;
