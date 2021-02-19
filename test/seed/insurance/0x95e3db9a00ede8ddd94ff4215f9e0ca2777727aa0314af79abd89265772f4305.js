const BigNumber = require("bignumber.js");

const txlog = {
  type: "transaction",
  actions: [
    {
      type: "callexternal",
      address: "0x5E8981a6dd521E2B23f46f8B4F312f9477e9d4a7",
      contextHash:
        "0x1edd5f365ada7b1c4baa4cd6b54c2a3a2777df023ecbadc1cb6563501e9f59fe",
      value: BigNumber(0x0),
      kind: "constructor",
      isDelegate: undefined,
      functionName: undefined,
      contractName: "Insurance",
      arguments: [],
      actions: [],
      salt: null,
      returnKind: "return",
      returnImmutables: []
    }
  ],
  origin: "0xa63BF00344594d644979C740A356393707dC00F9"
};

module.exports = txlog;
