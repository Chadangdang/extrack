import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_APPSYNC_URL,
  headers: {
    "x-api-key": process.env.NEXT_PUBLIC_APPSYNC_API_KEY ?? "",
  },
  cache: new InMemoryCache(),
});

export default client;