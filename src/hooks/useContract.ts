import { Web3Provider } from '@ethersproject/providers';
import { ethers, Signer } from 'ethers';

function useContract(
  contractAddress: string,
  contractABI: any,
  providerOrSigner: Web3Provider | Signer,
) {
  return new ethers.Contract(contractAddress, contractABI, providerOrSigner);
}

export default useContract;
