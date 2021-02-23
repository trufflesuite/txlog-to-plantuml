const BigNumber = require("bignumber.js");
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

const { verifyTypes } = require("./helper");

// transactions from Insurance tests. todo - link source code
const transactions = [
  // create insurance
  require("./seed/insurance/0x95e3db9a00ede8ddd94ff4215f9e0ca2777727aa0314af79abd89265772f4305"),
  // fund insurance
  require("./seed/insurance/0xaa03da742da9581a0002bcd48d3ee674596b4e0b36a22185133e4ae7657ce16a"),
  // create beneficiary
  require("./seed/insurance/0x4d193ca9eee38bc2e044bd5cb134d07f51d7e9c72b759da301921c1879602c17"),
  // register beneficiary
  require("./seed/insurance/0x8a7a34474610f338415b1889cbbb1cdc556c5749e470771d980e27f6fe5a9122"),
  // create beneficiary
  require("./seed/insurance/0x5b7afcfa3b163b82e0ea52846eefb04f4ee1d202090e15fd74021fdf5657e6cf"),
  // register beneficiary
  require("./seed/insurance/0xff5f8417e92adab13f0d1bbe162af45704769d7196edd272e5dddc60e3bba504"),
  // create beneficiary
  require("./seed/insurance/0xc29e4925aa4062bcf5fbf116d5e277e9c9d070f5474c8065a5c7f8210e3dbe99"),
  // register beneficiary
  require("./seed/insurance/0x513f39737688817006bbe96e333c135558029cba4b06fc986835801c243126ad"),
  // payout the beneficiaries!
  require("./seed/insurance/0x7f59b2fa997e3df58afd26c3f9887f6b1f05bc16a920d4831f80244c6c9e4a99")
];

const resetSpies = () => ({
  umlCommands: [],
  actors: new Actors({ shortParticipantNames: false }),
  state: { revertSource: [], deactivations: [], address: [] }
});

describe("Insurance Tests", () => {
  let umlCommands, actors, state;
  let tx;

  beforeEach(() => {
    ({ umlCommands, actors, state } = resetSpies());
  });

  test("creates an insurance contract", () => {
    tx = transactions.shift();
    visit(tx, null, umlCommands, actors, state);
    expect(umlCommands.length).toBe(2); // two messages
    expect(actors.getAllParticipants().length).toBe(2);
  });

  test("funds the insurance contract", () => {
    tx = transactions.shift();
    visit(tx, null, umlCommands, actors, state);
    expect(umlCommands.length).toBe(1); // one message
    expect(actors.getAllParticipants().length).toBe(2);

    const [msg] = umlCommands;
    expect(msg instanceof PMessage).toBe(true);

    // should be well funded (2e18 wei)
    expect(msg.value.toString()).toBe(BigNumber(2e18).toString());
  });

  test("onboards 3 beneficiaries", () => {
    const beneficiaries = [];

    for (let i = 0; i < 3; i++) {
      // have to reset
      umlCommands = [];
      actors = new Actors({ shortParticipantNames: false });
      state = { revertSource: [], deactivations: [], address: [] };

      ({ umlCommands, actors, state } = resetSpies());
      tx = transactions.shift();

      // create beneficiary
      visit(tx, null, umlCommands, actors, state);
      expect(umlCommands.length).toBe(2); // two messages
      expect(actors.getAllParticipants().length).toBe(2);

      let [src, dst] = umlCommands;

      expect(src instanceof PCall).toBe(true);
      expect(src.source).toBe("EOA");
      expect(src.destination).toBe("Beneficiary_01");
      expect(src.message).toBe("constructor");

      expect(dst instanceof PReturn).toBe(true);
      expect(dst.source).toBe("Beneficiary_01");
      expect(dst.destination).toBe("EOA");

      // address of new beneficiary
      const bene = actors.getAddressForAlias("Beneficiary_01");
      beneficiaries.push(bene);

      // register beneficiary
      ({ umlCommands, actors, state } = resetSpies());
      tx = transactions.shift();
      visit(tx, null, umlCommands, actors, state);

      [src, dst] = umlCommands;

      expect(src instanceof PCall).toBe(true);
      expect(src.source).toBe("EOA");
      expect(src.destination).toBe("Insurance_01");
      expect(src.message).toBe("register");

      verifyTypes(
        src.parameters[0],
        { type: "address", name: "a", value: bene } // match beneficiary
      );

      expect(dst instanceof PReturn).toBe(true);
      expect(dst.source).toBe("Insurance_01");
      expect(dst.destination).toBe("EOA");
    }

    // now match payout!
    ({ umlCommands, actors, state } = resetSpies());
    tx = transactions.shift();
    visit(tx, null, umlCommands, actors, state);

    const [call, msg1, msg2, msg3, ret] = umlCommands;

    // Origin says, pay 6969 to all beneficiaries
    expect(call instanceof PCall).toBe(true);
    expect(call.source).toBe("EOA");
    expect(call.destination).toBe("Insurance_01");
    expect(call.message).toBe("payout");
    verifyTypes(call.parameters[0], {
      type: "uint",
      name: "funds",
      value: "6969"
    });

    [msg1, msg2, msg3].forEach((msg, dx) => {
      const expectedBeneficiary = `Beneficiary_0${dx + 1}`;
      expect(msg instanceof PMessage).toBe(true);
      expect(msg.source).toBe("Insurance_01");
      expect(msg.destination).toBe(expectedBeneficiary);
      expect(msg.message).toBe("$");
      expect(msg.arrow).toBe("-[#green]->");
      expect(msg.value.toString()).toBe(BigNumber("6969").toString());

      const address = actors.getAddressForAlias(expectedBeneficiary);
      expect(address).toBe(beneficiaries[dx]);
    });

    expect(ret instanceof PReturn).toBe(true);
    expect(ret.source).toBe("Insurance_01");
    expect(ret.destination).toBe("EOA");
  });
});
