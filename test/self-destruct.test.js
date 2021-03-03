const { visit } = require("../src/trace");
const Actors = require("../src/actors");
jest.mock("../src/debugger");
const {
  CallRelation: PCall,
  ReturnRelation: PReturn,
  SelfDestructRelation: PSelfdestruct
} = require("../src/node/plant");

const { relationsToMatch, verifyTypes } = require("./helper");

const txSelfDestruct = require("./seed/self-destruct");

describe("Self Destruct", () => {
  let umlCommands, actors, state;

  beforeEach(() => {
    umlCommands = [];
    actors = new Actors({ shortParticipantNames: false });
    state = { revertSource: [], deactivations: [], address: [] };
  });

  test("selfestruct", () => {
    visit(txSelfDestruct, null, umlCommands, actors, state);
    expect(umlCommands.length).toBe(4);
    expect(
      relationsToMatch(umlCommands, [PCall, PCall, PReturn, PSelfdestruct])
    ).toBe(true);

    // ignore 3rd command
    const [call1, call2, , destruct_] = umlCommands;

    expect(call1.value.toString()).toBe("0"); // no eth value
    expect(call1.message).toBe("constructor");
    expect(call1.destination).toBe("StacktraceTest_01");
    verifyTypes(call1.parameters[0], { name: "x", type: "uint", value: "1" });

    expect(call2.value.toString()).toBe("0"); // no eth value
    expect(call2.message).toBe("constructor"); // no eth value
    expect(call2.destination).toBe("PakSau_01");
    expect(call2.parameters.length).toBe(0);

    // it should revert the entire transaction
    expect(destruct_.source).toBe("StacktraceTest_01");
    expect(destruct_.destination).toBe("EOA");
    expect(destruct_.arrow).toBe("x-[#green]->");
    expect(destruct_.returnValues).toBe(undefined); // there should be no return values
  });
});
