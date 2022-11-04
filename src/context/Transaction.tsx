import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { BigNumber, ethers } from 'ethers';
import {
  createContext,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import lpmanagerABI from 'abis/LiquidityPools.abi.json';

// @ts-ignore
import { RESPONSE_CODES } from '@biconomy/hyphen';

import {
  BASE_DIVISOR,
  DEFAULT_FIXED_DECIMAL_POINT,
  NATIVE_ADDRESS,
} from 'config/constants';
import { useChains } from './Chains';
import { useHyphen } from './Hyphen';
import { useToken } from './Token';
import { useTokenApproval } from './TokenApproval';
import config from 'config';
import toFixed from 'utils/toFixed';
import formatRawEthValue from 'utils/formatRawEthValue';
import useAsync, { Status } from 'hooks/useLoading';
import { useWalletProvider } from './WalletProvider';
import { useBiconomy } from './Biconomy';
import { useNotifications } from './Notifications';
import useLiquidityPools from 'hooks/contracts/useLiquidityPools';

export enum ValidationErrors {
  INVALID_AMOUNT,
  AMOUNT_LT_MIN,
  AMOUNT_GT_MAX,
  INADEQUATE_BALANCE,
  POOLINFO_NOT_LOADED,
  BALANCE_NOT_LOADED,
}

interface ITransactionContext {
  transferAmount: number | null | undefined;
  transferAmountInputValue: undefined | string;
  changeTransferAmountInputValue: (amount: string) => void;
  fetchTransactionFeeStatus: Status;
  fetchTransactionFeeError: Error | undefined;
  transactionFee:
    | undefined
    | {
        lpFeeProcessedString: string;
        transactionFeeProcessedString: string;
        amountToGetProcessedString: string;
        rewardAmountString: string | undefined;
        transferFeePercentage: string | undefined;
      };
  transactionAmountValidationErrors: ValidationErrors[];
  // receiver address
  receiver: { receiverAddress: string; isReceiverValid: boolean };
  changeReceiver: (event: FormEvent<HTMLInputElement>) => void;
  //deposit stuff
  executeDeposit: (receiverAddress: string) => void;
  executeDepositError: Error | undefined;
  executeDepositStatus: Status;
  executeDepositValue: any;
  //pre deposit stuff
  executePreDepositCheck: () => void;
  executePreDepositCheckError: Error | undefined;
  executePreDepositCheckStatus: Status;
  executePreDepositCheckValue: any;
  // check receival stuff
  checkReceival: () => Promise<string | null>;
  // exti stuff
  setExitHash: (exitHash: string | undefined) => void;
  exitHash: string | undefined;
  getExitInfoFromHash: (exitHash: string) => Promise<string>;
}

const TransactionContext = createContext<ITransactionContext | null>(null);

const getTokenGasPrice = (
  tokenAddress: string,
  networkId: number,
  fetchOptions: any,
) =>
  fetch(
    `${config.hyphen.baseURL}${config.hyphen.getTokenGasPricePath}?tokenAddress=${tokenAddress}&networkId=${networkId}`,
    fetchOptions,
  );
const getTokenGasPriceDebounced = AwesomeDebouncePromise(getTokenGasPrice, 500);

const TransactionProvider = props => {
  const { selectedToken, selectedTokenBalance } = useToken()!;
  const { toChainRpcUrlProvider } = useChains()!;
  const { poolInfo, hyphen } = useHyphen()!;
  const { fromChain, toChain } = useChains()!;
  const { isBiconomyEnabled } = useBiconomy()!;
  const { accounts } = useWalletProvider()!;
  const { getTransferFee } = useLiquidityPools(toChain)!;
  const { getRewardAmount } = useLiquidityPools(fromChain)!;
  const { addTxNotification } = useNotifications()!;

  // exit hash for last transaction
  const [exitHash, setExitHash] = useState<string>();

  const { executeApproveTokenStatus, fetchSelectedTokenApproval } =
    useTokenApproval()!;

  const [errors, setErrors] = useState<ValidationErrors[]>([]);

  const [transferAmountInputValue, setTransferAmountInputValue] =
    useState<string>('');

  const [receiver, setReceiver] = useState<{
    receiverAddress: string;
    isReceiverValid: boolean;
  }>({
    receiverAddress: '',
    isReceiverValid: false,
  });

  useEffect(() => {
    if (accounts) {
      setReceiver({
        receiverAddress: accounts[0],
        isReceiverValid: true,
      });
    }
  }, [accounts]);

  // reset the input after conditions change
  useEffect(() => {
    setTransferAmountInputValue('');
  }, [fromChain, toChain, selectedToken]);

  const transferAmount = useMemo(
    () => parseFloat(transferAmountInputValue),
    [transferAmountInputValue],
  );

  // TODO: Make this more readible.
  // Fetch token approval when conditions change
  useEffect(() => {
    if (
      transferAmount > 0 &&
      (errors.length === 0 ||
        (executeApproveTokenStatus === Status.SUCCESS && errors.length === 0))
    ) {
      fetchSelectedTokenApproval(transferAmount);
    }
  }, [
    fetchSelectedTokenApproval,
    transferAmount,
    errors,
    executeApproveTokenStatus,
  ]);

  // useEffect(() => {
  //   console.log({
  //     fetchSelectedTokenApprovalStatus,
  //     fetchSelectedTokenApprovalValue,
  //     fetchSelectedTokenApprovalError,
  //   });
  // }, [
  //   fetchSelectedTokenApprovalStatus,
  //   fetchSelectedTokenApprovalValue,
  //   fetchSelectedTokenApprovalError,
  // ]);

  // let { data: transferFee, isLoading: isTransferFeeLoading } = useQuery(
  //   ['transferFeeByToken', selectedToken, toChain, transferAmount],
  //   async () => {
  //     if (!selectedToken || !toChain || !transferAmount) {
  //       return;
  //     }
  //     let tokenAddress = selectedToken[toChain.chainId].address;
  //     let tokenDecimal = selectedToken[toChain.chainId].decimal;
  //     let rawTransferAmount = transferAmount * Math.pow(10, tokenDecimal);
  //     return await getTransferFee(tokenAddress, rawTransferAmount.toString());
  //   },
  //   {
  //     // Execute only when tokenAddress is available.
  //     enabled: !!(selectedToken && toChain && transferAmount),
  //   },
  // );

  // let { data: rewardAmount } = useQuery(
  //   ['rewardAmountByToken', selectedToken, fromChain, transferAmount],
  //   () => {
  //     if (!selectedToken || !fromChain || !transferAmount) {
  //       return;
  //     }
  //     let tokenAddress = selectedToken[fromChain.chainId].address;
  //     let tokenDecimal = selectedToken[fromChain.chainId].decimal;

  //     let rawTransferAmount = transferAmount * Math.pow(10, tokenDecimal);
  //     return getRewardAmount(tokenAddress, rawTransferAmount.toString());
  //   },
  //   {
  //     // Execute only when tokenAddress is available.
  //     enabled: !!(selectedToken && fromChain && transferAmount),
  //   },
  // );

  const changeTransferAmountInputValue = (amount: string) => {
    const regExp = /^((\d+)?(\.\d{0,3})?)$/;
    // match any number of digits, and after that also optionally match, one decimal point followed by any number of digits
    // having the string input value and number value seperate allows for the validation logic to run without intefering each other
    let status = regExp.test(amount);

    if (status) {
      // validation must run in the same function where transferAmount is being changed
      // this is to prevent a re-render in the middle which will fire fetchTransactionFee
      // even if there are errors, because errors would be populated next render, when its too late
      validateTransferAmount(parseFloat(amount));
      setTransferAmountInputValue(amount);
    }
  };

  const calculateTransactionFee = useCallback(async () => {
    try {
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
      };

      if (!fromChain || !selectedToken || !toChain || !transferAmount)
        throw new Error('App not initialised');

      if (isNaN(transferAmount)) throw new Error('Transfer amount is invalid');
      console.log('calculate fee for amount', transferAmount);

      let fixedDecimalPoint = DEFAULT_FIXED_DECIMAL_POINT;
      if (!selectedToken || !toChain || !transferAmount) {
        return;
      }
      let tokenAddress = selectedToken[toChain.chainId].address;
      let fromChainTokenDecimal = selectedToken[fromChain.chainId].decimal;
      let toChainTokenDecimal = selectedToken[toChain.chainId].decimal;
      let fromChainRawTransferAmount = ethers.utils.parseUnits(
        transferAmount.toString(),
        fromChainTokenDecimal,
      );
      let toChainRawTransferAmount = ethers.utils.parseUnits(
        transferAmount.toString(),
        toChainTokenDecimal,
      );

      let transferFee = await getTransferFee(
        tokenAddress,
        toChainRawTransferAmount.toString(),
      );
      if (!transferFee) {
        return;
      }
      let transferFeePerc = transferFee.toString() / BASE_DIVISOR;

      let lpFeeAmountRaw = (transferFeePerc * transferAmount) / 100;
      let lpFeeProcessedString;

      lpFeeProcessedString = lpFeeAmountRaw.toFixed(fixedDecimalPoint);

      let fetchResponse = await getTokenGasPriceDebounced(
        selectedToken[toChain.chainId].address,
        toChain.chainId,
        fetchOptions,
      );

      // Check the balance again using tokenAmount
      // let userBalanceCheck = await checkUserBalance(amount);

      // if (!userBalanceCheck) return;
      // if (!config.isNativeAddress(selectedToken.address)) {
      //   await checkTokenApproval(amount);
      // }

      if (!fetchResponse || !fetchResponse.json) {
        throw new Error(`Invalid response`);
      }

      let response = await fetchResponse.json();

      if (!response || !response.tokenGasPrice) {
        throw new Error(
          `Unable to get token gas price for ${selectedToken.symbol}`,
        );
      }

      // console.log(
      //   `Token gas price for ${selectedToken.symbol} is ${response.tokenGasPrice}`,
      // );

      let tokenGasPrice = response.tokenGasPrice;

      if (!tokenGasPrice) {
        throw new Error(
          'Error while getting selectedTokenConfig and tokenGasPrice from hyphen API',
        );
      }

      let overhead = selectedToken[fromChain.chainId].transferOverhead;
      let decimal = selectedToken[fromChain.chainId].decimal;

      let rewardAmountString;
      let tokenAddressFromChain = selectedToken[fromChain.chainId].address;

      let rewardAmount = await getRewardAmount(
        tokenAddressFromChain,
        fromChainRawTransferAmount.toString(),
      );

      // console.log('************** REWARD AMOUNT  *********', rewardAmount);
      if (rewardAmount !== undefined && rewardAmount.gt && rewardAmount.gt(0)) {
        rewardAmount = formatRawEthValue(rewardAmount, decimal);
        rewardAmountString = toFixed(rewardAmount, fixedDecimalPoint);
      }

      if (!overhead || !decimal) {
        throw new Error(
          'Error while getting token overhead gas and decimal from config',
        );
      }

      let transactionFeeRaw = BigNumber.from(overhead).mul(tokenGasPrice);

      let transactionFee = formatRawEthValue(
        transactionFeeRaw.toString(),
        toChainTokenDecimal,
      );

      let transactionFeeProcessedString = toFixed(
        transactionFee,
        fixedDecimalPoint,
      );

      let amountToGet =
        transferAmount -
        parseFloat(transactionFee) -
        parseFloat(lpFeeProcessedString);

      if (rewardAmount) {
        amountToGet += parseFloat(rewardAmount);
      }

      let amountToGetProcessedString = toFixed(
        amountToGet.toString(),
        fixedDecimalPoint,
      );

      const transferFeePercentage = (
        transferFee.toString() / BASE_DIVISOR
      ).toFixed(3);

      if (amountToGet <= 0) throw new Error('Amount too low');

      return {
        rewardAmountString,
        lpFeeProcessedString,
        transactionFeeProcessedString,
        amountToGetProcessedString,
        transferFeePercentage,
      };
    } catch (error) {
      console.log(error);
    }
  }, [
    fromChain,
    getRewardAmount,
    getTransferFee,
    selectedToken,
    toChain,
    transferAmount,
  ]);

  const {
    execute: fetchTransactionFee,
    error: fetchTransactionFeeError,
    status: fetchTransactionFeeStatus,
    value: transactionFee,
  } = useAsync(calculateTransactionFee);

  // this is a function, and not an effect being run on transferAmount
  // because we need this effect to run synchronously, in the sense that
  // it should always run together with updating transferAmount, so that
  // we don't trigger another render in the middle
  const validateTransferAmount = useCallback(
    (amount: number) => {
      let newErrors: ValidationErrors[] = [];

      if (!poolInfo) newErrors.push(ValidationErrors.POOLINFO_NOT_LOADED);
      if (!selectedTokenBalance)
        newErrors.push(ValidationErrors.BALANCE_NOT_LOADED);

      // we are not doing the below line, and doing the dumber version to keep TS happy
      // if (errors.length > 0) return errors;
      if (!poolInfo || !selectedTokenBalance || amount === undefined) {
        setErrors(newErrors);
        return;
      }

      if (amount < poolInfo.minDepositAmount) {
        newErrors.push(ValidationErrors.AMOUNT_LT_MIN);
      }

      if (amount > poolInfo.maxDepositAmount) {
        newErrors.push(ValidationErrors.AMOUNT_GT_MAX);
      }

      if (amount > Number(selectedTokenBalance.formattedBalance)) {
        newErrors.push(ValidationErrors.INADEQUATE_BALANCE);
      }

      if (isNaN(amount)) {
        newErrors.push(ValidationErrors.INVALID_AMOUNT);
      }

      // Don't reassign errors array if both new and old are empty
      // This prevents duplicate fetching of transaction fees
      setErrors(oldErrors => {
        if (newErrors.length === 0 && oldErrors.length === 0) {
          return oldErrors;
        } else return newErrors;
      });
    },
    [poolInfo, selectedTokenBalance],
  );

  // both pool info and selected token balance upon changing
  // can make the preexisting errors stale
  // so validate once more when this happens
  useEffect(() => {
    if (poolInfo && selectedTokenBalance) {
      validateTransferAmount(transferAmount);
    }
  }, [poolInfo, selectedTokenBalance, transferAmount, validateTransferAmount]);

  useEffect(() => {
    if (transferAmount) {
      fetchTransactionFee();
    }
  }, [errors, fetchTransactionFee, transferAmount]);

  const preDepositCheck = useCallback(async () => {
    if (!transferAmount || errors.length > 0) {
      throw new Error('Invalid transfer amount');
    }
    if (!fromChain || !toChain || !selectedToken) {
      throw new Error('Prerequisites missing');
    }
    if (fromChain.chainId === toChain.chainId) {
      throw new Error('Same chain transfers are not allowed, please refresh.');
    }

    if (!accounts || !accounts[0]) throw new Error('Wallet not connected');
    if (!hyphen) throw new Error('Hyphen not initialized');

    let tokenDecimals;

    if (selectedToken[fromChain.chainId].address === NATIVE_ADDRESS) {
      tokenDecimals = fromChain.nativeDecimal;
    } else {
      tokenDecimals = await hyphen.tokens.getERC20TokenDecimals(
        selectedToken[fromChain.chainId].address,
      );
    }

    const amount = ethers.utils.parseUnits(
      transferAmount.toString(),
      tokenDecimals,
    );

    console.log('Total amount to  be transfered: ', amount.toString());

    let transferStatus = await hyphen.depositManager.preDepositStatus({
      tokenAddress: selectedToken[fromChain.chainId].address,
      amount: amount.toString(),
      fromChainId: fromChain.chainId,
      toChainId: toChain.chainId,
      userAddress: accounts[0],
    });

    if (transferStatus.code === RESPONSE_CODES.ALLOWANCE_NOT_GIVEN) {
      throw new Error('Approval not given for token');
    }

    if (transferStatus.code === RESPONSE_CODES.UNSUPPORTED_NETWORK) {
      throw new Error('Target chain id is not supported yet');
    }

    if (transferStatus.code === RESPONSE_CODES.NO_LIQUIDITY) {
      throw new Error(
        `No liquidity available for ${transferAmount} ${selectedToken.symbol}`,
      );
    }

    if (transferStatus.code === RESPONSE_CODES.UNSUPPORTED_TOKEN) {
      throw new Error('Requested token is not supported yet');
    }

    if (transferStatus.code !== RESPONSE_CODES.OK) {
      throw new Error(
        `Error while doing preDeposit check ${transferStatus.message}`,
      );
    }

    return transferStatus;
  }, [
    accounts,
    errors,
    fromChain,
    hyphen,
    selectedToken,
    toChain,
    transferAmount,
  ]);

  const {
    execute: executePreDepositCheck,
    error: executePreDepositCheckError,
    status: executePreDepositCheckStatus,
    value: executePreDepositCheckValue,
  } = useAsync(preDepositCheck);

  const deposit = useCallback(
    async receiverAddress => {
      // showFeedbackMessage("Checking approvals and initiating deposit transaction");
      if (!executePreDepositCheckValue?.depositContract)
        throw new Error('Pre deposit check not completed');
      if (!fromChain || !toChain || !accounts?.[0] || !selectedToken)
        throw new Error('Prerequisites missing from chain');
      if (fromChain.chainId === toChain.chainId) {
        throw new Error(
          'Same chain transfers are not allowed, please refresh.',
        );
      }

      let tokenDecimals;

      if (selectedToken[fromChain.chainId].address === NATIVE_ADDRESS) {
        tokenDecimals = fromChain.nativeDecimal;
      } else {
        tokenDecimals = await hyphen.tokens.getERC20TokenDecimals(
          selectedToken[fromChain.chainId].address,
        );
      }

      let depositTx = await hyphen.depositManager.deposit({
        sender: accounts[0],
        receiver: receiverAddress,
        tokenAddress: selectedToken[fromChain.chainId].address,
        depositContractAddress: executePreDepositCheckValue.depositContract,
        amount: ethers.utils
          .parseUnits(transferAmount.toString(), tokenDecimals)
          .toString(),
        fromChainId: fromChain.chainId,
        toChainId: toChain.chainId,
        useBiconomy: isBiconomyEnabled,
        dAppName: config.constants.DEPOSIT_TAG,
      });

      addTxNotification(
        depositTx,
        'Deposit',
        `${fromChain.explorerUrl}/tx/${depositTx.hash}`,
      );
      return depositTx;

      // postDepositTransaction(depositTx.hash);
      // await depositTx.wait(1);
    },
    [
      accounts,
      executePreDepositCheckValue?.depositContract,
      fromChain,
      hyphen,
      isBiconomyEnabled,
      selectedToken,
      toChain,
      transferAmount,
      addTxNotification,
    ],
  );

  const {
    execute: executeDeposit,
    error: executeDepositError,
    status: executeDepositStatus,
    value: executeDepositValue,
  } = useAsync(deposit);

  const checkReceival = useCallback(async () => {
    if (!executeDepositValue?.hash)
      throw new Error('Deposit transaction unsuccesful');

    const data = await hyphen.depositManager.checkDepositStatus({
      depositHash: executeDepositValue.hash,
      fromChainId: fromChain?.chainId,
    });
    if (data.statusCode === 1 && data.exitHash && data.exitHash !== '') {
      // Exit hash found but transaction is not yet confirmed
      console.log(`Exit hash on chainId ${data.toChainId} is ${data.exitHash}`);
      return data.exitHash;
    } else if (data.statusCode === 2 && data.exitHash && data.exitHash !== '') {
      console.log('Funds transfer successful');
      console.log(`Exit hash on chainId ${data.toChainId} is ${data.exitHash}`);
      return data.exitHash;
    } else {
      return null;
    }
  }, [executeDepositValue?.hash, fromChain, hyphen]);

  const getExitInfoFromHash = useCallback(
    async hash => {
      if (!toChainRpcUrlProvider || !toChain || !fromChain || !selectedToken)
        throw new Error('Prerequisites missing');
      let receipt;
      try {
        receipt = await toChainRpcUrlProvider.getTransactionReceipt(hash);
      } catch (e) {
        throw new Error('Cannot get transaction');
      }

      if (!receipt?.logs) throw new Error('No error logs');

      let lpManagerInterface = new ethers.utils.Interface(lpmanagerABI);

      let tokenReceipt = receipt.logs.find(
        receiptLog => receiptLog.topics[0] === toChain.topicIds.assetSent,
      );
      try {
        if (!tokenReceipt) {
          throw new Error('No valid receipt log data');
        }
        const data = lpManagerInterface.parseLog(tokenReceipt);
        if (!data?.args?.transferredAmount) throw new Error('Invalid log data');
        let amount = data.args.transferredAmount;
        let processedAmount = ethers.utils.formatUnits(
          amount,
          selectedToken[fromChain.chainId].decimal,
        );
        processedAmount = toFixed(processedAmount, DEFAULT_FIXED_DECIMAL_POINT);
        return processedAmount;
      } catch (error) {
        console.log(error);
        throw new Error('Error while filtering and parsing logs');
      }
    },
    [fromChain, toChain, selectedToken, toChainRpcUrlProvider],
  );

  const changeReceiver = useCallback((event: FormEvent<HTMLInputElement>) => {
    setReceiver({
      receiverAddress: event.currentTarget.value,
      isReceiverValid: ethers.utils.isAddress(event.currentTarget.value),
    });
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transferAmount,
        transferAmountInputValue,
        transactionFee,
        changeTransferAmountInputValue,
        fetchTransactionFeeStatus,
        fetchTransactionFeeError,
        transactionAmountValidationErrors: errors,
        // receiver address
        receiver,
        changeReceiver,
        //deposit stuff
        executeDeposit,
        executeDepositError,
        executeDepositStatus,
        executeDepositValue,
        //pre-deposit stuff
        executePreDepositCheck,
        executePreDepositCheckError,
        executePreDepositCheckStatus,
        executePreDepositCheckValue,
        //check receival stuff
        checkReceival,
        //exit stuff
        setExitHash,
        exitHash,
        getExitInfoFromHash,
      }}
      {...props}
    />
  );
};

const useTransaction = () => useContext(TransactionContext);
export { TransactionProvider, useTransaction };
