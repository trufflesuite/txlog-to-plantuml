const { PlantUMLDeactivate: Subject } = require("../src/node/plant");

describe("PlantUMLDeactivate", () => {
  let node, puml;

  beforeAll(() => {
    node = "NODE";
    puml = new Subject(node);
  });

  test("it is defined", () => {
    expect(Subject).toBeDefined();
  });

  test("renders", () => {
    expect(puml.render()).toBe('deactivate "NODE"');
  });
});
