import { Link, NavLink, useLocation } from 'react-router-dom';
import { useWalletProvider } from 'context/WalletProvider';
import { HiOutlineArrowSmRight } from 'react-icons/hi';
import NetworkSelector from './NetworkSelector';
import { ENV } from 'types/environment';

interface IHeaderProps {
  showUserInfoModal: () => void;
}

function Header({ showUserInfoModal }: IHeaderProps) {
  const location = useLocation();
  const { accounts, connect, isLoggedIn } = useWalletProvider()!;
  const userAddress = accounts?.[0];

  const showNetworkSelector = [
    '/pools',
    '/pools/',
    '/farms',
    '/farms/',
  ].includes(location.pathname);

  const statsUrl =
    process.env.REACT_APP_ENV === ENV.production
      ? 'https://hyphen-stats.biconomy.io/'
      : 'https://hyphen-stats-staging.biconomy.io/';

  return (
    <header className="sticky top-0 z-20 grid w-full grid-flow-col items-center bg-[#2e2c62] pl-6 pr-8 text-white xl:grid-cols-3 xl:px-6">
      <Link to="/bridge">
        <img
          src={`${process.env.PUBLIC_URL}/hyphen-logo.svg`}
          className="hidden h-8 w-auto xl:flex"
          alt="Hyphen Logo"
        />
        <img
          src={`${process.env.PUBLIC_URL}/hyphen-logo-small.svg`}
          className="flex h-8 w-auto xl:hidden"
          alt="Hyphen Logo"
        />
      </Link>
      <nav className="flex items-center gap-7 justify-self-end text-white xl:justify-self-center">
        <NavLink to="/bridge">
          {({ isActive }) => (
            <span
              className={
                isActive
                  ? 'relative'
                  : 'relative text-gray-400 hover:text-white'
              }
            >
              Bridge
              <span
                className={
                  isActive
                    ? 'absolute -inset-1 top-[33px] block h-[5px] rounded-t-full bg-white'
                    : 'hidden'
                }
                aria-hidden="true"
              ></span>
            </span>
          )}
        </NavLink>
        <NavLink
          to="/pools"
          className={({ isActive }) => (isActive ? 'relative' : 'relative')}
        >
          {({ isActive }) => (
            <span
              className={
                isActive
                  ? 'relative'
                  : 'relative text-gray-400 hover:text-white'
              }
            >
              Pools
              <span
                className={
                  isActive
                    ? 'absolute -inset-1 top-[33px] block h-[5px] rounded-t-full bg-white'
                    : 'hidden'
                }
                aria-hidden="true"
              ></span>
            </span>
          )}
        </NavLink>
        <NavLink
          to="/farms"
          className={({ isActive }) => (isActive ? 'relative' : 'relative')}
        >
          {({ isActive }) => (
            <span
              className={
                isActive
                  ? 'relative'
                  : 'relative text-gray-400 hover:text-white'
              }
            >
              Farms
              <span
                className={
                  isActive
                    ? 'absolute -inset-1 top-[33px] block h-[5px] rounded-t-full bg-white'
                    : 'hidden'
                }
                aria-hidden="true"
              ></span>
            </span>
          )}
        </NavLink>
        <a
          target="_blank"
          href={statsUrl}
          rel="noreferrer"
          className="relative flex items-center text-gray-400 hover:text-white"
        >
          Stats
          <HiOutlineArrowSmRight className="absolute top-[2px] right-[-12px] h-3 w-3 -rotate-45" />
        </a>
      </nav>
      <div className="hidden items-center justify-self-end xl:flex">
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
    </header>
  );
}

export default Header;
