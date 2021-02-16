const Frame = require('./frame');
const util = require('util');

module.exports = class CallExternal extends Frame {

  constructor(node, umlParticipants) {
    super(node);
    this.address = node.address;
    this.isDelegate = node.isDelegate;
    this.kind = node.kind;
    this.value = node.value;
    this.data = node.data;
    umlParticipants.add(this);
  }

  getFunctionName() {
    if (this.functionName) return this.functionName;

    switch (this.kind) {
      case 'constructor':
        return 'constructor';

      case 'message':
        if (this.data === '0x' && this.value.gt(0)) {
          // guess transfer...
          return '$'
        }
        return '?';

      default:
        console.error(`Unknown node kind ${this.kind}! update call-external.js:getFunctionName()`);
        return '<unknown>';
    }
  }

  inspect() {
    let out = [
      'CallExternal:',
      `address: ${this.address}`,
      `contractName: ${this.contractName}`,
      `functionName: ${this.getFunctionName()}`,
      `value: ${this.value}`,
    ];

    if (this.arguments && this.arguments.length) {
      const args = this.getArguments()
        .map(({name, type, value}) => `  type: ${type}, name: ${name}, value: ${util.inspect(value)}`)
        .join('\n    ');
      out = out.concat(['arguments:'].concat(args))
    }

    if (this.returnValues) {
      const returnValues = this.getReturnValues()
        .map(({name, type, value}) => `  type: ${type}, name: ${name}, value: ${util.inspect(value)}`)
        .join('\n    ');
      out = out.concat(['returnValues:'].concat(returnValues))
    }
    return out.join('\n  ');
  }

  // extend Frame::pop
  pop(parent, umlCommands, umlParticipants, state) {
    super.pop(parent, umlCommands, umlParticipants, state);
    state.address.pop();
  }
}
