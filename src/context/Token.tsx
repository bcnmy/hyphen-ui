import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { config } from 'config';
import { useChains } from 'context/Chains';
import { useWalletProvider } from 'context/WalletProvider';
import { BigNumber, ethers } from 'ethers';

import erc20ABI from 'abis/erc20.abi.json';
import { DEFAULT_FIXED_DECIMAL_POINT } from 'config/constants';
import useAsync, { Status } from 'hooks/useLoading';
import useTokens, { Token } from 'hooks/useTokens';
import formatRawEthValue from 'utils/formatRawEthValue';
import isTokenValidForChains from 'utils/isTokenValidForChains';
import toFixed from 'utils/toFixed';

interface ITokenBalance {
  formattedBalance: string;
  displayBalance: string;
  userRawBalance: BigNumber;
}

interface ITokenContext {
  changeSelectedToken: (tokenSymbol: string | undefined) => void;
  compatibleTokensForCurrentChains: undefined | Token[];
  getSelectedTokenBalanceStatus: undefined | Status;
  refreshSelectedTokenBalance: () => void;
  selectedToken: undefined | Token;
  selectedTokenBalance: undefined | ITokenBalance;
  tokens:
    | {
        [key: string]: Token;
      }
    | undefined;
  isTokensLoading: boolean;
  isTokensError: boolean;
}

const TokenContext = createContext<ITokenContext | null>(null);

const TokenProvider: React.FC = props => {
  const { accounts } = useWalletProvider()!;
  const { fromChain, fromChainRpcUrlProvider, toChain } = useChains()!;
  const [selectedToken, setSelectedToken] = useState<Token>();

  const {
    data: tokens,
    isLoading: isTokensLoading,
    isError: isTokensError,
  } = useTokens();

  // compute and memoize the compatible tokens
  const compatibleTokensForCurrentChains = useMemo(() => {
    if (!fromChain || !toChain) return;
    return tokens
      ? Object.keys(tokens)
          .filter((tokenSymbol: string) => {
            const token = tokens[tokenSymbol];
            return isTokenValidForChains(token, fromChain, toChain);
          })
          .map((tokenSymbol: string) => tokens[tokenSymbol])
      : [];
  }, [fromChain, toChain, tokens]);

  const tokenContract = useMemo(() => {
    if (!selectedToken || !fromChainRpcUrlProvider || !fromChain) return;
    if (!selectedToken[fromChain.chainId]) return;

    return new ethers.Contract(
      selectedToken[fromChain.chainId].address,
      erc20ABI,
      fromChainRpcUrlProvider,
    );
  }, [selectedToken, fromChainRpcUrlProvider, fromChain]);

  const changeSelectedToken = useCallback(
    (tokenSymbol: string | undefined) => {
      if (!tokenSymbol) {
        setSelectedToken(undefined);
        return;
      }

      if (!fromChain || !toChain) {
        throw new Error("Chains aren't initialized yet");
      }

      const token = tokens![tokenSymbol];
      if (!isTokenValidForChains(token, fromChain, toChain)) {
        throw Error('Provided token is invalid choice for current chains');
      }
      setSelectedToken(token);
    },
    [fromChain, toChain, tokens],
  );

  // construct the async function that can be called to get user balance
  const getSelectedTokenBalance = useCallback(async () => {
    if (
      !fromChainRpcUrlProvider ||
      !tokenContract ||
      !selectedToken ||
      !fromChain ||
      !toChain ||
      !accounts ||
      !accounts[0]
    ) {
      throw new Error('Prerequisites not met');
    }
    let formattedBalance: string;
    let userRawBalance: BigNumber;

    // if selected token is native token for fromChain
    if (
      selectedToken[fromChain.chainId].address.toLowerCase() ===
      config.constants.NATIVE_ADDRESS
    ) {
      userRawBalance = await fromChainRpcUrlProvider.getBalance(accounts[0]);
      let decimals = fromChain.nativeDecimal;

      formattedBalance = formatRawEthValue(userRawBalance.toString(), decimals);
    } else {
      userRawBalance = await tokenContract.balanceOf(accounts[0]);
      let decimals = await tokenContract.decimals();

      formattedBalance = formatRawEthValue(userRawBalance.toString(), decimals);
    }
    let displayBalance = toFixed(formattedBalance, DEFAULT_FIXED_DECIMAL_POINT);

    return { formattedBalance, displayBalance, userRawBalance };
  }, [
    fromChainRpcUrlProvider,
    tokenContract,
    selectedToken,
    fromChain,
    toChain,
    accounts,
  ]);

  const {
    execute: refreshSelectedTokenBalance,
    value: selectedTokenBalance,
    status: getSelectedTokenBalanceStatus,
    // error: getSelectedTokenBalanceError,
  } = useAsync(getSelectedTokenBalance);

  useEffect(() => {
    refreshSelectedTokenBalance();
  }, [getSelectedTokenBalance, refreshSelectedTokenBalance]);

  return (
    <TokenContext.Provider
      value={{
        changeSelectedToken,
        compatibleTokensForCurrentChains,
        getSelectedTokenBalanceStatus,
        refreshSelectedTokenBalance,
        selectedToken,
        selectedTokenBalance,
        tokens,
        isTokensLoading,
        isTokensError,
      }}
      {...props}
    />
  );
};

const useToken = () => useContext(TokenContext);
export { TokenProvider, useToken };
