import { createContext, useContext } from 'react';
import { toast } from 'react-toastify';

interface INotificationsContext {
  addTxNotification: (tx: any, type: string, explorerUrl: string) => void;
}

const NotificationsContext = createContext<INotificationsContext | null>(null);

const NotificationsProvider: React.FC = props => {
  // useEffect(() => {
  //   toast(<p className="font-sans">This works somehow</p>, {
  //     position: toast.POSITION.BOTTOM_RIGHT,
  //   });
  // }, []);

  const addTxNotification = (tx: any, type: string, explorerUrl: string) => {
    toast.promise(
      tx.wait(1),
      {
        pending: `${type} transaction pending`,
        error: `${type} transaction failed`,
        success: `${type} transaction confirmed`,
      },
      {
        onClick: () => {
          window.open(explorerUrl, '_blank');
        },
        position: toast.POSITION.BOTTOM_RIGHT,
        className: 'font-sans font-medium',
      },
    );
  };

  return (
    <NotificationsContext.Provider value={{ addTxNotification }} {...props} />
  );
};

const useNotifications = () => useContext(NotificationsContext);
export { NotificationsProvider, useNotifications };
