const BigNumber = require("bignumber.js");

const txlog = {
  type: "transaction",
  actions: [
    {
      type: "callexternal",
      address: "0x5E8981a6dd521E2B23f46f8B4F312f9477e9d4a7",
      contextHash:
        "0x4eeb48cec1bc2d5b6d2345a6d26a16b7846b4ab7b73d641bf56dcb760e090c7d",
      value: BigNumber("0x1bc16d674ec80000"),
      kind: "message",
      isDelegate: false,
      functionName: undefined,
      contractName: "Insurance",
      arguments: undefined,
      actions: [],
      data: "0x",
      returnKind: "return"
    }
  ],
  origin: "0xa63BF00344594d644979C740A356393707dC00F9"
};

module.exports = txlog;
