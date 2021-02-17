const { RevertRelation } = require('./plant');

module.exports = class Transaction {

  constructor({ origin }, umlParticipants) {
    this.address = origin;
    umlParticipants.add(this, true);
  }

  push(_parent, _umlCommands, _umlParticipants) { }

  pop(_parent, umlCommands, umlParticipants, state) {
    if (state.revertSource.length) {
      const [source] = state.revertSource;
      umlCommands.push(new RevertRelation ({
        source: source.umlID(umlParticipants),
        destination: this.umlID(umlParticipants),
        errorValues: source.getErrorValues()
      }));

      umlCommands.push(...state.deactivations);
    }
  }

  umlID(umlParticipants) {
    // HACK: isEOA
    // return umlParticipants.getAlias(this, isEOA=true);
    return 'EOA';
  }

  inspect() {
    let out = [
      'Transaction:',
      `origin: ${this.origin}`,
    ];
    return out.join('\n  ');
  }

}
