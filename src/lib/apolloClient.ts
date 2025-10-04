import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const link = new HttpLink({
  uri: process.env.NEXT_PUBLIC_APPSYNC_URL,
  headers: {
    "x-api-key": process.env.NEXT_PUBLIC_APPSYNC_API_KEY ?? "",
  },
});

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default client;