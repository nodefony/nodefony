"use strict";
self["webpackHotUpdatedoc_bundle"]("graphiql",{

/***/ "./Resources/graphiql/graphiql.jsx":
/*!*****************************************!*\
  !*** ./Resources/graphiql/graphiql.jsx ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");
/* harmony import */ var graphiql__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! graphiql */ "./node_modules/graphiql/esm/index.js");
/* harmony import */ var graphiql_graphiql_min_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! graphiql/graphiql.min.css */ "./node_modules/graphiql/graphiql.min.css");
/* harmony import */ var graphiql_graphiql_min_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(graphiql_graphiql_min_css__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _index_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./index.css */ "./Resources/graphiql/index.css");
/* harmony import */ var _index_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_index_css__WEBPACK_IMPORTED_MODULE_4__);
 //import {StrictMode} from 'react';


 //import { createGraphiQLFetcher } from '@graphiql/toolkit';



const NODE_ENV = "development";
const DEBUG = ({"NODE_ENV":"development","VUE_APP_I18N_LOCALE":"en","VUE_APP_I18N_FALLBACK_LOCALE":"en","VUE_APP_VERSION":"6.12.0","VUE_APP_VUE_VERSION":"3.2.33","VUE_APP_DEBUG":"false","VUE_APP_NODE_ENV":"development","VUE_APP_VUETIFY_VERSION":"3.0.0-beta.1","VUE_APP_DOMAIN":"0.0.0.0","VUE_APP_HTTP_PORT":"5151","VUE_APP_HTTPS_PORT":"5152","BASE_URL":"/doc-bundle/"}).DEBUG;
const config = {"projectName":"Nodefony Graphql Api","logo":"/app/images/app-logo.png","url":"/api/graphql"};
const URL = config.url;

function fetcher(graphQLParams) {
  const jwt = localStorage.getItem('token');
  return fetch(URL, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      jwt: jwt
    },
    body: JSON.stringify(graphQLParams),
    credentials: 'same-origin'
  }).then(response => response.json().then(ele => {
    if (ele.error) {
      return ele.error;
    }

    return ele.data;
  }).catch(e => {
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

{
  users {
    username
    name
  }
  CollectLinks{
    username
  }
}

`;
const container = document.getElementById("graphiql");

const Logo = () => {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", {
    className: "graphiql-container",
    style: {
      width: "15%"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("img", {
    width: "30px",
    heigth: "30px",
    src: config.logo
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", {
    className: ""
  }, config.projectName));
}; // See GraphiQL Readme - Advanced Usage section for more examples like this


graphiql__WEBPACK_IMPORTED_MODULE_2__["default"].Logo = Logo;
(0,react_dom__WEBPACK_IMPORTED_MODULE_1__.render)( /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(graphiql__WEBPACK_IMPORTED_MODULE_2__["default"], {
  fetcher: fetcher,
  defaultQuery: defaultQuery
}), container);

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ !function() {
/******/ 	__webpack_require__.h = function() { return "7eae8d651496269d"; }
/******/ }();
/******/ 
/******/ }
);
//# sourceMappingURL=graphiql.5c4eee987a53b2dd.hot-update.js.map