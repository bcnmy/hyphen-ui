import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import liquidityProvidersABI from 'abis/LiquidityProviders.abi.json';
import erc20ABI from 'abis/erc20.abi.json'

import { useWalletProvider } from 'context/WalletProvider';
import { Network } from 'hooks/useNetworks';

function useLiquidityProviders(chain: Network | undefined) {
  const {
    accounts,
    connect,
    smartAccount,
    smartAccountAddress,
    currentChainId,
    isLoggedIn,
    signer,
    walletProvider,
  } = useWalletProvider()!;

  const contractAddress = chain
    ? chain.contracts.hyphen.liquidityProviders
    : undefined;
  
  const erc20ContractInterface = new ethers.utils.Interface(erc20ABI);


  const liquidityProvidersContract = useMemo(() => {
    if (!chain || !contractAddress || !chain.rpc) return;

    return new ethers.Contract(
      contractAddress,
      liquidityProvidersABI,
      new ethers.providers.JsonRpcProvider(chain.rpc),
    );
  }, [chain, contractAddress]);

  const liquidityProvidersContractSigner = useMemo(() => {
    if (!contractAddress || !signer) return;

    return new ethers.Contract(contractAddress, liquidityProvidersABI, signer);
  }, [contractAddress, signer]);

  const makeApproveAndAddLiquidityTrx = async (tokenAddress: string, amount: BigNumber, position: BigNumber, add = true) =>{
    if (!liquidityProvidersContract)
    return

    console.log(' tokenAddress ', tokenAddress);
    console.log(' amount ', amount);
    console.log(' position ', position);
    console.log('contractAddress ', contractAddress);
    
    

    const trxs: any = []
      const approveCallData = erc20ContractInterface.encodeFunctionData('approve', [contractAddress, amount])

      const tx1 = {
        to: tokenAddress,
        data: approveCallData,
      };
      trxs.push(tx1)
      let liquidityCallData
      if (add)
      liquidityCallData = await liquidityProvidersContract.populateTransaction.addTokenLiquidity(
        tokenAddress,
        amount
      )
      else
      liquidityCallData = await liquidityProvidersContract.populateTransaction.increaseTokenLiquidity(
        position,
        amount
      )

      const tx2 = {
        to: contractAddress,
        data: liquidityCallData.data
      }
      trxs.push(tx2);
    return trxs
  }

  const addLiquidity = useCallback(
    async (tokenAddress: string, amount: BigNumber) => {
      console.log('Hey going to add Liquidity') 
     
      if (!liquidityProvidersContractSigner || !liquidityProvidersContract || !smartAccount) return;


      const txs: any = await makeApproveAndAddLiquidityTrx(tokenAddress, amount, BigNumber.from(0))

      const response = await smartAccount.sendGaslessTransactionBatch({ transactions: txs });

      return response
    },
    [liquidityProvidersContractSigner],
  );

  const addNativeLiquidity = useCallback(
    (amount: BigNumber) => {
      if (!liquidityProvidersContractSigner) return;

      return liquidityProvidersContractSigner.addNativeLiquidity({
        value: amount,
      });
    },
    [liquidityProvidersContractSigner],
  );

  const claimFee = useCallback(
    async (positionId: BigNumber) => {
      if (!liquidityProvidersContractSigner || !liquidityProvidersContract || !smartAccount || !contractAddress) return;

      const claimFeeCallData: any = await liquidityProvidersContract.populateTransaction.claimFee(
        positionId
      )

      const trx = {
        to: contractAddress,
        data: claimFeeCallData.data
      }

      const response = await smartAccount.sendGasLessTransaction({ transaction: trx });

      return response
    },
    [liquidityProvidersContractSigner],
  );

  const getBaseDivisor = useCallback(() => {
    if (!liquidityProvidersContract) return;

    return liquidityProvidersContract.BASE_DIVISOR();
  }, [liquidityProvidersContract]);

  const getSuppliedLiquidityByToken = useCallback(
    (tokenAddress: string) => {
      if (!liquidityProvidersContract) return;

      return liquidityProvidersContract.getSuppliedLiquidityByToken(
        tokenAddress,
      );
    },
    [liquidityProvidersContract],
  );

  const getTokenAmount = useCallback(
    (shares: BigNumber, tokenAddress: string) => {
      if (!liquidityProvidersContract) return;

      return liquidityProvidersContract.sharesToTokenAmount(
        shares,
        tokenAddress,
      );
    },
    [liquidityProvidersContract],
  );

  const getTokenPriceInLPShares = useCallback(
    (tokenAddress: string | undefined) => {
      if (!liquidityProvidersContract) return;

      return liquidityProvidersContract.getTokenPriceInLPShares(tokenAddress);
    },
    [liquidityProvidersContract],
  );

  const getTotalLiquidity = useCallback(
    (tokenAddress: string | undefined) => {
      if (!liquidityProvidersContract) return;

      return liquidityProvidersContract.totalLiquidity(tokenAddress);
    },
    [liquidityProvidersContract],
  );

  const getTotalSharesMinted = useCallback(
    (tokenAddress: string | undefined) => {
      if (!liquidityProvidersContract) return;

      return liquidityProvidersContract.totalSharesMinted(tokenAddress);
    },
    [liquidityProvidersContract],
  );

  const increaseLiquidity = useCallback(
    async (tokenAddress: string, positionId: BigNumber, amount: BigNumber) => {
      if (!liquidityProvidersContractSigner || !smartAccount) return;

      const txs: any = await makeApproveAndAddLiquidityTrx(tokenAddress, amount, positionId, false)

      const response = await smartAccount.sendGaslessTransactionBatch({ transactions: txs });
      return response
    },
    [liquidityProvidersContractSigner],
  );

  const increaseNativeLiquidity = useCallback(
    (positionId: BigNumber, amount: BigNumber) => {
      if (!liquidityProvidersContractSigner) return;

      return liquidityProvidersContractSigner.increaseNativeLiquidity(
        positionId,
        {
          value: amount,
        },
      );
    },
    [liquidityProvidersContractSigner],
  );

  const removeLiquidity = useCallback(
    async (positionId: BigNumber, amount: BigNumber) => {
      console.log('Got Remove Liquidity Request');
      console.log('position id', positionId);
      console.log('amount', amount);
      
      if (!liquidityProvidersContractSigner || !liquidityProvidersContract || !smartAccount  || !contractAddress) return;

      const removeLiquidityCallData: any = await liquidityProvidersContract.populateTransaction.removeLiquidity(
        positionId,
        amount
      )

      console.log('removeLiquidityCallData ', removeLiquidityCallData);
      

      const trx = {
        to: contractAddress,
        data: removeLiquidityCallData.data
      }

      console.log('trx ', trx);
      
      const response = await smartAccount.sendGasLessTransaction({ transaction: trx });

      return response

    },
    [liquidityProvidersContractSigner],
  );

  return {
    addLiquidity,
    addNativeLiquidity,
    claimFee,
    getBaseDivisor,
    getSuppliedLiquidityByToken,
    getTokenAmount,
    getTokenPriceInLPShares,
    getTotalLiquidity,
    getTotalSharesMinted,
    increaseLiquidity,
    increaseNativeLiquidity,
    removeLiquidity,
  };
}

export default useLiquidityProviders;
