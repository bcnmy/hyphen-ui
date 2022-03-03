import { BigNumber, ethers } from 'ethers';
import erc20ABI from 'abis/erc20.abi.json';

function giveTokenAllowance(
  spender: string,
  signer: ethers.Signer,
  tokenAddress: string,
  value: BigNumber,
) {
  const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);

  return tokenContract.approve(spender, value);
}

export default giveTokenAllowance;
