import { createClient } from 'graphql-ws';
// Apollo Client Web v3.5.10 has a GraphQLWsLink class which implements
// graphql-ws directly. For older versions, see the next code block
// to define your own GraphQLWsLink.
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';

const use = function(url){


  /*return  createClient({
      url: url,
      on: {
        connected: (socket) => (
          console.log("connect")
        ),
        ping: (received) => {
          console.log(ping)
        },
        pong: (received) => {
            console.log(pong)
        }
      }
    });*/

  return new GraphQLWsLink(
    createClient({
      url: url,
      connectionParams: () => {
        const session =  null//getSession();
        return {
          Authorization: `Bearer 1234`,
        };
      },
    }),
  );
}

export default use
