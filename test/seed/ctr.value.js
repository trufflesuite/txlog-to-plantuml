const BigNumber = require("bignumber.js");

const txlog = {
  type: "transaction",
  actions: [
    {
      type: "callexternal",
      address: "0x7efD06F7271BA3C7f05CeE42DB07129334ac4527",
      contextHash:
        "0x1490b2aac807183a64a32d07b6524a706de0f113dcf13ca38dd3ad1b3d859966",
      // value: <BN: 1388>,
      value: BigNumber(0x1388),
      kind: "constructor",
      isDelegate: undefined,
      functionName: undefined,
      contractName: "Second",
      arguments: [],
      actions: [],
      salt: null,
      returnKind: "return",
      returnImmutables: []
    }
  ],
  origin: "0xF3053eE8E36eE4cBBBf47A9eded242244A162087"
};

module.exports = txlog;
