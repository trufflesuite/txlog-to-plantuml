const Frame = require("./frame");
const util = require("util");

module.exports = class CallInternal extends Frame {
  constructor (node, address, umlParticipants) {
    super(node);
    this.address = address;
    umlParticipants.add(this);
  }

  getFunctionName () {
    return this.functionName ? this.functionName : "unknown-internal-name";
  }

  inspect () {
    let out = [
      "CallIxternal:",
      `address: ${this.address}`,
      `contractName: ${this.contractName}`,
      `functionName: ${this.getFunctionName()}`
    ];

    if (this.arguments.length) {
      const args = this.getArguments()
        .map(
          ({ name, type, value }) =>
            `  type: ${type}, name: ${name}, value: ${util.inspect(value)}`
        )
        .join("\n    ");
      out = out.concat(["arguments:"].concat(args));
    }

    return out.join("\n  ");
  }
};
