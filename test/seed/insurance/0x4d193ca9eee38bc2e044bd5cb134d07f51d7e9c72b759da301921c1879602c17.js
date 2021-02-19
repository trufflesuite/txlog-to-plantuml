const BigNumber = require("bignumber.js");

const txlog = {
  type: "transaction",
  actions: [
    {
      type: "callexternal",
      address: "0x6065bE577F6E74105C3237005d671D4430D1B1bF",
      contextHash:
        "0xf500b661adddfc41bc858f36a05b44ab9ecb60aa237d52af6145764d9ed7c05a",
      value: BigNumber(0x0),
      kind: "constructor",
      isDelegate: undefined,
      functionName: undefined,
      contractName: "Beneficiary",
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
