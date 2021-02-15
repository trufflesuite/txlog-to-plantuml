const { PlantUMLDeactivate, PlantUMLRelation } = require('./plant');
const Call = require("./call-base");

module.exports = class Frame extends Call {

  constructor(node) {
    super(node);
  }

  push(parent, umlCommands, umlParticipants, state) {
    let arrow, lifeline;

    if (this.kind === 'message' && this.value.gt(0)) {
      arrow = '-[#green]->';
      lifeline = '';
    } else {
      arrow = '->';
      lifeline = '++';
    }

    // try/catch mechanics.
    // any reverts on state?
    if (state.revertSource.length) {
      const source = state.revertSource.shift();

      umlCommands.push(new PlantUMLRelation({
        arrow: 'x-[#orange]->',
        destination: this.umlID(),
        source: source.umlID(),
        isCall: false,
        lifeline: '--',
        returnValues: source.getErrorValues()
      }));

      while (state.deactivations.length) {
        umlCommands.push(state.deactivations.shift());
      }
    }


    umlCommands.push(new PlantUMLRelation({
      arrow,
      source: parent.umlID(),
      destination: this.umlID(),
      isCall: true,
      lifeline,
      message: this.getFunctionName(),
      parameters: this.getArguments(),
      value: this.value
    }));
  }

  pop(parent, umlCommands, umlParticipants, state) {
    // Todo: Can an external node of message kind return a value
    // don't return message (for now)
    //
    // Todo: Should kind check preeceed returnKind check?
    //
    if (this.kind === 'message') return;

    if (this.returnKind === 'unwind') {
      state.deactivations.push(new PlantUMLDeactivate(this.umlID()));;
      return;
    }

    if (this.returnKind === 'selfdestruct') {
      console.log('SELFDESTRUCT');
      umlCommands.push(new PlantUMLRelation({
        source: this.umlID(),
        arrow: 'x[#55ff11]-->',
        destination: this.beneficiary,
        isCall: false,
        lifeline: '--',
        // Todo: have a way to override message
        returnValues: [{type: 'selfdestruct', name: '', value: 'selfdestruct'}]
      }));
      return;
    }

    if (this.returnKind === 'revert') {
      state.revertSource.push(this);
      state.deactivations.push(new PlantUMLDeactivate(this.umlID()));;

      // only pop for call-external
      // state.address.pop();
      return;
    }

    umlCommands.push(new PlantUMLRelation({
      destination: parent.umlID(),
      source: this.umlID(),
      isCall: false,
      lifeline: '--',
      returnValues: this.getReturnValues()
    }));
  }
}
