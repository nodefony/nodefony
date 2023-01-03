import React from 'react';
//import {StrictMode} from 'react';
import { render } from "react-dom";
import GraphiQL from "graphiql";
//import { createGraphiQLFetcher } from '@graphiql/toolkit';
import "graphiql/graphiql.min.css";
import "./index.css";
const NODE_ENV = process.env.NODE_ENV ;
const DEBUG = process.env.DEBUG ;
const config =  window.graphiql
const URL = config.url;

function fetcher(graphQLParams) {
  const jwt = localStorage.getItem('token');
  return fetch(URL, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      jwt:jwt
    },
    body: JSON.stringify(graphQLParams),
    credentials: 'same-origin',
  }).then(response => response.json().then((ele)=>{
    if(ele.error){
      return ele.error;
    }
    return ele.data;
  }).catch(e =>{
    throw e;
  }));
}

const defaultQuery = `
# Welcome to GraphiQL
#
# GraphiQL is an in-browser tool for writing, validating, and
# testing GraphQL queries.
#
# Type queries into this side of the screen, and you will see intelligent
# typeaheads aware of the current GraphQL type schema and live syntax and
# validation errors highlighted within the text.
#
# GraphQL queries typically start with a "{" character. Lines that start
# with a # are ignored.
#
# An example GraphQL query might look like:
#
#     {
#       field(arg: "value") {
#         subField
#       }
#     }
#
# Keyboard shortcuts:
#
#  Prettify Query:  Shift-Ctrl-P (or press the prettify button above)
#
#     Merge Query:  Shift-Ctrl-M (or press the merge button above)
#
#       Run Query:  Ctrl-Enter (or press the play button above)
#
#   Auto Complete:  Ctrl-Space (or just start typing)
#

query Router($bundle: String!) {
  routes:getRouteByBundle(name: $bundle){
    name
    path
    host
    variables
    bypassFirewall
    defaultLang
    hash
    prefix
    schemes
    filePath
    bundle
    index
  }
  configs:getConfigByBundle(name: $bundle)
  users:users {
    surname
    name
    enabled
    userNonExpired
    credentialsNonExpired
    accountNonLocked
    lang
    gender
    url
    createdAt
    updatedAt
    image
    roles
  }
}
`;


const container = document.getElementById("graphiql");
const Logo = () => {
  return <span className="graphiql-session-header">
    <img width="50px" heigth="50px" src={config.logo} style={{marginTop:"0px",opacity:1}}></img>
    <span className="title">
      <span>{config.projectName}</span>
    </span>
    </span>
}

// See GraphiQL Readme - Advanced Usage section for more examples like this
GraphiQL.Logo = Logo;

render(
  <GraphiQL fetcher={fetcher} defaultQuery={defaultQuery} />,
  container
);
