const commonjsGlobals = {
  require: "readonly",
  module: "readonly",
  exports: "writable",
  __dirname: "readonly",
  __filename: "readonly",
  process: "readonly",
  console: "readonly",
  Buffer: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
};

module.exports = [
  {
    files: ["src/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: commonjsGlobals,
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "no-eval": "error",
      "no-restricted-syntax": ["error", "ForInStatement", "WithStatement"],
    },
  },
];
