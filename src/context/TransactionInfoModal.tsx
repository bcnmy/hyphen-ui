import { ChainConfig } from 'config/chains';
import { TokenConfig } from 'config/tokens';
import useModal from 'hooks/useModal';
import TransferInfoModal from 'pages/bridge/components/TransferInfoModal';
import { createContext, useCallback, useContext, useState } from 'react';

export interface ITransferRecord {
  depositHash: string;
  depositAmount: string;
  exitHash: string;
  token: TokenConfig;
  fromChain: ChainConfig;
  toChain: ChainConfig;
  lpFee: string;
  transferredAmount: string;
  transactionFee: string;
  transferTime: string;
  rewardAmount?: string;
}

interface ITransactionInfoModalContext {
  showTransactionInfoModal: (transferRecord: ITransferRecord) => void;
}

const TransactionInfoModalContext =
  createContext<ITransactionInfoModalContext | null>(null);

const TransactionInfoModalProvider: React.FC = ({ children, ...props }) => {
  const {
    isVisible: isTransactionInfoModalVisible,
    showModal,
    hideModal,
  } = useModal();

  const [transferRecord, setTransferRecord] = useState<ITransferRecord>();

  const hideTransactionInfoModal = useCallback(() => {
    setTransferRecord(undefined);
    hideModal();
  }, [hideModal]);

  const showTransactionInfoModal = useCallback(
    (transferRecord: ITransferRecord) => {
      setTransferRecord(transferRecord);
      showModal();
    },
    [showModal],
  );

  return (
    <TransactionInfoModalContext.Provider
      value={{ showTransactionInfoModal }}
      {...props}
    >
      {transferRecord && (
        <TransferInfoModal
          transferRecord={transferRecord}
          isVisible={isTransactionInfoModalVisible}
          onClose={hideTransactionInfoModal}
        />
      )}
      {children}
    </TransactionInfoModalContext.Provider>
  );
};

const useTransactionInfoModal = () => useContext(TransactionInfoModalContext);
export { TransactionInfoModalProvider, useTransactionInfoModal };
