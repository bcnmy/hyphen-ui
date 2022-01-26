import AwesomeDebouncePromise from "awesome-debounce-promise";
import { BigNumber, ethers } from "ethers";
import {
  createContext,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import lpmanagerABI from "contracts/lpmanager.abi.json";

// @ts-ignore
import { RESPONSE_CODES } from "@biconomy/hyphen";

import {
  DEFAULT_FIXED_DECIMAL_POINT,
  LP_FEE_FRACTION,
  NATIVE_ADDRESS,
} from "config/constants";
import { useChains } from "./Chains";
import { useHyphen } from "./Hyphen";
import { useToken } from "./Token";
import { useTokenApproval } from "./TokenApproval";
import config from "config";
import toFixed from "utils/toFixed";
import formatRawEthValue from "utils/formatRawEthValue";
import useAsync, { Status } from "hooks/useLoading";
import { useWalletProvider } from "./WalletProvider";
import { IoMdReturnLeft } from "react-icons/io";
import { useBiconomy } from "./Biconomy";
import { exit } from "process";
import { useNotifications } from "./Notifications";

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
  fetchOptions: any
) =>
  fetch(
    `${config.hyphen.baseURL}${config.hyphen.getTokenGasPricePath}?tokenAddress=${tokenAddress}&networkId=${networkId}`,
    fetchOptions
  );
const getTokenGasPriceDebounced = AwesomeDebouncePromise(getTokenGasPrice, 500);

