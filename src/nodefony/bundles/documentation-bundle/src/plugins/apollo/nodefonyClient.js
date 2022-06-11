import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  ApolloLink,
  concat,
  from
} from '@apollo/client/core'
import {
  RetryLink
} from "@apollo/client/link/retry";

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: '/api/graphql',
})

export default (nodefony) =>{
  // Cache implementation
  const cache = new InMemoryCache()

  const retryLink = new RetryLink({
    delay: {
      initial: 300,
      max: Infinity,
      jitter: true
    },
    attempts: {
      max: 3,
      retryIf: (error, operation) => handleRetry(error, operation)
    }
  })

  const handleRetry = async (error, operation) => {
    let requiresRetry = false
    if (error && error.statusCode === 401) {
      requiresRetry = true
      //if (!this.refreshingToken) {
      //this.refreshingToken = true
      await requestRefreshToken()
      operation.setContext(({
        headers = {}
      }) => ({
        credentials: 'include',
        headers: getAuthHeaders(headers)
      }));
      //this.refreshingToken = false
      //}
    }
    return requiresRetry
  }

  const requestRefreshToken = async () => {
    console.log("requestRefreshToken")
    return await nodefony.api.getToken()
  }

  const getAuthHeaders = (headers) => {
    return {
      ...headers,
      jwt: localStorage.getItem('token') || null,
      'client-name': 'Nodefony',
      'client-version': '1.0.0'
    }
  }

  const formatResponse = new ApolloLink((operation, forward) => {
    return forward(operation).map(response => {
      return response.data;
    });
  });

  const authMiddleware = new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    operation.setContext(({
      headers = {}
    }) => ({
      credentials: 'include',
      headers: getAuthHeaders(headers)
    }));
    return forward(operation);
  })

  // Create the apollo client
  const apolloClient = new ApolloClient({
    link: from([
      authMiddleware,
      formatResponse,
      retryLink,
      httpLink
    ]),
    //link: formatResponse.concat(authMiddleware, httpLink),
    cache,
  })
  return apolloClient
}
