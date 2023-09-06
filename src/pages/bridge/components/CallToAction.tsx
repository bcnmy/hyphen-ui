import arrowRight from 'assets/images/arrow-right.svg';
import PrimaryButtonLight from 'components/Buttons/PrimaryButtonLight';
import { useBiconomy } from 'context/Biconomy';
import { useChains } from 'context/Chains';
import { useToken } from 'context/Token';
import { useTokenApproval } from 'context/TokenApproval';
import { useTransaction, ValidationErrors } from 'context/Transaction';
import { useWalletProvider } from 'context/WalletProvider';
import { Status } from 'hooks/useLoading';
import * as React from 'react';
import switchNetwork from 'utils/switchNetwork';
import CustomTooltip from '../../../components/CustomTooltip';

export interface ICallToActionProps {
  onApproveButtonClick: () => void;
  onTransferButtonClick: () => void;
}

// TODO: Refactor this component for better conditional logic and readability.
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
    transferAmountInputValue,
    transactionAmountValidationErrors,
  } = useTransaction()!;
  const { isBiconomyEnabled } = useBiconomy()!;

  const isBalanceInadequate = transactionAmountValidationErrors.includes(
    ValidationErrors.INADEQUATE_BALANCE,
  );

  if (!isLoggedIn) {
    return (
      <div className="flex justify-center">
        <PrimaryButtonLight onClick={connect} className="xl:w-full">
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
      transferAmountInputValue === '' ||
      transactionAmountValidationErrors.length > 0 ||
      fetchSelectedTokenApprovalError ? (
        <>
          <PrimaryButtonLight
            disabled
            className={
              fetchSelectedTokenApprovalError
                ? 'disabled:bg-[#FF000040] disabled:text-[#FF0000]'
                : ''
            }
          >
            {fetchSelectedTokenApprovalError &&
            transactionAmountValidationErrors.length === 0
              ? 'Error in checking approval'
              : transferAmountInputValue === ''
              ? 'Enter amount'
              : `Approve ${selectedToken?.symbol}`}
          </PrimaryButtonLight>
          <PrimaryButtonLight
            disabled
            className={
              isBalanceInadequate
                ? 'disabled:bg-[#FF000040] disabled:text-[#FF0000]'
                : ''
            }
          >
            {isBalanceInadequate ? 'Insufficient balance' : 'Bridge tokens'}
          </PrimaryButtonLight>
        </>
      ) : (
        <>
          {fetchSelectedTokenApprovalStatus === Status.PENDING && (
            <>
              <PrimaryButtonLight disabled className="mr-8">
                Loading approval
              </PrimaryButtonLight>
              <PrimaryButtonLight disabled>Bridge tokens</PrimaryButtonLight>
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
                    Bridge tokens
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
                  Bridge tokens
                  <img
                    src={arrowRight}
                    alt="Bridge tokens"
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
