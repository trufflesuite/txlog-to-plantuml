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
              asAddress: "0xD4BB7ccC819CEd9f644eaf28c8864eF9E4d3d0De",
              rawAsHex:
                "0x000000000000000000000000d4bb7ccc819ced9f644eaf28c8864ef9e4d3d0de"
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
