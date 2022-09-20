import { Network } from 'hooks/useNetworks';
import { Token } from 'hooks/useTokens';

function isTokenValidForChains(
  token: Token,
  fromChain: Network,
  toChain: Network,
) {
  // return true if token has config available for both from and to chains
  // else return false
  return !!(
    token[fromChain.chainId]?.isSupportedOnBridge &&
    token[toChain.chainId]?.isSupportedOnBridge
  );
}

export default isTokenValidForChains;
