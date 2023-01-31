module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    commonjs: true
  },
  extends: [
    // "eslint:recommended",
    // "plugin:node/recommended",
    "eslint:all"
    // "plugin:md/recommended"
    // 'standard'
  ],
  plugins: ["vue", "markdown"],
  overrides: [{
    files: ["*.md"],
    parser: "markdown-eslint-parser"
  },
  {
    files: ["*.md.js"], // Will match js code inside *.md files
    rules: {
      // Example - disable 2 core eslint rules 'no-unused-vars' and 'no-undef'
      "no-unused-vars": "off",
      "no-undef": "off"
    }
  }, {
    files: ["src/nodefony/bundles/monitoring-bundle/src/**/*.{js,vue}"],
    parser: "vue-eslint-parser",
    extends: ["plugin:vue/vue3-essential"],
    parserOptions: {
      parser: {
        "js": "espree"
      },
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      "vue/script-indent": ["error", 2, {
        "baseIndent": 0,
        "switchCase": 0,
        "ignores": []
      }],
      "vue/html-indent": ["error", 2, {
        "attribute": 1,
        "baseIndent": 1,
        "closeBracket": 0,
        "alignAttributesVertically": true,
        "ignores": []
      }],
      "vue/max-attributes-per-line": ["error", {
        "singleline": {
          "max": 1
        },
        "multiline": {
          "max": 1
        }
      }]
    }
  }],
  parserOptions: {
    ecmaVersion: "latest", // 9,
    sourceType: "commonjs"
  },
  globals: {
    nodefony: true,
    kernel: true,
    process: true,
    require: true,
    console: true,
    module: true,
    exports: true,
    yaml: true,
    util: true,
    fs: true,
    path: true,
    cluster: true,
    xmlParser: true,
    async: true,
    crypto: true,
    Sequelize: true,
    url: true,
    http: true,
    https: true,
    pm2: true,
    WebSocketServer: true,
    nodedomain: true,
    dns: true,
    Promise: true,
    zone: true,
    it: true,
    describe: true,
    before: true,
    beforeEach: true,
    BlueBird: true,
    twig: true,
    shell: true,
    clc: true,
    notDefinded: true,
    varNotExit: true,
    window: true,
    document: true,
    navigator: true,
    stage: true,
    $: true,
    jQuery: true,
    Rx: true,
    inquirer: true,
    workbox: true
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "quotes": ["error", "double"],
    "max-len": ["error", {code: 150}],
    "padded-blocks": ["error", "never"],
    "id-length": ["error", {min: 1}],
    "indent": ["error", 2],
    "function-call-argument-newline": ["error", "consistent"],
    "array-bracket-newline": ["error", "consistent"],
    "quote-props": [0],
    "no-return-await": [0],
    "sort-keys": [0],
    "array-element-newline": [0],
    "dot-location": [0],
    "multiline-comment-style": [0],
    "capitalized-comments": [0],
    "max-lines-per-function": ["warn", 100],
    "no-await-in-loop": [0],
    "max-statements": ["warn", 60],
    "no-magic-numbers": [0],
    "sort-vars": ["off"],
    "no-ternary": ["off"],
    "multiline-ternary": ["error", "always-multiline"],
    "one-var": ["off"],
    "guard-for-in": ["off"],
    "class-methods-use-this": ["off"],
    "camelcase": ["off"],
    "no-inline-comments": ["off"],
    "line-comment-position": ["off"],
    "strict": ["off"],
    "max-lines": ["off"],
    "global-require": ["off"],
    "max-classes-per-file": ["off"],
    "no-useless-catch": ["off"]
  }
};
