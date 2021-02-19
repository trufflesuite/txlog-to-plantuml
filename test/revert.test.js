const util = require("util");
const { visit } = require("../src/trace");
const Actors = require("../src/actors");
jest.mock("../src/debugger");
const {
  CallRelation: PCall,
  ReturnRelation: PReturn,
  RevertRelation: PRevert,
  PlantUMLDeactivate: PDeactivate,
  MessageRelation: PMessage,
  SelfDestructRelation: PSelfdestruct
} = require("../src/node/plant");

const relationsToMatch = (commands, expectedRelations) =>
  commands.every((cmd, i) => cmd instanceof expectedRelations[i]);

const verifyTypes = (obj, expected) => {
  for (let [k, v] of Object.entries(expected)) {
    expect(obj).toHaveProperty(k, v);
  }
};

const revertTransaction = require("./seed/revert.transaction");
const revertCatch = require("./seed/revert.catch");

describe("Reverts", () => {
  let umlCommands, actors, state;

  beforeEach(() => {
    umlCommands = [];
    actors = new Actors({ shortParticipantNames: false });
    state = { revertSource: [], deactivations: [], address: [] };
  });

  test("Entire transaction", () => {
    visit(revertTransaction, null, umlCommands, actors, state);
    expect(umlCommands.length).toBe(5);
    expect(
      relationsToMatch(umlCommands, [
        PCall,
        PCall,
        PRevert,
        PDeactivate,
        PDeactivate
      ])
    ).toBe(true);

    const [call1, call2, revert, deactivate1, deactivate2] = umlCommands;

    expect(call1.value.toString()).toBe("0"); // no value
    expect(call1.message).toBe("test_a_revert"); // no value
    expect(call1.destination).toBe("Entry_01");
    verifyTypes(call1.parameters[0], { name: "x", type: "uint", value: "9" });

    expect(call2.value.toString()).toBe("0"); // no value
    expect(call2.message).toBe("inc_revert"); // no value
    expect(call2.destination).toBe("First_01");
    verifyTypes(call1.parameters[0], { name: "x", type: "uint", value: "9" });

    // it should revert the entire transaction
    expect(revert.source).toBe("First_01");
    expect(revert.destination).toBe("EOA");
    expect(revert.arrow).toBe("x-[#red]->");
    verifyTypes(revert.errorValues[0], { type: "string", value: `'drats!'` });

    // it should deactivate lifelines
    expect(deactivate1.participant).toBe("First_01");
    expect(deactivate2.participant).toBe("Entry_01");
  });

  describe("respects try/catch mechanic", () => {
    beforeEach(() => {
      visit(revertCatch, null, umlCommands, actors, state);
    });

    test("generates the correct digraphs", () => {
      expect(umlCommands.length).toBe(13);
      expect(
        relationsToMatch(umlCommands, [
          PCall,
          PCall,
          PCall,
          PRevert,
          PDeactivate,
          PCall, // continue with business
          PReturn,
          PCall,
          PCall,
          PReturn,
          PReturn,
          PReturn,
          PReturn
        ])
      ).toBe(true);
    });

    test("records with the correct input: fn(x) = x+2", () => {
      const [start] = umlCommands;
      verifyTypes(start.parameters[0], { name: "x", type: "uint", value: "3" });
    });

    test("is caught", () => {
      const [revert, deactivate] = umlCommands.slice(3);
      expect(deactivate.participant).toBe("Second_01");
      expect(revert.source).toBe("Second_01");
      expect(revert.destination).toBe("First_01");
      expect(revert.message).toBe(undefined); // there should be no message
      expect(revert.arrow).toBe("x-[#red]->"); // arrow should be red
      expect(revert.lifeline).toBe("--");
      verifyTypes(revert.errorValues[0], {
        type: "string",
        value: String.raw`'Rats! Conditions are imperfect\nIm a bit sleepy...'`
      });
    });

    test("continues with transaction and solves x=5", () => {
      const [ret] = umlCommands.slice(-2); // get penultimate
      verifyTypes(ret.returnValues[0], { type: "uint", value: "5" });
    });
  });
});

// console.log(util.inspect(umlCommands, {depth:null, colors: true}));
