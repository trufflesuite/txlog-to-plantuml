// const BigNumber = require('bignumber.js');
const { visit } = require("../src/trace");
const Actors = require("../src/actors");
jest.mock("../src/debugger");
const { CallRelation, ReturnRelation } = require("../src/node/plant");

const relationsToMatch = (commands, expectedRelations) =>
  commands.every((cmd, i) => cmd instanceof expectedRelations[i]);

const verifyTypes = (obj, expected) => {
  for (let [k, v] of Object.entries(expected)) {
    expect(obj).toHaveProperty(k, v);
  }
};

const seedBasic = require("./seed/ctr.basic");
const seedWithContractParam = require("./seed/ctr.contract.param");
const seedWithValue = require("./seed/ctr.value");

describe("Constructors", () => {
  let umlCommands, actors, state;

  beforeEach(() => {
    umlCommands = [];
    actors = new Actors({ shortParticipantNames: false });
    state = { revertSource: [], deactivations: [], address: [] };
  });

  test("basic", () => {
    visit(seedBasic, null, umlCommands, actors, state);
    expect(umlCommands.length).toBe(2);

    expect(umlCommands[0].source).toBe("EOA"); // First digraph origin should be 'EOA'
    expect(relationsToMatch(umlCommands, [CallRelation, ReturnRelation])).toBe(
      true
    );
  });

  test("contract param", () => {
    visit(seedWithContractParam, null, umlCommands, actors, state);
    expect(umlCommands.length).toBe(2);
    expect(umlCommands[0].source).toBe("EOA"); // First digraph origin should be 'EOA'
    expect(relationsToMatch(umlCommands, [CallRelation, ReturnRelation])).toBe(
      true
    );

    expect(actors.getAllParticipants().length).toBe(2);

    const [r1, r2] = umlCommands;

    // first relation's parameters
    verifyTypes(r1.parameters[0], {
      name: "_second",
      type: "contract",
      value: "0xfce12567F214992ed9240eaB996d3118c2B53142 (Second)"
    });

    // and no return values for last relation
    expect(r2.returnValues.length).toBe(0);
  });

  test("contract with value", () => {
    visit(seedWithValue, null, umlCommands, actors, state);
    expect(umlCommands.length).toBe(2);
    expect(umlCommands[0].source).toBe("EOA"); // First digraph origin should be 'EOA'
    expect(relationsToMatch(umlCommands, [CallRelation, ReturnRelation])).toBe(
      true
    );

    expect(actors.getAllParticipants().length).toBe(2);

    const [r1, r2] = umlCommands;
    expect(r1.value.toString()).toBe("5000");

    // and no return values for last relation
    expect(r2.returnValues.length).toBe(0);
  });
});
