const BigNumber = require('bignumber.js');
const txlog = { type: 'transaction',
  actions:
   [ { type: 'callexternal',
       address: '0x684513f9107289B811aD43170e506F934E9D0Ff6',
       contextHash:
        '0x3ede4cf7754a64d660607483f89b0595d8b8810227ce443f5773f966b5e224a4',
       value: BigNumber("0"),
       kind: 'function',
       isDelegate: false,
       functionName: 'test_a_catch',
       contractName: 'Entry',
       arguments:
        [ { name: 'x',
            value:
             { type: { typeClass: 'uint', bits: 256, typeHint: 'uint256' },
               kind: 'value',
               value: { asBN: BigNumber(3), rawAsBN: BigNumber(3) } } } ],
       actions:
        [ { type: 'callexternal',
            address: '0x87351211088DE12c6F74b23BA079FF71Ed01231f',
            contextHash:
             '0x26a99d53dfda9fe087cb293ced91f970d1feedfb6bd2da0ff58b4d6d8256aa5c',
            value: BigNumber(0),
            kind: 'function',
            isDelegate: false,
            functionName: 'catch_revert',
            contractName: 'First',
            arguments:
             [ { name: 'x',
                 value:
                  { type: { typeClass: 'uint', bits: 256, typeHint: 'uint256' },
                    kind: 'value',
                    value: { asBN: BigNumber(3), rawAsBN: BigNumber(3) } } } ],
            actions:
             [ { type: 'callexternal',
                 address: '0xc8015556b997Dd1F6a91F4950622f88f61356155',
                 contextHash:
                  '0xc806bfd85d53618b9c6e0d84218c02057ec9abbd50e47343d8fdd947f4e1264e',
                 value: BigNumber(0),
                 kind: 'function',
                 isDelegate: false,
                 functionName: 'double_revert',
                 contractName: 'Second',
                 arguments:
                  [ { name: 'x',
                      value:
                       { type: { typeClass: 'uint', bits: 256, typeHint: 'uint256' },
                         kind: 'value',
                         value: { asBN: BigNumber(3), rawAsBN: BigNumber(3) } } } ],
                 actions: [],
                 returnKind: 'revert',
                 error:
                  { kind: 'revert',
                    abi:
                     { name: 'Error',
                       type: 'error',
                       inputs: [ { name: '', type: 'string', internalType: 'string' } ] },
                    status: false,
                    arguments:
                     [ { value:
                          { type: { typeClass: 'string', typeHint: 'string' },
                            kind: 'value',
                            value:
                             { kind: 'valid',
                               asString: 'Rats! Conditions are imperfect\nIm a bit sleepy...' } } } ],
                    decodingMode: 'full' } },
               { type: 'callinternal',
                 actions: [],
                 functionName: 'self_inc',
                 contractName: 'First',
                 arguments:
                  [ { name: 'x',
                      value:
                       { type: { typeClass: 'uint', bits: 256, typeHint: 'uint256' },
                         kind: 'value',
                         value: { asBN: BigNumber(3), rawAsBN: BigNumber(3) } } } ],
                 returnKind: 'return',
                 returnValues:
                  [ { name: undefined,
                      value:
                       { type: { typeClass: 'uint', bits: 256, typeHint: 'uint256' },
                         kind: 'value',
                         value: { asBN: BigNumber(4), rawAsBN: BigNumber(4) } } } ],
            returnValues:
             [ { value:
                  { type: { typeClass: 'uint', bits: 256, typeHint: 'uint256' },
                    kind: 'value',
                    value: { asBN: BigNumber(4), rawAsBN: BigNumber(4) } } } ],
            returnKind: 'return' },
          { type: 'callexternal',
            address: '0x87351211088DE12c6F74b23BA079FF71Ed01231f',
            contextHash:
             '0x26a99d53dfda9fe087cb293ced91f970d1feedfb6bd2da0ff58b4d6d8256aa5c',
            value: BigNumber(0),
            kind: 'function',
            isDelegate: false,
            functionName: 'inc',
            contractName: 'First',
            arguments:
             [ { name: 'x',
                 value:
                  { type: { typeClass: 'uint', bits: 256, typeHint: 'uint256' },
                    kind: 'value',
                    value: { asBN: BigNumber(4), rawAsBN: BigNumber(4) } } } ],
            actions:
             [ { type: 'callinternal',
                 actions: [],
                 functionName: 'self_inc',
                 contractName: 'First',
                 arguments:
                  [ { name: 'x',
                      value:
                       { type: { typeClass: 'uint', bits: 256, typeHint: 'uint256' },
                         kind: 'value',
                         value: { asBN: BigNumber(4), rawAsBN: BigNumber(4) } } } ],
                 returnKind: 'return',
                 returnValues:
                  [ { name: undefined,
                      value:
                       { type: { typeClass: 'uint', bits: 256, typeHint: 'uint256' },
                         kind: 'value',
                         value: { asBN: BigNumber(5), rawAsBN: BigNumber(5) } } } ] } ],
            returnValues:
             [ { value:
                  { type: { typeClass: 'uint', bits: 256, typeHint: 'uint256' },
                    kind: 'value',
                    value: { asBN: BigNumber(5), rawAsBN: BigNumber(5) } } } ],
            returnKind: 'return' } ],
       returnValues:
        [ { value:
             { type: { typeClass: 'uint', bits: 256, typeHint: 'uint256' },
               kind: 'value',
               value: { asBN: BigNumber(5), rawAsBN: BigNumber(5) } } } ],
       returnKind: 'return' } ],
  origin: '0xcE6aa032cB8cb50475ecE84545c3B7a69fcE62aB' } ]
}

module.exports = txlog