const TransactionProvider: React.FC = (props) => {
  const { selectedToken, selectedTokenBalance } = useToken()!;
  const { toChainRpcUrlProvider } = useChains()!;
  const { poolInfo, hyphen } = useHyphen()!;
  const { fromChain, toChain } = useChains()!;
  const { isBiconomyEnabled } = useBiconomy()!;
  const { accounts } = useWalletProvider()!;
  const { addTxNotification } = useNotifications()!;

  // exit hash for last transaction
  const [exitHash, setExitHash] = useState<string>();

  const {
    executeApproveToken,
    executeApproveTokenError,
    executeApproveTokenStatus,
    fetchSelectedTokenApproval,
    fetchSelectedTokenApprovalError,
    fetchSelectedTokenApprovalStatus,
    fetchSelectedTokenApprovalValue,
  } = useTokenApproval()!;

  const [errors, setErrors] = useState<ValidationErrors[]>([]);

  const [transferAmountInputValue, setTransferAmountInputValue] =
    useState<string>("");

  const [receiver, setReceiver] = useState<{
    receiverAddress: string;
    isReceiverValid: boolean;
  }>({
    receiverAddress: "",
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
    setTransferAmountInputValue("");
  }, [fromChain, toChain, selectedToken]);

  const transferAmount = useMemo(
    () => parseFloat(transferAmountInputValue),
    [transferAmountInputValue]
  );

  // Fetch token approval when conditions change
  useEffect(() => {
    if (
      errors.length === 0 ||
      (executeApproveTokenStatus === Status.SUCCESS && errors.length === 0)
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

  const changeTransferAmountInputValue = (amount: string) => {
    const regExp = /^((\d+)?(\.\d*)?)$/;
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
    const fetchOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    };

    if (!fromChain || !selectedToken || !toChain || !transferAmount)
      throw new Error("App not initialised");

    if (isNaN(transferAmount)) throw new Error("Transfer amount is invalid");
    console.log("calculate fee for amount", transferAmount);

    let fixedDecimalPoint =
      selectedToken[fromChain.chainId].fixedDecimalPoint ||
      DEFAULT_FIXED_DECIMAL_POINT;

    let lpFeeAmountRaw = (LP_FEE_FRACTION * transferAmount) / 100;
    let lpFeeProcessedString;

    lpFeeProcessedString = lpFeeAmountRaw.toFixed(fixedDecimalPoint);

    let fetchResponse = await getTokenGasPriceDebounced(
      selectedToken[toChain.chainId].address,
      toChain.chainId,
      fetchOptions
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
        `Unable to get token gas price for ${selectedToken.symbol}`
      );
    }

    console.log(
      `Token gas price for ${selectedToken.symbol} is ${response.tokenGasPrice}`
    );

    let tokenGasPrice = response.tokenGasPrice;

    if (!tokenGasPrice) {
      throw new Error(
        "Error while getting selectedTokenConfig and tokenGasPrice from hyphen API"
      );
    }

    let overhead = selectedToken[fromChain.chainId].transferOverhead;
    let decimal = selectedToken[fromChain.chainId].decimal;

    if (!overhead || !decimal) {
      throw new Error(
        "Error while getting token overhead gas and decimal from config"
      );
    }

    let transactionFeeRaw = BigNumber.from(overhead).mul(tokenGasPrice);

    let transactionFee = formatRawEthValue(
      transactionFeeRaw.toString(),
      decimal
    );

    let transactionFeeProcessedString = toFixed(
      transactionFee,
      fixedDecimalPoint
    );

    let amountToGet =
      transferAmount -
      parseFloat(transactionFee) -
      parseFloat(lpFeeProcessedString);

    let amountToGetProcessedString = toFixed(
      amountToGet.toString(),
      fixedDecimalPoint
    );

    if (amountToGet <= 0) throw new Error("Amount too low");

    return {
      lpFeeProcessedString,
      transactionFeeProcessedString,
      amountToGetProcessedString,
    };
  }, [fromChain, toChain, selectedToken, transferAmount]);

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
      setErrors((oldErrors) => {
        if (newErrors.length === 0 && oldErrors.length === 0) {
          return oldErrors;
        } else return newErrors;
      });
    },
    [poolInfo, selectedTokenBalance]
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
    if (errors.length === 0) {
      fetchTransactionFee();
    }
  }, [errors, fetchTransactionFee]);

  const preDepositCheck = useCallback(async () => {
    if (!transferAmount || errors.length > 0) {
      throw new Error("Invalid transfer amount");
    }
    if (!fromChain || !toChain || !selectedToken)
      throw new Error("Prerequisites missing");

    if (!accounts || !accounts[0]) throw new Error("Wallet not connected");
    if (!hyphen) throw new Error("Hyphen not initialized");

    let tokenDecimals;

    if (selectedToken[fromChain.chainId].address === NATIVE_ADDRESS) {
      tokenDecimals = fromChain.nativeDecimal;
    } else {
      tokenDecimals = await hyphen.getERC20TokenDecimals(
        selectedToken[fromChain.chainId].address
      );
    }

    const amount = ethers.utils.parseUnits(
      transferAmount.toString(),
      tokenDecimals
    );

    console.log("Total amount to  be transfered: ", amount.toString());

    let transferStatus = await hyphen.preDepositStatus({
      tokenAddress: selectedToken[fromChain.chainId].address,
      amount: amount.toString(),
      fromChainId: fromChain.chainId,
      toChainId: toChain.chainId,
      userAddress: accounts[0],
    });

    if (transferStatus.code === RESPONSE_CODES.ALLOWANCE_NOT_GIVEN) {
      throw new Error("Approval not given for token");
    }

    if (transferStatus.code === RESPONSE_CODES.UNSUPPORTED_NETWORK) {
      throw new Error("Target chain id is not supported yet");
    }

    if (transferStatus.code === RESPONSE_CODES.NO_LIQUIDITY) {
      throw new Error(
        `No liquidity available for ${transferAmount} ${selectedToken.symbol}`
      );
    }

    if (transferStatus.code === RESPONSE_CODES.UNSUPPORTED_TOKEN) {
      throw new Error("Requested token is not supported yet");
    }

    if (transferStatus.code !== RESPONSE_CODES.OK) {
      throw new Error(
        `Error while doing preDeposit check ${transferStatus.message}`
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
    async (receiverAddress) => {
      // showFeedbackMessage("Checking approvals and initiating deposit transaction");
      if (!executePreDepositCheckValue?.depositContract)
        throw new Error("Pre deposit check not completed");
      if (!fromChain || !toChain || !accounts?.[0] || !selectedToken)
        throw new Error("Prerequisites missing from chain");

      let tokenDecimals;

      if (selectedToken[fromChain.chainId].address === NATIVE_ADDRESS) {
        tokenDecimals = fromChain.nativeDecimal;
      } else {
        tokenDecimals = await hyphen.getERC20TokenDecimals(
          selectedToken[fromChain.chainId].address
        );
      }

      let depositTx = await hyphen.deposit({
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
      });

      addTxNotification(
        depositTx,
        "Deposit",
        `${fromChain.explorerUrl}/tx/${depositTx.hash}`
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
    ]
  );

  const {
    execute: executeDeposit,
    error: executeDepositError,
    status: executeDepositStatus,
    value: executeDepositValue,
  } = useAsync(deposit);

  const checkReceival = useCallback(async () => {
    if (!executeDepositValue?.hash)
      throw new Error("Deposit transaction unsuccesful");

    const data = await hyphen.checkDepositStatus({
      depositHash: executeDepositValue.hash,
      fromChainId: fromChain?.chainId,
    });
    if (data.statusCode === 1 && data.exitHash && data.exitHash !== "") {
      // Exit hash found but transaction is not yet confirmed
      console.log(`Exit hash on chainId ${data.toChainId} is ${data.exitHash}`);
      return data.exitHash;
    } else if (data.statusCode === 2 && data.exitHash && data.exitHash !== "") {
      console.log("Funds transfer successful");
      console.log(`Exit hash on chainId ${data.toChainId} is ${data.exitHash}`);
      return data.exitHash;
    } else {
      return null;
    }
  }, [executeDepositValue?.hash, fromChain, hyphen]);

  const getExitInfoFromHash = useCallback(
    async (hash) => {
      if (!toChainRpcUrlProvider || !toChain || !fromChain || !selectedToken)
        throw new Error("Prerequisites missing");
      let receipt;
      try {
        receipt = await toChainRpcUrlProvider.getTransactionReceipt(hash);
      } catch (e) {
        throw new Error("Cannot get transaction");
      }

      if (!receipt?.logs) throw new Error("No error logs");

      let lpManagerInterface = new ethers.utils.Interface(lpmanagerABI);

      let tokenReceipt = receipt.logs.find(
        (receiptLog) => receiptLog.topics[0] === toChain.assetSentTopicId
      );

      if (!tokenReceipt) {
        throw new Error("No valid receipt log data");
      }

      const data = lpManagerInterface.parseLog(tokenReceipt);

      if (!data?.args?.transferredAmount) throw new Error("Invalid log data");

      let amount = data.args.transferredAmount;

      let processedAmount = ethers.utils.formatUnits(
        amount,
        selectedToken[fromChain.chainId].decimal
      );

      processedAmount = toFixed(
        processedAmount,
        selectedToken[fromChain.chainId].fixedDecimalPoint ||
          DEFAULT_FIXED_DECIMAL_POINT
      );

      return processedAmount;
    },
    [fromChain, toChain, selectedToken, toChainRpcUrlProvider]
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
