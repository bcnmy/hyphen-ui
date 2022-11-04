import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { useChains } from './Chains';
import { Network } from 'hooks/useNetworks';

type clientInstance = { [chainId: number]: InstanceType<typeof ApolloClient> };

function constructApolloClients(networks: Network[] | undefined) {
  return networks?.reduce((accumulator, currentValue) => {
    accumulator[currentValue.chainId] = new ApolloClient({
      uri: currentValue.v2GraphUrl,
      cache: new InMemoryCache(),
    });
    return accumulator;
  }, {} as clientInstance);
}

const GraphQLProvider = ({ children, ...props }) => {
  const { fromChain, networks } = useChains()!;
  const apolloClients = constructApolloClients(networks);

  const fromChainClient =
    fromChain && apolloClients ? apolloClients[fromChain?.chainId] : undefined;

  return fromChainClient ? (
    <ApolloProvider client={fromChainClient} {...props}>
      {children}
    </ApolloProvider>
  ) : null;
};

export { GraphQLProvider };
