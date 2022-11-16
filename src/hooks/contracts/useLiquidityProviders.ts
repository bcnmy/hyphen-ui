import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import liquidityProvidersABI from 'abis/LiquidityProviders.abi.json';
import erc20ABI from 'abis/erc20.abi.json';

import { useWalletProvider } from 'context/WalletProvider';
import { Network } from 'hooks/useNetworks';
import { USDT_ADDRESS } from '../../config/constants';
import getTokenAllowance from '../../utils/getTokenAllowance';
import { toast } from 'react-toastify';
// import { GasLimit } from "@biconomy-sdk/core-types";

function useLiquidityProviders(chain: Network | undefined) {
  const {
    // accounts,
    // connect,
    smartAccount,
    smartAccountAddress,
    // currentChainId,
    // isLoggedIn,
    signer,
    // walletProvider,
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

  const makeApproveAndAddLiquidityTrx = useCallback(
    async (
      tokenAddress: string,
      amount: BigNumber,
      position: BigNumber,
      add = true,
    ) => {
      if (
        !liquidityProvidersContract ||
        !smartAccountAddress ||
        !contractAddress ||
        !chain
      )
        return;

      const provider = new ethers.providers.JsonRpcProvider(chain.rpc);

      console.log(' tokenAddress ', tokenAddress);
      console.log(' amount ', amount);
      console.log(' position ', position);
      console.log('contractAddress ', contractAddress);

      // In case of USDT if it has alreday approved allowance.
      // we need to approve 0 token transaction
      let amountToApprove = amount;

      if (tokenAddress === USDT_ADDRESS) {
        const tokenAllowance = BigNumber.from(
          await getTokenAllowance(
            smartAccountAddress,
            provider,
            contractAddress,
            tokenAddress,
          ),
        );
        console.log('Token Allowance ', tokenAllowance);
        if (tokenAllowance.gt(BigNumber.from(0))) {
          amountToApprove = BigNumber.from(0);
        }
      }

      console.log('amount to approve ', amount);

      const trxs: any = [];
      if (amountToApprove.eq(BigNumber.from(0))) {
        const zeroApproveCallData = erc20ContractInterface.encodeFunctionData(
          'approve',
          [contractAddress, amountToApprove],
        );
        trxs.push({
          to: tokenAddress,
          data: zeroApproveCallData,
        });
      }
      const approveCallData = erc20ContractInterface.encodeFunctionData(
        'approve',
        [contractAddress, amount],
      );

      const tx1 = {
        to: tokenAddress,
        data: approveCallData,
      };
      trxs.push(tx1);
      let liquidityCallData;
      if (add)
        liquidityCallData =
          await liquidityProvidersContract.populateTransaction.addTokenLiquidity(
            tokenAddress,
            amount,
          );
      else
        liquidityCallData =
          await liquidityProvidersContract.populateTransaction.increaseTokenLiquidity(
            position,
            amount,
          );

      const tx2 = {
        to: contractAddress,
        data: liquidityCallData.data,
      };
      trxs.push(tx2);
      return trxs;
    },
    [
      chain,
      contractAddress,
      erc20ContractInterface,
      liquidityProvidersContract,
      smartAccountAddress,
    ],
  );

  const addLiquidity = useCallback(
    async (tokenAddress: string, amount: BigNumber) => {
      console.log('Hey going to add Liquidity');
      toast.info(`Making add liquidity transaction...`);
      if (
        !liquidityProvidersContractSigner ||
        !liquidityProvidersContract ||
        !smartAccount
      )
        return;

      const txs: any = await makeApproveAndAddLiquidityTrx(
        tokenAddress,
        amount,
        BigNumber.from(0),
      );
      console.log('------ Add Liquidity Batching Trx ', txs);

      // prepare refund txn batch before so that we have accurate token gas price
      const feeQuotes = await smartAccount.prepareRefundTransactionBatch({
        transactions: txs,
      });
      console.log('prepareRefundTransactionBatch', feeQuotes);

      // set fee to selected token
      let fee = feeQuotes[1];
      for (let i = 0; i < feeQuotes.length; ++i) {
        if (feeQuotes[i].address === tokenAddress) {
          fee = feeQuotes[i];
        }
      }

      toast.info(`Sign transaction to confirm...`);
      // making transaction with version, set feeQuotes[1].tokenGasPrice = 6
      const transaction = await smartAccount.createRefundTransactionBatch({
        transactions: txs,
        feeQuote: fee,
      });
      console.log('transaction', transaction);

      let gasLimit = {
        hex: '0x1E8480',
        type: 'hex',
      };

      // send transaction internally calls signTransaction and sends it to connected relayer
      const txId = await smartAccount.sendTransaction({
        tx: transaction,
        gasLimit,
      });
      console.log(txId);
      toast.info(`Transaction sent to relayers...`);
      // return response;
    },
    [
      liquidityProvidersContract,
      liquidityProvidersContractSigner,
      makeApproveAndAddLiquidityTrx,
      smartAccount,
    ],
  );

  const addLiquidityGasless = useCallback(
    async (tokenAddress: string, amount: BigNumber) => {
      console.log('Hey going to add Liquidity');
      toast.info(`Making add liquidity transaction...`);

      if (
        !liquidityProvidersContractSigner ||
        !liquidityProvidersContract ||
        !smartAccount
      )
        return;

      const txs: any = await makeApproveAndAddLiquidityTrx(
        tokenAddress,
        amount,
        BigNumber.from(0),
      );

      console.log('------ Add Liquidity Batching Trx ', txs);

      await smartAccount.sendGaslessTransactionBatch({
        transactions: txs,
      });
      toast.info(`Transaction hash generated...`);
    },
    [liquidityProvidersContractSigner],
  );

  const addNativeLiquidity = useCallback(
    async (amount: BigNumber) => {
      console.log(' addNativeLiquidity ');
      console.log(' amount ', amount);

      if (
        !liquidityProvidersContractSigner ||
        !liquidityProvidersContract ||
        !smartAccount ||
        !contractAddress
      )
        return;

      const nativeTokenLiquidityCallData: any =
        await liquidityProvidersContract.populateTransaction.addNativeLiquidity(
          {
            value: amount,
          },
        );

      const trx = {
        to: contractAddress,
        data: nativeTokenLiquidityCallData.data,
        value: amount,
      };

      console.log('------ Native Token Liquidity GasLess Trx ', trx);

      const response = await smartAccount.sendGasLessTransaction({
        transaction: trx,
      });

      return response;
    },
    [liquidityProvidersContractSigner],
  );

  const claimFee = useCallback(
    async (positionId: BigNumber) => {
      if (
        !liquidityProvidersContractSigner ||
        !liquidityProvidersContract ||
        !smartAccount ||
        !contractAddress
      )
        return;

      const claimFeeCallData: any =
        await liquidityProvidersContract.populateTransaction.claimFee(
          positionId,
        );
      toast.info(`Sending claim transaction...`);

      const trx = {
        to: contractAddress,
        data: claimFeeCallData.data,
      };

      console.log('------ Claim Fee GasLess Trx ', trx);

      const response = await smartAccount.sendGasLessTransaction({
        transaction: trx,
      });

      return response;
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

      const txs: any = await makeApproveAndAddLiquidityTrx(
        tokenAddress,
        amount,
        positionId,
        false,
      );

      console.log('------ increase Liquidity Trx ', txs);

      toast.info(`Increasing liquidity transaction...`);
      // prepare refund txn batch before so that we have accurate token gas price
      const feeQuotes = await smartAccount.prepareRefundTransactionBatch({
        transactions: txs,
      });
      console.log('prepareRefundTransactionBatch', feeQuotes);

      // set fee to selected token
      let fee = feeQuotes[1];
      for (let i = 0; i < feeQuotes.length; ++i) {
        if (feeQuotes[i].address === tokenAddress) {
          fee = feeQuotes[i];
        }
      }

      toast.info(`Sign transaction to confirm...`);
      // making transaction with version, set feeQuotes[1].tokenGasPrice = 6
      const transaction = await smartAccount.createRefundTransactionBatch({
        transactions: txs,
        feeQuote: fee,
      });
      console.log('transaction', transaction);

      let gasLimit = {
        hex: '0x1E8480',
        type: 'hex',
      };

      // send transaction internally calls signTransaction and sends it to connected relayer
      const txId = await smartAccount.sendTransaction({
        tx: transaction,
        gasLimit,
      });
      console.log(txId);
      toast.info(`Transaction sent to relayers...`);
      // return response;
    },
    [liquidityProvidersContractSigner],
  );

  const increaseLiquidityGasless = useCallback(
    async (tokenAddress: string, positionId: BigNumber, amount: BigNumber) => {
      if (!liquidityProvidersContractSigner || !smartAccount) return;

      const txs: any = await makeApproveAndAddLiquidityTrx(
        tokenAddress,
        amount,
        positionId,
        false,
      );

      console.log('------ increase Liquidity Trx ', txs);

      toast.info(`Increasing liquidity transaction...`);
      await smartAccount.sendGaslessTransactionBatch({
        transactions: txs,
      });
      toast.info(`Transaction hash generated...`);
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

      if (
        !liquidityProvidersContractSigner ||
        !liquidityProvidersContract ||
        !smartAccount ||
        !contractAddress
      )
        return;

      const removeLiquidityCallData: any =
        await liquidityProvidersContract.populateTransaction.removeLiquidity(
          positionId,
          amount,
        );
      toast.info(`Removing liquidity...`);

      console.log('removeLiquidityCallData ', removeLiquidityCallData);

      const trx = {
        to: contractAddress,
        data: removeLiquidityCallData.data,
      };
      console.log('trx ', trx);

      // prepare refund txn batch before so that we have accurate token gas price
      const feeQuotes = await smartAccount.prepareRefundTransaction({
        transaction: trx,
      });
      console.log('prepareRefundTransactionBatch', feeQuotes);

      toast.info(`Sign transaction to confirm...`);
      // making transaction with version, set feeQuotes[1].tokenGasPrice = 6
      const transaction = await smartAccount.createRefundTransaction({
        transaction: trx,
        feeQuote: feeQuotes[1],
      });
      console.log('transaction', transaction);

      let gasLimit = {
        hex: '0x1E8480',
        type: 'hex',
      };

      // send transaction internally calls signTransaction and sends it to connected relayer
      const txHash = await smartAccount.sendTransaction({
        tx: transaction,
        gasLimit,
      });
      console.log(txHash);
      toast.info(`Transaction sent to relayers...`);
    },
    [liquidityProvidersContractSigner],
  );

  const removeLiquidityGasless = useCallback(
    async (positionId: BigNumber, amount: BigNumber) => {
      console.log('Got Remove Liquidity Request');
      console.log('position id', positionId);
      console.log('amount', amount);

      if (
        !liquidityProvidersContractSigner ||
        !liquidityProvidersContract ||
        !smartAccount ||
        !contractAddress
      )
        return;

      const removeLiquidityCallData: any =
        await liquidityProvidersContract.populateTransaction.removeLiquidity(
          positionId,
          amount,
        );
      toast.info(`Removing liquidity...`);

      console.log('removeLiquidityCallData ', removeLiquidityCallData);

      const trx = {
        to: contractAddress,
        data: removeLiquidityCallData.data,
      };

      console.log('trx ', trx);

      await smartAccount.sendGasLessTransaction({
        transaction: trx,
      });
      toast.info(`Transaction hash generated...`);
    },
    [liquidityProvidersContractSigner],
  );

  return {
    addLiquidity,
    addLiquidityGasless,
    makeApproveAndAddLiquidityTrx,
    addNativeLiquidity,
    claimFee,
    getBaseDivisor,
    getSuppliedLiquidityByToken,
    getTokenAmount,
    getTokenPriceInLPShares,
    getTotalLiquidity,
    getTotalSharesMinted,
    increaseLiquidity,
    increaseLiquidityGasless,
    increaseNativeLiquidity,
    removeLiquidity,
    removeLiquidityGasless,
  };
}

export default useLiquidityProviders;
