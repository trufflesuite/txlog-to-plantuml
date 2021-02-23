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

const revertCatch = require("./seed/revert.catch");

describe("Renders", () => {
  let umlCommands, actors, state;

  beforeEach(() => {
    umlCommands = [];
    actors = new Actors({ shortParticipantNames: false });
    state = { revertSource: [], deactivations: [], address: [] };
  });

  test("multiline messages as multiple table rows", () => {
    visit(revertCatch, null, umlCommands, actors, state);
    const revertNode = umlCommands.find(c => c instanceof PRevert);
    expect(revertNode instanceof PRevert).toBe(true);

    // match:
    // (\n\
    // <#FEFECE,#FEFECE>| string |  | 'words |\n\
    // <#FEFECE,#FEFECE>|  |  | words ' |\n\
    // )
    const rex = /\(.+\)$/s;

    const renderedText = revertNode.render();
    const renderedParamRows = renderedText.match(rex)[0].split("\n");
    // rows = 2 (for open and close parens) + 2 for split line
    expect(renderedParamRows.length).toBe(4);
  });

  test.skip("array input as multiple table rows", () => {});
});

// console.log(util.inspect(umlCommands, {depth:null, colors: true}));
