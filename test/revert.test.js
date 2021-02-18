const util = require('util');
const { visit } = require('../src/trace');
const Actors = require('../src/actors');
jest.mock('../src/debugger');
const {
  CallRelation: PCall,
  ReturnRelation: PRet,
  RevertRelation: PRev,
  PlantUMLDeactivate: PKill
} = require('../src/node/plant');

const relationsToMatch = (commands, expectedRelations) =>
  commands.every((cmd, i) => cmd instanceof expectedRelations[i]);

const verifyTypes = (obj, expected) => {
  for (let [k,v] of Object.entries(expected)) {
    expect(obj).toHaveProperty(k,v);
  }
}

const revertTransaction = require('./seed/revert.transaction');
const revertCatch = require('./seed/revert.catch');

describe('Reverts', () => {
  let umlCommands, actors, state;

  beforeEach(() => {
    umlCommands = [];
    actors = new Actors({shortParticipantNames: false});
    state = { revertSource: [], deactivations: [], address: [], }
  });

  test('Entire transaction', () => {
    visit(revertTransaction, null, umlCommands, actors, state);
    expect(umlCommands.length).toBe(5);
    expect(relationsToMatch(umlCommands, [PCall, PCall, PRev, PKill, PKill])).toBe(true);

    const [c1, c2, rev, k1, k2] = umlCommands;

    expect(c1.value.toString()).toBe('0');    // no value
    expect(c1.message).toBe('test_a_revert'); // no value
    expect(c1.destination).toBe('Entry_01');
    verifyTypes(c1.parameters[0], {name: 'x', type: 'uint', value: '9'});

    expect(c2.value.toString()).toBe('0'); // no value
    expect(c2.message).toBe('inc_revert'); // no value
    expect(c2.destination).toBe('First_01');
    verifyTypes(c1.parameters[0], {name: 'x', type: 'uint', value: '9'});

    // it should revert the entire transaction
    expect(rev.source).toBe('First_01');
    expect(rev.destination).toBe('EOA');
    expect(rev.arrow).toBe('x-[#red]->');
    verifyTypes(rev.errorValues[0], {type: 'string', value: `'drats!'`});

    // it should deactivate lifelines
    expect(k1.participant).toBe('First_01');
    expect(k2.participant).toBe('Entry_01');
  });

  describe('respects try/catch mechanic', () => {
    beforeEach(() => {
      visit(revertCatch, null, umlCommands, actors, state);
    });

    test('generates the correct digraphs', () => {
      expect(umlCommands.length).toBe(13);
      expect(relationsToMatch(
        umlCommands,
        [PCall, PCall, PCall,
         PRev,         // the revert
         PKill,        // deactivate a lifeline
         PCall, PRet,  // continue with business
         PCall, PCall, PRet, PRet, PRet, PRet
        ]
      )).toBe(true);

    });

    test('records with the correct input: fn(x) = x+2', () => {
      const [start] = umlCommands;
      verifyTypes(
        start.parameters[0],
        {name: 'x', type: 'uint', value: '3'}
      );

    });

    test('is caught', () => {
      const [rev, kill] = umlCommands.slice(3);
      expect(kill.participant).toBe('Second_01');
      expect(rev.source).toBe('Second_01');
      expect(rev.destination).toBe('First_01');
      expect(rev.message).toBe(undefined);  // there should be no message
      expect(rev.arrow).toBe('x-[#red]->'); // arrow should be red
      expect(rev.lifeline).toBe('--');
      verifyTypes(
        rev.errorValues[0],
        {type: 'string', value: String.raw`'Rats! Conditions are imperfect\nIm a bit sleepy...'`}
      );

    });

    test('continues with transaction and solves x=5', () => {
      const [ret] = umlCommands.slice(-2); // get penultimate
      verifyTypes(
        ret.returnValues[0],
        {type: 'uint', value: '5'}
      );

    });
  });

});


      // console.log(util.inspect(umlCommands, {depth:null, colors: true}));
