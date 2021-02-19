const BigNumber = require("bignumber.js");

const txlog = {
  type: "transaction",
  actions: [
    {
      type: "callexternal",
      address: "0x5E8981a6dd521E2B23f46f8B4F312f9477e9d4a7",
      contextHash:
        "0x4eeb48cec1bc2d5b6d2345a6d26a16b7846b4ab7b73d641bf56dcb760e090c7d",
      value: BigNumber(0x0),
      kind: "function",
      isDelegate: false,
      functionName: "register",
      contractName: "Insurance",
      arguments: [
        {
          name: "a",
          value: {
            type: { typeClass: "address", kind: "specific", payable: true },
            kind: "value",
            value: {
              asAddress: "0x6065bE577F6E74105C3237005d671D4430D1B1bF",
              rawAsHex:
                "0x0000000000000000000000006065be577f6e74105c3237005d671d4430d1b1bf"
            }
          }
        }
      ],
      actions: [],
      returnValues: [],
      returnKind: "return"
    }
  ],
  origin: "0xa63BF00344594d644979C740A356393707dC00F9"
};

module.exports = txlog;
