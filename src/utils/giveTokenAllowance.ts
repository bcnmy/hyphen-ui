import { BigNumber, ethers } from 'ethers';
import erc20ABI from 'abis/erc20.abi.json';

function giveTokenAllowance(
  spender: string,
  tokenAddress: string,
  value: BigNumber,
) {
  const tokenContract = new ethers.Contract(
    tokenAddress,
    erc20ABI,
    new ethers.providers.Web3Provider(window.ethereum).getSigner(),
  );

  return tokenContract.approve(spender, value);
}

export default giveTokenAllowance;
