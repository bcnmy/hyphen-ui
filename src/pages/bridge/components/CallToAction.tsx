import PrimaryButtonLight from 'components/Buttons/PrimaryButtonLight';
import SecondaryButtonLight from 'components/Buttons/SecondaryButtonLight';
import Spinner from 'components/Buttons/Spinner';
import { useBiconomy } from 'context/Biconomy';
import { useChains } from 'context/Chains';
import { useTokenApproval } from 'context/TokenApproval';
import { useTransaction } from 'context/Transaction';
import { useWalletProvider } from 'context/WalletProvider';
import { Status } from 'hooks/useLoading';
import * as React from 'react';
import switchNetwork from 'utils/switchNetwork';
import CustomTooltip from './CustomTooltip';

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
      <div className="mt-4 flex justify-center gap-8">
        <PrimaryButtonLight onClick={() => connect()}>
          Connect Wallet
        </PrimaryButtonLight>
      </div>
    );
  }

  if (!isBiconomyEnabled && fromChain?.chainId !== currentChainId) {
    return (
      <div className="mt-4 flex justify-center gap-8">
        <PrimaryButtonLight
          onClick={() => {
            if (!walletProvider || !fromChain)
              throw new Error('Prerequisites missing');
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
      <div className="mt-4 flex justify-center gap-8">
        <span data-tip data-for="invalidReceiverAddress">
          <PrimaryButtonLight disabled>
            Invalid receiver address
          </PrimaryButtonLight>
        </span>
        <CustomTooltip id="invalidReceiverAddress">
          <span>
            This receiver address is not valid, please check the address and try
            again.
          </span>
        </CustomTooltip>
      </div>
    );
  }

  return (
    <div className="mt-4 flex justify-center gap-8">
      {fetchSelectedTokenApprovalStatus === Status.IDLE ||
      transactionAmountValidationErrors.length > 0 ||
      fetchSelectedTokenApprovalError ? (
        <>
          <span data-tip data-for="whyTransferDisabled">
            <PrimaryButtonLight disabled>Transfer</PrimaryButtonLight>
          </span>
          <CustomTooltip id="whyTransferDisabled">
            {fetchSelectedTokenApprovalError &&
            transactionAmountValidationErrors.length === 0 ? (
              <span>Error trying to fetch token approval</span>
            ) : (
              <span>Enter a valid transfer amount</span>
            )}
          </CustomTooltip>
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
              <CustomTooltip id="whyTransferDisabled">
                <span>Approval loading</span>
              </CustomTooltip>
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
                <CustomTooltip id="whyTransferDisabled">
                  <span>Approve token to enable token transfers</span>
                </CustomTooltip>
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
