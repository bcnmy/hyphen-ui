import React, { useEffect } from 'react';

import { useWalletProvider } from '../../context/WalletProvider';
import { useNavigate } from 'react-router-dom';
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

interface BridgeProps {}

const Bridge: React.FC<BridgeProps> = () => {
  const { fromChain, areChainsReady } = useChains()!;
  const { selectedToken } = useToken()!;
  const { transferAmount, changeTransferAmountInputValue } = useTransaction()!;
  const { isBiconomyAllowed, setIsBiconomyToggledOn, isBiconomyEnabled } =
    useBiconomy()!;
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

  useEffect(() => {
    (async () => {
      await connect().catch(e => {
        console.error(e);
      });
    })();
  }, [isLoggedIn, connect]);

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
      <TransferModal
        isVisible={isTransferModalVisible}
        onClose={() => {
          changeTransferAmountInputValue('');
          hideTransferlModal();
        }}
      />
      <ErrorModal error={executeApproveTokenError} title={'Approval Error'} />
      <div className="my-24">
        <div className="mx-auto max-w-xl">
          <div className="relative z-10">
            <div className="flex flex-col gap-2 rounded-10 bg-white p-6 shadow-lg">
              <div className="mb-2 flex items-center justify-end">
                <div className="flex items-center">
                  <HiInformationCircle
                    data-tip
                    data-for="gaslessMode"
                    className="mr-2 text-gray-500"
                  />
                  <CustomTooltip id="gaslessMode">
                    <span>This transaction is sponsored by Biconomy</span>
                  </CustomTooltip>
                  <div
                    className={
                      !isBiconomyAllowed
                        ? 'flex cursor-not-allowed opacity-50'
                        : 'flex'
                    }
                    data-tip
                    data-for="whyGaslessDisabled"
                  >
                    <span className="mr-2 text-base font-semibold text-gray-500">
                      Gasless Mode
                    </span>
                    <Toggle
                      label="Gasless Mode"
                      enabled={isBiconomyEnabled}
                      onToggle={enabled => setIsBiconomyToggledOn(enabled)}
                    />
                  </div>
                </div>
                {!isBiconomyAllowed && (
                  <CustomTooltip id="whyGaslessDisabled">
                    <span>Disabled for selected chain</span>
                  </CustomTooltip>
                )}
              </div>
              <div className="grid grid-cols-[1fr_34px_1fr] gap-2 rounded-xl border border-hyphen-purple border-opacity-10 bg-hyphen-purple bg-opacity-[0.05] p-4 hover:border-opacity-30">
                <NetworkSelectors />
              </div>
              <div className="grid grid-cols-2 items-center gap-12 rounded-xl border border-hyphen-purple border-opacity-10 bg-hyphen-purple bg-opacity-[0.05] p-4 hover:border-opacity-30">
                <AmountInput disabled={!areChainsReady} />
                <TokenSelector disabled={!areChainsReady} />
              </div>

              <ChangeReceiverAddress />

              <CallToAction
                onApproveButtonClick={showApprovalModal}
                onTransferButtonClick={showTransferModal}
              />
            </div>
          </div>
          <TransactionFee />
        </div>
      </div>
    </>
  );
};

export default Bridge;
