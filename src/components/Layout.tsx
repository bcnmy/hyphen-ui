import Header from './Header';
import Footer from './Footer';
import UserInfoModal from '../pages/bridge/components/UserInfoModal';
import useModal from '../hooks/useModal';

interface LayoutProps {
  children?: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const {
    isVisible: isUserInfoModalVisible,
    hideModal: hideUserInfoModal,
    showModal: showUserInfoModal,
  } = useModal();

  return (
    <div className="grid min-h-screen w-screen grid-rows-[auto_1fr_auto] xl:grid-rows-[auto_1fr_3rem]">
      <Header showUserInfoModal={showUserInfoModal} />
      <UserInfoModal
        isVisible={isUserInfoModalVisible}
        onClose={hideUserInfoModal}
      />
      {children}
      <Footer showUserInfoModal={showUserInfoModal} />
    </div>
  );
}

export default Layout;
