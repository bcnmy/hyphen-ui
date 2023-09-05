import { useChains } from "context/Chains";
import { useToken } from "context/Token";
import { Status } from "hooks/useLoading";
import { useBiconomy } from "context/Biconomy";
import { useHyphen } from "context/Hyphen";
import { BigNumber } from "ethers";
import { useAccount } from "wagmi";

export { };

export function useTokenApproval(): {
  checkSelectedTokenApproval: ((amount: number) => Promise<boolean>) | null;
  approveToken: (
    isInfiniteApproval: boolean,
    tokenAmount: number
  ) => Promise<void>;
} {
  const { address: account } = useAccount();
  const { selectedToken } = useToken()!;
  const { isBiconomyEnabled } = useBiconomy()!;
  const { hyphen, poolInfo, getPoolInfoStatus } = useHyphen()!;
  const { fromChain } = useChains()!;

  /*
    if all the prerequisites are met, then:
      checkSelectedToken is an async function
    else:
      It is null
    This is being done so that this function can be used with useAsync,
    and only cause side effects when all prerequisites are met.
  */
  const checkSelectedTokenApproval = (() => {
    if (!hyphen) return null;
    if (
      !poolInfo?.fromLPManagerAddress ||
      !fromChain ||
      !selectedToken?.[fromChain?.chainId].address ||
      !account
    ) {
      // console.error({ poolInfo, selectedToken, accounts });
      return null;
    }
    return async (amount: number) => {
      if (!amount && amount <= 0) throw new Error("Invalid approval amount");
      // console.log({ poolInfo, selectedToken, accounts });

      let tokenAllowance = await hyphen.getERC20Allowance(
        selectedToken[fromChain.chainId].address,
        account,
        poolInfo.fromLPManagerAddress
      );

      let tokenDecimals = await hyphen.getERC20TokenDecimals(
        selectedToken[fromChain.chainId].address
      );

      let rawAmount = amount * Math.pow(10, tokenDecimals);

      let rawAmountString = rawAmount.toString();

      let rawAmountHexString = BigNumber.from(rawAmountString).toHexString();

      if (!tokenAllowance)
        throw new Error("Unable to check for token approval");
      console.log("Token allowance is ", tokenAllowance);
      console.log("Token amount", rawAmount);
      if (tokenAllowance.lt(rawAmountHexString)) {
        return false;
      } else {
        return true;
      }
    };
  })();

  const approveToken = async (
    isInfiniteApproval: boolean,
    tokenAmount: number
  ) => {
    if (!hyphen) throw new Error("Hyphen not ready");
    if (getPoolInfoStatus !== Status.SUCCESS)
      throw new Error("Pool Info not loaded yet");

    if (
      !selectedToken ||
      !fromChain ||
      !selectedToken[fromChain.chainId] ||
      !poolInfo?.fromLPManagerAddress ||
      !account
    ) {
      console.log({ selectedToken, fromChain, poolInfo, account });
      throw new Error(
        "Unable to proceed with approval. Some information is missing. Check console for more info"
      );
    }

    try {
      let tokenDecimals = await hyphen.getERC20TokenDecimals(
        selectedToken[fromChain.chainId].address
      );

      let rawAmount = tokenAmount * Math.pow(10, tokenDecimals);
      let rawAmountHexString = BigNumber.from(rawAmount).toHexString();

      let approveTx = await hyphen.approveERC20(
        selectedToken[fromChain.chainId].address,
        poolInfo.fromLPManagerAddress,
        rawAmountHexString,
        account,
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
      await approveTx.wait(1);
      console.log("Approved");

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
        console.log(error);
        throw new Error("Unable to get token approval");
      }
    }
  };

  return {
    approveToken,
    checkSelectedTokenApproval,
  };
}
