const {
  PlantUMLDeactivate,
  CallRelation,
  ReturnRelation,
  RevertRelation,
  MessageRelation,
  SelfDestructRelation
} = require('./plant');

const Call = require("./call-base");

module.exports = class Frame extends Call {

  constructor(node) {
    super(node);
  }

  push(parent, umlCommands, umlParticipants, state) {

    // try/catch mechanics.
    // any reverts on state?
    if (state.revertSource.length) {
      const source = state.revertSource.shift();

      umlCommands.push(new RevertRelation({
        destination: this.umlID(umlParticipants),
        source: source.umlID(umlParticipants),
        errorValues: source.getErrorValues()
      }));

      while (state.deactivations.length) {
        umlCommands.push(state.deactivations.shift());
      }
    }

    const Rel = this.kind === 'message'
      ? MessageRelation
      : CallRelation

    umlCommands.push(new Rel({
      source: parent.umlID(umlParticipants),
      destination: this.umlID(umlParticipants),
      message: this.getFunctionName(),
      parameters: this.getArguments(),
      value: this.value || 0
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
      state.deactivations.push(new PlantUMLDeactivate(this.umlID(umlParticipants)));;
      return;
    }

    if (this.returnKind === 'selfdestruct') {
      umlCommands.push(new SelfDestructRelation({
        source: this.umlID(umlParticipants),
        destination: umlParticipants.getFirstAliasForAddress(this.beneficiary),
      }));
      return;
    }

    if (this.returnKind === 'revert') {
      state.revertSource.push(this);
      state.deactivations.push(new PlantUMLDeactivate(this.umlID(umlParticipants)));;

      // only pop for call-external
      // state.address.pop();
      return;
    }

    umlCommands.push(new ReturnRelation({
      destination: parent.umlID(umlParticipants),
      source: this.umlID(umlParticipants),
      returnValues: this.getReturnValues()
    }));
  }
}
