const { PlantUMLDeactivate, PlantUMLRelation } = require('./plant');

module.exports = class Transaction {

  constructor({ origin }, umlParticipants) {
    this.address = origin;
    umlParticipants.add(this, true);
  }

  push(parent, umlCommands, umlParticipants, state) { }

  pop(parent, umlCommands, umlParticipants, state) {
    console.log('write uml epilogue');
    if (state.revertSource.length) {
      const [source] = state.revertSource;
      umlCommands.push(new PlantUMLRelation({
        arrow: 'x-[#orange]->',
        source: source.umlID(umlParticipants),
        destination: this.umlID(umlParticipants),
        isCall: false,
        lifeline: '--',
        returnValues: source.getErrorValues()
      }));

      umlCommands.push(...state.deactivations);
    }
  }

  umlID(umlParticipants) {
    return umlParticipants.getAlias(this.address);
  }

  inspect() {
    let out = [
      'Transaction:',
      `origin: ${this.origin}`,
    ];
    return out.join('\n  ');
  }

}
