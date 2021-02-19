const BigNumber = require("bignumber.js");

const txlog = {
  type: "transaction",
  actions: [
    {
      type: "callexternal",
      address: "0xCc0A75e86705BC9E3F6E8f4ed7542d28907E6F17",
      contextHash:
        "0x3ede4cf7754a64d660607483f89b0595d8b8810227ce443f5773f966b5e224a4",
      // value: <BN: 0>,
      value: BigNumber(0),
      kind: "function",
      isDelegate: false,
      functionName: "test_a_revert",
      contractName: "Entry",
      arguments: [
        {
          name: "x",
          value: {
            type: { typeClass: "uint", bits: 256, typeHint: "uint256" },
            kind: "value",
            // value: { asBN: <BN: 9>, rawAsBN: <BN: 9> } } } ],
            value: { asBN: BigNumber(9), rawAsBN: BigNumber(9) }
          }
        }
      ],
      actions: [
        {
          type: "callexternal",
          address: "0x35307Bb6770bb8dDC56d2Da1090e1aB6Fd4D113a",
          contextHash:
            "0x26a99d53dfda9fe087cb293ced91f970d1feedfb6bd2da0ff58b4d6d8256aa5c",
          // value: <BN: 0>,
          value: BigNumber(0),
          kind: "function",
          isDelegate: false,
          functionName: "inc_revert",
          contractName: "First",
          arguments: [
            {
              name: "x",
              value: {
                type: { typeClass: "uint", bits: 256, typeHint: "uint256" },
                kind: "value",
                // value: { asBN: <BN: 9>, rawAsBN: <BN: 9> } } } ],
                value: { asBN: BigNumber(9), rawAsBN: BigNumber(9) }
              }
            }
          ],
          actions: [],
          returnKind: "revert",
          error: {
            kind: "revert",
            abi: {
              name: "Error",
              type: "error",
              inputs: [{ name: "", type: "string", internalType: "string" }]
            },
            status: false,
            arguments: [
              {
                value: {
                  type: { typeClass: "string", typeHint: "string" },
                  kind: "value",
                  value: { kind: "valid", asString: "drats!" }
                }
              }
            ],
            decodingMode: "full"
          }
        }
      ],
      returnKind: "revert",
      error: {
        kind: "revert",
        abi: {
          name: "Error",
          type: "error",
          inputs: [{ name: "", type: "string", internalType: "string" }]
        },
        status: false,
        arguments: [
          {
            value: {
              type: { typeClass: "string", typeHint: "string" },
              kind: "value",
              value: { kind: "valid", asString: "drats!" }
            }
          }
        ],
        decodingMode: "full"
      }
    }
  ],
  origin: "0xcE6aa032cB8cb50475ecE84545c3B7a69fcE62aB"
};

module.exports = txlog;
