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
import switchNetwork from "utils/switchNetwork";
import CustomTooltip from "./CustomTooltip";

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
  const {
    receiver: { receiverAddress, isReceiverValid },
    transactionAmountValidationErrors,
  } = useTransaction()!;
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
          onClick={() => {
            if (!walletProvider || !fromChain)
              throw new Error("Prerequisites missing");
            switchNetwork(walletProvider, fromChain);
          }}
        >
          Switch to {fromChain?.name}
        </PrimaryButtonLight>
      </div>
    );
  }

  if (!isReceiverValid) {
    return (
      <div className="flex justify-center gap-8 mt-4">
        <span data-tip data-for="invalidReceiverAddress">
          <PrimaryButtonLight disabled>
            Invalid receiver address
          </PrimaryButtonLight>
        </span>
        <CustomTooltip
          id="invalidReceiverAddress"
          text="This receiver address is not valid, please check the address and try again."
        />
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
          <CustomTooltip
            id="whyTransferDisabled"
            text={
              fetchSelectedTokenApprovalError &&
              transactionAmountValidationErrors.length === 0
                ? "Error trying to fetch token approval"
                : "Enter a valid transfer amount"
            }
          />
        </>
      ) : (
        <>
          {fetchSelectedTokenApprovalStatus === Status.PENDING && (
            <>
              <div
                data-tip
                data-for="whyTransferDisabled"
                className="flex items-center"
              >
                {fetchSelectedTokenApprovalValue === false ? (
                  <SecondaryButtonLight disabled className="mr-8">
                    Approve
                  </SecondaryButtonLight>
                ) : null}
                <PrimaryButtonLight
                  disabled
                  className="flex items-center gap-2"
                >
                  <Spinner />
                  Transfer
                </PrimaryButtonLight>
              </div>
              <CustomTooltip id="whyTransferDisabled" text="Approval loading" />
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
                <CustomTooltip
                  id="whyTransferDisabled"
                  text="Approve token to enable token transfers"
                />
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
