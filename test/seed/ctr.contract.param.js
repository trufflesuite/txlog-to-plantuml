const txlog = {
  actions: [
    {
      actions: [],
      address: "0x721632e3e51B184f7D31f6feB3615d43f465245b",
      arguments: [
        {
          name: "_second",
          value: {
            kind: "value",
            type: {
              contractKind: "contract",
              id: "shimmedcompilation:407",
              kind: "native",
              payable: false,
              typeClass: "contract",
              typeName: "Second"
            },
            value: {
              address: "0xfce12567F214992ed9240eaB996d3118c2B53142",
              class: {
                contractKind: "contract",
                id: "shimmedcompilation:407",
                kind: "native",
                payable: false,
                typeClass: "contract",
                typeName: "Second"
              },
              kind: "known",
              rawAddress: "0xfce12567f214992ed9240eab996d3118c2b53142"
            }
          }
        }
      ],
      contextHash:
        "0x63bd50425ec23ad4b2c672a2636031fdc931fb3c43225f7d769ed9cab4c06c86",
      contractName: "First",
      kind: "constructor",
      returnImmutables: [],
      returnKind: "return",
      salt: null,
      type: "callexternal",
      value: "00"
    }
  ],
  origin: "0x51A8e5D10eDcFdA0dDBE1c7Cfa1A3d56C2841D3a",
  type: "transaction"
};

module.exports = txlog;
