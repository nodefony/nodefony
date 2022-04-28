import { ApolloClient, createHttpLink, InMemoryCache ,ApolloLink, concat, from} from '@apollo/client/core'


// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: 'https://localhost:5152/api/graphql',
})

// Cache implementation
const cache = new InMemoryCache()


const formatResponse = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    return response.data;
  });
});

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    credentials: 'include',
    headers: {
      ...headers,
      jwt: localStorage.getItem('token') || null,
      'client-name': 'Nodefony',
      'client-version': '1.0.0'
    }
  }));
  return forward(operation);
})

// Create the apollo client
const apolloClient = new ApolloClient({
  link: from([
    authMiddleware,
    formatResponse,
    httpLink
  ]),
  //link: formatResponse.concat(authMiddleware, httpLink),
  cache,
  })

export default apolloClient
