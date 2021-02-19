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
      functionName: "payout",
      contractName: "Insurance",
      arguments: [
        {
          name: "funds",
          value: {
            type: { typeClass: "uint", bits: 256, typeHint: "uint256" },
            kind: "value",
            value: { asBN: BigNumber(0x1b39), rawAsBN: BigNumber(0x1b39) }
          }
        }
      ],
      actions: [
        {
          type: "callexternal",
          address: "0x6065bE577F6E74105C3237005d671D4430D1B1bF",
          contextHash:
            "0x6efc87799af1a114013fb0e82218a46a874353971fd5b1afd22cd7ded6c99d77",
          value: BigNumber(0x1b39),
          kind: "message",
          isDelegate: false,
          functionName: undefined,
          contractName: "Beneficiary",
          arguments: undefined,
          actions: [],
          data: "0x",
          returnKind: "return"
        },
        {
          type: "callexternal",
          address: "0x204E48B8d9Ebc3C51FEBbd776199216E315fD81E",
          contextHash:
            "0x6efc87799af1a114013fb0e82218a46a874353971fd5b1afd22cd7ded6c99d77",
          value: BigNumber(0x1b39),
          kind: "message",
          isDelegate: false,
          functionName: undefined,
          contractName: "Beneficiary",
          arguments: undefined,
          actions: [],
          data: "0x",
          returnKind: "return"
        },
        {
          type: "callexternal",
          address: "0xD4BB7ccC819CEd9f644eaf28c8864eF9E4d3d0De",
          contextHash:
            "0x6efc87799af1a114013fb0e82218a46a874353971fd5b1afd22cd7ded6c99d77",
          value: BigNumber(0x1b39),
          kind: "message",
          isDelegate: false,
          functionName: undefined,
          contractName: "Beneficiary",
          arguments: undefined,
          actions: [],
          data: "0x",
          returnKind: "return"
        }
      ],
      returnValues: [],
      returnKind: "return"
    }
  ],
  origin: "0xa63BF00344594d644979C740A356393707dC00F9"
};

module.exports = txlog;
