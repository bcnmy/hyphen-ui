import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// @ts-ignore
import { Hyphen, RESPONSE_CODES, SIGNATURE_TYPES } from "@biconomy/hyphen";

import { useWalletProvider } from "context/WalletProvider";
import { useChains } from "context/Chains";
import { useToken } from "context/Token";
import useAsync, { Status } from "hooks/useLoading";
import { useBiconomy } from "context/Biconomy";
import { useHyphen } from "context/Hyphen";
import { BigNumber, ethers } from "ethers";
import { NATIVE_ADDRESS } from "config/constants";
import { WebpackError } from "webpack";
import { useNotifications } from "./Notifications";

interface ITokenApprovalContext {
  checkSelectedTokenApproval: (amount: number) => Promise<boolean>;
  approveToken: (
    isInfiniteApproval: boolean,
    tokenAmount: number
  ) => Promise<void>;
  executeApproveToken: (
    isInfiniteApproval: boolean,
    tokenAmount: number
  ) => void;
  executeApproveTokenStatus: Status;
  executeApproveTokenError: Error | undefined;
  fetchSelectedTokenApproval: (amount: number) => void;
  fetchSelectedTokenApprovalStatus: Status;
  fetchSelectedTokenApprovalError: Error | undefined;
  fetchSelectedTokenApprovalValue: boolean | undefined;
}

const TokenApprovalContext = createContext<ITokenApprovalContext | null>(null);

const TokenApprovalProvider: React.FC = ({ ...props }) => {
  const { accounts } = useWalletProvider()!;
  const { selectedToken } = useToken()!;
  const { isBiconomyEnabled } = useBiconomy()!;
  const { hyphen, poolInfo, getPoolInfoStatus } = useHyphen()!;
  const { fromChain } = useChains()!;
  const { addTxNotification } = useNotifications()!;

  const checkSelectedTokenApproval = useCallback(
    async (amount: number) => {
      if (!hyphen) throw new Error("hyphen not initialized");
      if (
        !poolInfo?.fromLPManagerAddress ||
        !fromChain ||
        !selectedToken?.[fromChain?.chainId].address ||
        !accounts?.[0]
      ) {
        // console.error({ poolInfo, selectedToken, accounts, fromChain });
        throw new Error("Prerequisite info missing");
      }
      if (!amount || amount <= 0) throw new Error("Invalid approval amount");
      // console.log({ poolInfo, selectedToken, accounts, hyphen });

      // If native token then approval not needed
      if (selectedToken[fromChain.chainId].address === NATIVE_ADDRESS)
        return true;

      let tokenAllowance;
      let tokenDecimals;

      try {
        tokenAllowance = await hyphen.tokens.getERC20Allowance(
          selectedToken[fromChain.chainId].address,
          accounts[0],
          poolInfo.fromLPManagerAddress
        );

        tokenDecimals = await hyphen.tokens.getERC20TokenDecimals(
          selectedToken[fromChain.chainId].address
        );
      } catch (err) {
        console.error(err);
        throw err;
      }

      let rawAmount = ethers.utils.parseUnits(amount.toString(), tokenDecimals);
      let rawAmountHexString = rawAmount.toHexString();

      if (!tokenAllowance)
        throw new Error("Unable to check for token approval");
      console.log("Token allowance is ", tokenAllowance);
      console.log("Token amount", rawAmount);
      if (tokenAllowance.lt(rawAmountHexString)) {
        return false;
      } else {
        return true;
      }
    },
    [hyphen, accounts, fromChain, poolInfo, selectedToken]
  );

  const {
    execute: fetchSelectedTokenApproval,
    status: fetchSelectedTokenApprovalStatus,
    error: fetchSelectedTokenApprovalError,
    value: fetchSelectedTokenApprovalValue,
  } = useAsync(checkSelectedTokenApproval);

  const approveToken = useCallback(
    async (isInfiniteApproval: boolean, tokenAmount: number) => {
      if (!hyphen) throw new Error("Hyphen not ready");
      if (getPoolInfoStatus !== Status.SUCCESS)
        throw new Error("Pool Info not loaded yet");

      if (
        !selectedToken ||
        !fromChain ||
        !selectedToken[fromChain.chainId] ||
        !poolInfo?.fromLPManagerAddress ||
        !accounts?.[0]
      ) {
        // console.log({ selectedToken, fromChain, poolInfo, accounts });
        throw new Error(
          "Unable to proceed with approval. Some information is missing. Check console for more info"
        );
      }

      try {
        let tokenDecimals = await hyphen.tokens.getERC20TokenDecimals(
          selectedToken[fromChain.chainId].address
        );

        // this takes a user friendly value like 0.12 ETH and then returns a BN equal to 0.12 * 10^tokenDecimals
        let rawAmount = ethers.utils.parseUnits(
          tokenAmount.toString(),
          tokenDecimals
        );
        let rawAmountHexString = rawAmount.toHexString();

        let approveTx = await hyphen.tokens.approveERC20(
          selectedToken[fromChain.chainId].address,
          poolInfo.fromLPManagerAddress,
          rawAmountHexString,
          accounts[0],
          isInfiniteApproval,
          isBiconomyEnabled
        );

        // trackTransactionHash(approveTx.hash, { isApprovalTransaction: true });
        // let notificationId;
        // if (!notify) {
        //   notificationId = showCustomMessage(
        //     "Approve Transaction",
        //     "Transaction has started",
        //     config.getExplorerURL(approveTx.hash, selectedFromChain.chainId),
        //     true,
        //     "info"
        //   );
        // }
        addTxNotification(
          approveTx,
          "Approval",
          `${fromChain.explorerUrl}/tx/${approveTx.hash}`
        );
        return await approveTx.wait(1);

        // if (!notify) {
        //   removeNotification(notificationId);
        //   showCustomMessage(
        //     "Approve Transaction",
        //     "Transaction Confirmed",
        //     config.getExplorerURL(approveTx.hash, selectedFromChain.chainId),
        //     false,
        //     "success"
        //   );
        // }
      } catch (error: any) {
        if (
          error.message &&
          error.message.indexOf("User denied transaction signature") > -1
        ) {
          throw new Error("User denied transaction. Unable to proceed");
        } else {
          console.error(error);
          throw new Error("Unable to get token approval");
        }
      }
    },
    [
      accounts,
      fromChain,
      getPoolInfoStatus,
      hyphen,
      isBiconomyEnabled,
      poolInfo,
      selectedToken,
      addTxNotification,
    ]
  );

  const {
    execute: executeApproveToken,
    status: executeApproveTokenStatus,
    error: executeApproveTokenError,
    value: executeApproveTokenResult,
  } = useAsync(approveToken);

  return (
    <TokenApprovalContext.Provider
      value={{
        approveToken,
        checkSelectedTokenApproval,
        executeApproveToken,
        executeApproveTokenStatus,
        executeApproveTokenError,
        fetchSelectedTokenApproval,
        fetchSelectedTokenApprovalStatus,
        fetchSelectedTokenApprovalError,
        fetchSelectedTokenApprovalValue,
      }}
      {...props}
    />
  );
};

const useTokenApproval = () => useContext(TokenApprovalContext);
export { TokenApprovalProvider, useTokenApproval };
