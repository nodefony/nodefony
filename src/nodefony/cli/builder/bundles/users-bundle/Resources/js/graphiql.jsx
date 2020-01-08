import React from 'react';
import { render } from 'react-dom';
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';

const Logo = () => <span>Nodefony</span>;

// See GraphiQL Readme - Advanced Usage section for more examples like this
GraphiQL.Logo = Logo;

const App = () => (
  <GraphiQL
    style={{ height: '100vh' }}
    fetcher={async graphQLParams => {
      const data = await fetch(
        //'https://swapi-graphql.netlify.com/.netlify/functions/index',
        'https://localhost:5152/api/graphql/users',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(graphQLParams),
          credentials: 'same-origin',
        },
      );
      let res = await data.json().catch(() => data.text());
      return res.result ;
    }}
  />
);
render(<App />, document.getElementById('root'));
