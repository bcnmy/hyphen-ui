import React, { useEffect, useState } from 'react';

import { useWalletProvider } from '../../context/WalletProvider';
import { useChains } from '../../context/Chains';

import NetworkSelectors from './components/NetworkSelectors';
import TokenSelector from './components/TokenSelector';
import AmountInput from './components/AmountInput';
import TransactionFee from './components/TransactionFee';
import ChangeReceiverAddress from './components/ChangeReceiverAddress';
import CallToAction from './components/CallToAction';
import { Toggle } from 'components/Toggle';
import useModal from 'hooks/useModal';
import ApprovalModal from './components/ApprovalModal';
import { useTokenApproval } from 'context/TokenApproval';
import ErrorModal from './components/ErrorModal';
import TransferModal from './components/TransferModal';
import { useTransaction } from 'context/Transaction';
import { useBiconomy } from 'context/Biconomy';
import CustomTooltip from '../../components/CustomTooltip';
import { HiInformationCircle } from 'react-icons/hi';
import { useToken } from 'context/Token';
import { useHyphen } from 'context/Hyphen';

interface BridgeProps {}

const Bridge: React.FC<BridgeProps> = () => {
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
      <div className="my-24">
        <div className="mx-auto w-full px-6 xl:max-w-170 xl:px-0">
          <div className="flex flex-col gap-8 rounded-10 bg-white p-7.5 shadow-lg xl:gap-12.5 xl:p-12.5">
            <NetworkSelectors />

            <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2 xl:gap-20">
              <TokenSelector
                disabled={
                  !areChainsReady ||
                  !poolInfo?.minDepositAmount ||
                  !poolInfo?.maxDepositAmount
                }
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
