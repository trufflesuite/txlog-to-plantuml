const Actors = require("../src/actors");

const [EOA, ...ADDRESSES] = Array.from(
  { length: 11 },
  (_, i) => "0x" + (i + 1).toString().padStart(40, 0)
);

describe("Actors", () => {
  let actors;

  describe("WITHOUT shortParticipantNames", () => {
    describe("Construction", () => {
      test("constructor defaults to no shortParticipantNames", () => {
        actors = new Actors({});
        expect(actors.shortParticipantNames).toBe(false);
      });

      test("sets shortParticipantNames in constructor", () => {
        actors = new Actors({ shortParticipantNames: false });
        expect(actors.shortParticipantNames).toBe(false);
      });
    });

    describe("Add", () => {
      const contracts = ADDRESSES.map((a, i) => ({
        address: a,
        contractName: `contract${i + 1}`
      }));

      beforeEach(() => {
        actors = new Actors({});
      });

      test("a single contract", () => {
        const node = { address: EOA };
        const eoaAlias = "EOA";

        actors.add(node, true); // isEOA
        const alias = actors.getAlias(node);
        expect(alias).toEqual(eoaAlias);
      });

      test("multiple unique participants", () => {
        actors.add(contracts[0]);
        actors.add(contracts[1]);
        actors.add(contracts[2]);

        expect(actors.getAlias(contracts[0])).toEqual("contract1_01");
        expect(actors.getAlias(contracts[1])).toEqual("contract2_01");
        expect(actors.getAlias(contracts[2])).toEqual("contract3_01");
      });

      test("potential colliding participants", () => {
        const c1 = { ...contracts[0], contractName: "bob" };
        const c2 = { ...contracts[1], contractName: "bob" };
        const c3 = { ...contracts[2], contractName: "bob" };

        actors.add(c1);
        actors.add(c2);
        actors.add(c3);

        expect(actors.getAlias(c1)).toEqual("bob_01");
        expect(actors.getAlias(c2)).toEqual("bob_02");
        expect(actors.getAlias(c3)).toEqual("bob_03");
      });

      test("get all participants", () => {
        for (let i = 0; i < 5; i++) {
          actors.add(contracts[i]);
        }

        for (let i = 0; i < 5; i++) {
          const participants = actors.getAllParticipants();
          expect(participants[i]).toHaveProperty(
            "address",
            contracts[i].address
          );
          expect(participants[i]).toHaveProperty(
            "alias",
            `contract${i + 1}_01`
          );
          expect(participants[i]).toHaveProperty(
            "contractName",
            `contract${i + 1}`
          );
          expect(participants[i]).toHaveProperty(
            "displayName",
            `${contracts[i].address}:contract${i + 1}`
          );
        }
      });
    });
  });

  // --
  describe("WITH shortParticipantNames", () => {
    describe("Add", () => {
      const contracts = ADDRESSES.map((a, i) => ({
        address: a,
        contractName: `contract${i + 1}`
      }));

      beforeEach(() => {
        actors = new Actors({ shortParticipantNames: true });
      });

      test("get all participants", () => {
        for (let i = 0; i < 5; i++) {
          actors.add(contracts[i]);
        }

        for (let i = 0; i < 5; i++) {
          const participants = actors.getAllParticipants();
          expect(participants[i]).toHaveProperty(
            "address",
            contracts[i].address
          );
          expect(participants[i]).toHaveProperty(
            "alias",
            `contract${i + 1}_01`
          );
          expect(participants[i]).toHaveProperty(
            "contractName",
            `contract${i + 1}`
          );
          expect(participants[i]).toHaveProperty(
            "displayName",
            `contract${i + 1}_01`
          );
        }
      });
    });
  });
});
