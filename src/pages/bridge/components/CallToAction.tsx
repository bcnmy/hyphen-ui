import PrimaryButtonLight from 'components/Buttons/PrimaryButtonLight';
import { useBiconomy } from 'context/Biconomy';
import { useChains } from 'context/Chains';
import { useTokenApproval } from 'context/TokenApproval';
import { useTransaction } from 'context/Transaction';
import { useWalletProvider } from 'context/WalletProvider';
import { Status } from 'hooks/useLoading';
import * as React from 'react';
import switchNetwork from 'utils/switchNetwork';
import CustomTooltip from '../../../components/CustomTooltip';
import arrowRight from 'assets/images/arrow-right.svg';
import { useToken } from 'context/Token';

export interface ICallToActionProps {
  onApproveButtonClick: () => void;
  onTransferButtonClick: () => void;
}

export const CallToAction: React.FC<ICallToActionProps> = ({
  onApproveButtonClick,
  onTransferButtonClick,
}) => {
  const {
    executeApproveTokenStatus,
    fetchSelectedTokenApprovalError,
    fetchSelectedTokenApprovalStatus,
    fetchSelectedTokenApprovalValue,
  } = useTokenApproval()!;

  const { walletProvider, currentChainId, connect, isLoggedIn } =
    useWalletProvider()!;
  const { fromChain } = useChains()!;
  const { selectedToken } = useToken()!;
  const {
    receiver: { isReceiverValid },
    transactionAmountValidationErrors,
  } = useTransaction()!;
  const { isBiconomyEnabled } = useBiconomy()!;

  if (!isLoggedIn) {
    return (
      <div className="flex justify-center">
        <PrimaryButtonLight onClick={() => connect()}>
          Connect Wallet
        </PrimaryButtonLight>
      </div>
    );
  }

  if (!isBiconomyEnabled && fromChain?.chainId !== currentChainId) {
    return (
      <div className="flex justify-center">
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
      <div className="flex justify-center">
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
    <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2 xl:gap-20">
      {fetchSelectedTokenApprovalStatus === Status.IDLE ||
      transactionAmountValidationErrors.length > 0 ||
      fetchSelectedTokenApprovalError ? (
        <>
          <PrimaryButtonLight disabled>Enter a valid amount</PrimaryButtonLight>
          <PrimaryButtonLight disabled>Bridge Tokens</PrimaryButtonLight>
        </>
      ) : (
        <>
          {fetchSelectedTokenApprovalStatus === Status.PENDING && (
            <>
              <div
                data-tip
                data-for="whyTransferDisabled"
                className="flex w-full justify-between"
              >
                <PrimaryButtonLight disabled className="mr-8">
                  Approve {selectedToken?.symbol}
                </PrimaryButtonLight>
                <PrimaryButtonLight disabled>Bridge Tokens</PrimaryButtonLight>
              </div>
              <CustomTooltip id="whyTransferDisabled">
                <span>Approval loading</span>
              </CustomTooltip>
            </>
          )}

          {fetchSelectedTokenApprovalStatus === Status.SUCCESS &&
            fetchSelectedTokenApprovalValue === false && (
              <>
                {executeApproveTokenStatus === Status.PENDING ? (
                  <PrimaryButtonLight disabled>
                    Approving {selectedToken?.symbol}
                  </PrimaryButtonLight>
                ) : (
                  <PrimaryButtonLight onClick={onApproveButtonClick}>
                    Approve {selectedToken?.symbol}
                  </PrimaryButtonLight>
                )}
                <span data-tip data-for="whyTransferDisabled">
                  <PrimaryButtonLight disabled>
                    Bridge Tokens
                  </PrimaryButtonLight>
                </span>
                <CustomTooltip id="whyTransferDisabled">
                  <span>Approve token to enable token transfers</span>
                </CustomTooltip>
              </>
            )}

          {fetchSelectedTokenApprovalStatus === Status.SUCCESS &&
            fetchSelectedTokenApprovalValue === true && (
              <>
                <PrimaryButtonLight disabled>
                  {selectedToken?.symbol} Approved
                </PrimaryButtonLight>
                <PrimaryButtonLight onClick={onTransferButtonClick}>
                  Bridge Tokens
                  <img
                    src={arrowRight}
                    alt="Bridge Tokens"
                    className="ml-2.5"
                  />
                </PrimaryButtonLight>
              </>
            )}
        </>
      )}
    </div>
  );
};

export default CallToAction;
