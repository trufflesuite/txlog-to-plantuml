const BigNumber = require("bignumber.js");

const txlog = {
  type: "transaction",
  actions: [
    {
      type: "callexternal",
      address: "0x204E48B8d9Ebc3C51FEBbd776199216E315fD81E",
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
