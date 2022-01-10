import PrimaryButtonLight from "components/Buttons/PrimaryButtonLight";
import SecondaryButtonLight from "components/Buttons/SecondaryButtonLight";
import Spinner from "components/Buttons/Spinner";
import { useBiconomy } from "context/Biconomy";
import { useChains } from "context/Chains";
import { useTokenApproval } from "context/TokenApproval";
import { useTransaction } from "context/Transaction";
import { useWalletProvider } from "context/WalletProvider";
import { Status } from "hooks/useLoading";
import * as React from "react";
import ReactTooltip from "react-tooltip";
import switchNetwork from "utils/switchNetwork";

export interface ICallToActionProps {
  onApproveButtonClick: () => void;
  onTransferButtonClick: () => void;
}

export const CallToAction: React.FC<ICallToActionProps> = ({
  onApproveButtonClick,
  onTransferButtonClick,
}) => {
  const {
    executeApproveToken,
    executeApproveTokenError,
    executeApproveTokenStatus,
    fetchSelectedTokenApproval,
    fetchSelectedTokenApprovalError,
    fetchSelectedTokenApprovalStatus,
    fetchSelectedTokenApprovalValue,
  } = useTokenApproval()!;

  const { fromChain } = useChains()!;
  const { walletProvider, currentChainId, connect, isLoggedIn } =
    useWalletProvider()!;
  const { transactionAmountValidationErrors } = useTransaction()!;
  const { isBiconomyEnabled } = useBiconomy()!;

  if (!isLoggedIn) {
    return (
      <div className="flex justify-center gap-8 mt-4">
        <PrimaryButtonLight onClick={() => connect()}>
          Connect Wallet
        </PrimaryButtonLight>
      </div>
    );
  }

  if (!isBiconomyEnabled && fromChain?.chainId !== currentChainId) {
    return (
      <div className="flex justify-center gap-8 mt-4">
        <PrimaryButtonLight
          onClick={() => switchNetwork(walletProvider!, fromChain)}
        >
          Switch to {fromChain?.name}
        </PrimaryButtonLight>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-8 mt-4">
      {fetchSelectedTokenApprovalStatus === Status.IDLE ||
      transactionAmountValidationErrors.length > 0 ||
      fetchSelectedTokenApprovalError ? (
        <>
          <span data-tip data-for="whyTransferDisabled">
            <PrimaryButtonLight disabled>Transfer</PrimaryButtonLight>
          </span>
          <ReactTooltip id="whyTransferDisabled" type="dark" effect="solid">
            <span>
              {fetchSelectedTokenApprovalError &&
              transactionAmountValidationErrors.length === 0
                ? "Error trying to fetch token approval"
                : "Enter a valid transfer amount"}
            </span>
          </ReactTooltip>
        </>
      ) : (
        <>
          {fetchSelectedTokenApprovalStatus === Status.PENDING && (
            <>
              <span data-tip data-for="whyTransferDisabled">
                <PrimaryButtonLight disabled>
                  <span className="flex items-center gap-2">
                    <Spinner />
                    <span>Transfer</span>
                  </span>
                </PrimaryButtonLight>
              </span>
              <ReactTooltip id="whyTransferDisabled" type="dark" effect="solid">
                <span>Approval loading</span>
              </ReactTooltip>
            </>
          )}
          {fetchSelectedTokenApprovalStatus === Status.SUCCESS &&
            fetchSelectedTokenApprovalValue === false && (
              <>
                {executeApproveTokenStatus === Status.PENDING ? (
                  <SecondaryButtonLight disabled>
                    <span className="flex items-center gap-2">
                      <Spinner />
                      <span>Approve</span>
                    </span>
                  </SecondaryButtonLight>
                ) : (
                  <SecondaryButtonLight onClick={onApproveButtonClick}>
                    Approve
                  </SecondaryButtonLight>
                )}
                <span data-tip data-for="whyTransferDisabled">
                  <PrimaryButtonLight disabled>Transfer</PrimaryButtonLight>
                </span>
                <ReactTooltip
                  id="whyTransferDisabled"
                  type="dark"
                  effect="solid"
                >
                  <span>Approve token to enable token transfers</span>
                </ReactTooltip>
              </>
            )}

          {fetchSelectedTokenApprovalStatus === Status.SUCCESS &&
            fetchSelectedTokenApprovalValue === true && (
              <PrimaryButtonLight onClick={onTransferButtonClick}>
                Transfer
              </PrimaryButtonLight>
            )}
        </>
      )}
    </div>
  );
};

export default CallToAction;
