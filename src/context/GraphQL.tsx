import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { useChains } from "./Chains";
import { chains } from "../config/chains";

type clientInstance = { [chainId: number]: InstanceType<typeof ApolloClient> };

export const apolloClients = chains.reduce((accumulator, currentValue) => {
    accumulator[currentValue.chainId] = new ApolloClient({
        uri: currentValue.graphURL,
        cache: new InMemoryCache(),
    });
    return accumulator;
}, {} as clientInstance);

const GraphQLProvider: React.FC = ({ children, ...props }) => {
    const { fromChain } = useChains()!;
    const fromChainClient = fromChain
        ? apolloClients[fromChain.chainId]
        : apolloClients[chains[0].chainId];

    return (
        <ApolloProvider client={fromChainClient} {...props}>
            {children}
        </ApolloProvider>
    );
};

export { GraphQLProvider };

