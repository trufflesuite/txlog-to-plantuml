const Codec = require('@truffle/codec');
const util = require('util');

module.exports = class Call {

  constructor(option) {
    // The name of the function being called. Will be undefined for
    // constructors, fallback functions, or calls that aren't to functions at
    // all.
    this.functionName = option.functionName;

    // The name of the contract being called.
    this.contractName = option.contractName

    // arguments: An array of arguments passed to the function. Each argument
    // is given as a { name: ..., value: ...} pair, where name is a string (if
    // the argument is named) or undefined (if it's unnamed); and each value
    // uses the decoder output format.
    this.arguments = option.arguments || [];

    // This can be one of "return", "revert", "selfdestruct", or "unwind". If
    // it's "return", that means the call returned normally. If it's "revert",
    // that means it reverted, and "selfdestruct" means it selfdestructed.
    // Note that these returnKinds are only used in the actual innermost call
    // where the revert or selfdestruct happened. The other
    // calls below it in the same EVM stackframe, that got unwound as a result,
    // will get returnKind "unwind". If the revert or selfdestruct happened
    // in an internal call, that means the external call action that started
    // the EVM stackframe will be marked "unwind" as well -- not "revert" or
    // "selfdestruct". Also note that "unwind" is only used back to an EVM call
    // boundary. If the function that made the EVM call reverts as a result, it
    // will be marked "revert", not unwind.
    this.returnKind = option.returnKind;

    // An array of return values, formatted similarly to arguments. Only
    // included if returnKind === "return". For external calls, only included
    // if kind === "function" (see below). Note: Not guaranteed to be included,
    // as decoding may fail!
    this.returnValues = option.returnValues || [];

    // If it's an external call with kind === "constructor" (see below), this
    // will be present instead of returnValues, with an array of the returned
    // contract's immutables, again formatted in the same way.  Note that any
    // immutables which go unused in the deployed contract will be omitted.
    // (Note: Obviously this field can only go on a "callexternal", not a
    // "callinternal", but I've included it here for ease of exposition.)
    // (Won't be included if decoding fails, although that shouldn't
    // happen...?)
    this.returnImmutables = option.returnImmutables;

    // If the returnKind is equal to "revert", this will be included instead of
    // returnValues. It contains the decoded revert message (or lack of
    // message); it takes the form of a Codec ReturndataDecoding, so it may
    // be of kind failure to indicate no message or kind revert to indicate a
    // message. Won't be included if decoding fails.
    this.error = option.error;

    // If the returnKind is equal to selfDestruct, this will be included
    // instead of returnValues. It contains the address that the ether was sent
    // to in the self-destruct. If the contract performed an ether-destroying
    // self-destruct, this field will be null.
    this.beneficiary = option.beneficiary;
  }

  getArguments() {
    return this.extractValues(this.arguments);
  }

  getReturnValues() {
    return this.extractValues(this.returnValues);
  }

  getErrorValues() {
    return this.error && this.error.arguments
      ? this.extractValues(this.error.arguments)
      : [];
  }

  umlID(umlParticipants) {
    return umlParticipants.getAlias(this.address);
  }

  extractValues(collection) {
    if (!collection || !collection.map) {
      return [{ type: '¯\\_(ツ)_/¯', name: '¯\\_(ツ)_/¯', value: 'REVERT' }];
    }

    return collection.map(({value, name}) => {
      let inspectedValue = new Codec.Format.Utils.Inspect.ResultInspector(value);
      return {
        name,
        type: value.type.typeClass,
        value: util.inspect(inspectedValue, {depth: null})
      };
    })
  }
}
