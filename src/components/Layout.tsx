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
    <div className="grid min-h-screen w-full grid-rows-[3.5rem_1fr_3rem]">
      <Header showUserInfoModal={showUserInfoModal} />
      <UserInfoModal
        isVisible={isUserInfoModalVisible}
        onClose={hideUserInfoModal}
      />
      {children}
      <Footer />
    </div>
  );
}

export default Layout;
