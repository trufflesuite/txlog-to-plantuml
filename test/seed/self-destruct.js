const BigNumber = require("bignumber.js");

const txlog = {
  type: "transaction",
  actions: [
    {
      type: "callexternal",
      address: "0xF1352ccBAd660699Dbc38157C78b7fc43f24F601",
      contextHash:
        "0xa4b09519965394df62c5af181dd3606d6296a84bf7b1b9b575c2478e05c66d50",
      value: BigNumber("0x0"),
      kind: "constructor",
      isDelegate: undefined,
      functionName: undefined,
      contractName: "StacktraceTest",
      arguments: [
        {
          name: "x",
          value: {
            type: { typeClass: "uint", bits: 256, typeHint: "uint256" },
            kind: "value",
            value: { asBN: BigNumber("0x1"), rawAsBN: BigNumber("0x1") }
          }
        }
      ],
      actions: [
        {
          type: "callexternal",
          address: "0x87a091ED2D2C53C624F8bDdE08019ee1e097569C",
          contextHash:
            "0x848192bbbfc979c0bb348ff77b46bc0dc9b01b27d80135943446c4ad4a8c89a5",
          value: BigNumber("0x0"),
          kind: "constructor",
          isDelegate: undefined,
          functionName: undefined,
          contractName: "PakSau",
          arguments: [],
          actions: [],
          salt: null,
          returnKind: "return",
          returnImmutables: []
        }
      ],
      salt: null,
      returnKind: "selfdestruct",
      beneficiary: "0x8DE97402A58e95A52E045B31fDC2d07CdeFf3946"
    }
  ],
  origin: "0x8DE97402A58e95A52E045B31fDC2d07CdeFf3946"
};

module.exports = txlog;
