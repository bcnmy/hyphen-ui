import { useHyphen } from 'context/Hyphen';
import { useToken } from 'context/Token';
import { useTokenApproval } from 'context/TokenApproval';
import { useTransaction } from 'context/Transaction';
import useModal from 'hooks/useModal';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChains } from '../../context/Chains';
import { useWalletProvider } from '../../context/WalletProvider';
import AmountInput from './components/AmountInput';
import ApprovalModal from './components/ApprovalModal';
import CallToAction from './components/CallToAction';
import ChangeReceiverAddress from './components/ChangeReceiverAddress';
import ErrorModal from './components/ErrorModal';
import NetworkSelectors from './components/NetworkSelectors';
import TokenSelector from './components/TokenSelector';
import TransactionFee from './components/TransactionFee';
import TransferModal from './components/TransferModal';

interface BridgeProps {}

const Bridge: React.FC<BridgeProps> = () => {
  const { sourceChainId, destinationChainId, tokenSymbol } = useParams();

  const { areChainsReady, fromChain, toChain, toChainRpcUrlProvider } =
    useChains()!;
  const { selectedToken } = useToken()!;
  const { changeTransferAmountInputValue, transferAmount, transactionFee } =
    useTransaction()!;
  const { poolInfo } = useHyphen()!;

  const { isLoggedIn, connect } = useWalletProvider()!;
  const {
    isVisible: isApprovalModalVisible,
    hideModal: hideApprovalModal,
    showModal: showApprovalModal,
  } = useModal();
  const {
    isVisible: isTransferModalVisible,
    hideModal: hideTransferlModal,
    showModal: showTransferModal,
  } = useModal();
  const { executeApproveTokenError, executeApproveToken } = useTokenApproval()!;

  // Save a snapshot of all the data required by TransferModal pass it down to TransferModal,
  // this is done to avoid re-rendering TransferModal when the context changes.
  // Context can change when the user switches to a different network, their wallet disconnects etc.
  // after the transfer has been initiated. These changes in context will cause errors and show
  // inconsistent or no data in the transaction modal.
  const [transferModalData, setTransferModalData] = useState<any>();

  useEffect(() => {
    (async () => {
      await connect().catch(e => {
        console.error(e);
      });
    })();
  }, [isLoggedIn, connect]);

  function handleTransferButtonClick() {
    const updatedTransferModalData = {
      fromChain,
      selectedToken,
      toChain,
      toChainRpcUrlProvider,
      transferAmount,
      transactionFee,
    };

    setTransferModalData(updatedTransferModalData);
    showTransferModal();
  }

  return (
    <>
      {fromChain && selectedToken && transferAmount ? (
        <ApprovalModal
          executeTokenApproval={executeApproveToken}
          isVisible={isApprovalModalVisible}
          onClose={hideApprovalModal}
          selectedChainName={fromChain.name}
          selectedTokenName={selectedToken.symbol}
          transferAmount={transferAmount}
        />
      ) : null}

      {isTransferModalVisible ? (
        <TransferModal
          isVisible={isTransferModalVisible}
          onClose={() => {
            changeTransferAmountInputValue('');
            hideTransferlModal();
          }}
          transferModalData={transferModalData}
        />
      ) : null}
      <ErrorModal error={executeApproveTokenError} title={'Approval Error'} />
      <div className="bg-cover bg-top bg-no-repeat py-12.5 xl:bg-bridge">
        <div className="mx-auto w-full px-6 xl:max-w-170 xl:px-0">
          <div
            className={`flex flex-col gap-8 rounded-10 bg-white p-7.5 shadow-lg xl:p-12.5 ${
              transferAmount ? 'rounded-b-none' : ''
            }`}
          >
            <NetworkSelectors
              sourceChainId={sourceChainId}
              destinationChainId={destinationChainId}
            />

            <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2 xl:gap-20">
              <TokenSelector
                disabled={
                  !areChainsReady ||
                  !poolInfo?.minDepositAmount ||
                  !poolInfo?.maxDepositAmount
                }
                tokenSymbol={tokenSymbol}
              />
              <AmountInput
                disabled={
                  !areChainsReady ||
                  !poolInfo?.minDepositAmount ||
                  !poolInfo?.maxDepositAmount
                }
              />
            </div>

            <ChangeReceiverAddress />

            <CallToAction
              onApproveButtonClick={showApprovalModal}
              onTransferButtonClick={handleTransferButtonClick}
            />
          </div>
          <TransactionFee />
        </div>
      </div>
    </>
  );
};

export default Bridge;
