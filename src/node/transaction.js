const { PlantUMLDeactivate, PlantUMLRelation } = require('./plant');

module.exports = class Transaction {

  constructor({ origin }) {
    this.origin = origin;
  }

  push(parent, umlCommands, umlParticipants, state) {
    console.log('write uml prologue');
  }

  pop(parent, umlCommands, umlParticipants, state) {
    console.log('write uml epilogue');
    if (state.revertSource.length) {
      const [source] = state.revertSource;
      umlCommands.push(new PlantUMLRelation({
        arrow: 'x-[#orange]->',
        destination: this.umlID(),
        source: source.umlID(),
        isCall: false,
        lifeline: '--',
        returnValues: source.getErrorValues()
      }));

      umlCommands.push(...state.deactivations);
    }
  }

  umlID() {
    return `${this.origin}`;
  }

  inspect() {
    let out = [
      'Transaction:',
      `origin: ${this.origin}`,
    ];
    return out.join('\n  ');
  }

}
