import { useWalletProvider } from 'context/WalletProvider';
import { useLocation } from 'react-router-dom';
import poweredByBiconomy from '../assets/images/powered-by-biconomy.svg';
import NetworkSelector from './NetworkSelector';

interface IFooterProps {
  showUserInfoModal: () => void;
}

function Footer({ showUserInfoModal }: IFooterProps) {
  const location = useLocation();
  const { accounts, connect, isLoggedIn } = useWalletProvider()!;
  const userAddress = accounts?.[0];

  const showNetworkSelector = [
    '/pools',
    '/pools/',
    '/farms',
    '/farms/',
  ].includes(location.pathname);

  return (
    <footer className="sticky bottom-0 z-20 grid h-auto w-full grid-cols-1 items-center bg-black px-0 xl:grid-cols-3 xl:px-6">
      <a
        target="_blank"
        href="https://biconomy.io/"
        rel="noreferrer"
        className="mb-2 justify-self-center xl:mb-0 xl:justify-self-start"
      >
        <img src={poweredByBiconomy} alt="Powered by Biconomy" />
      </a>
      <div className="mb-4 flex justify-self-center text-[#808080] xl:mb-0">
        <a
          href="https://discord.com/channels/692403655474937856/947490096075141150"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white"
        >
          Join our Discord
        </a>
        <p className="mx-2">|</p>
        <a
          href="mailto:hyphen-support@biconomy.io"
          className="hover:text-white"
        >
          Email Us
        </a>
      </div>
      <div className="flex h-[3.5rem] w-full items-center justify-center bg-[#2e2c62] xl:mb-0 xl:hidden">
        {showNetworkSelector ? <NetworkSelector /> : null}
        <button
          className="font-base ml-2.5 cursor-pointer rounded-xl bg-hyphen-purple bg-opacity-50 px-4 py-1 font-mono text-white"
          onClick={isLoggedIn ? showUserInfoModal : connect}
        >
          {isLoggedIn
            ? `${userAddress?.slice(0, 6)}...${userAddress?.slice(-6)}`
            : 'Connect Wallet'}
        </button>
      </div>
    </footer>
  );
}

export default Footer;
