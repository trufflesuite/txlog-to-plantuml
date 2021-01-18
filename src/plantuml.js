const plantumlEncoder = require('plantuml-encoder')

const tuple = (fg, bg) => `<${fg},${bg}>`;

// todo: pick better colors
const YELLOW_VIVID = '#D0D000';
const YELLOW = '#FEFECE';

const YELLOW_ON_YELLOW_VIVID = tuple(YELLOW, YELLOW_VIVID);
const YELLOW_ON_YELLOW = tuple(YELLOW, YELLOW);

const createLegendTable = participants => {
  const header =[
    '',
    'legend',
    'Participant details',
    `${YELLOW_ON_YELLOW_VIVID}|= Contract name |= address |= verified |`,
    ''
  ].join('\n')

  const rows = participants.map(p => `<${YELLOW}>| ${p.name} | ${p.address} | ? |`).join('\n');
  const footer = '\nendlegend\n\n';
  return header + rows + footer;
}

const makeNote = ({ header, rows }) => {
  if (!rows.length) return null;

  // header row of table
  const hrows = [
    'note left ' + YELLOW,
    YELLOW_ON_YELLOW + '|= ' + header.join(' |= ') + ' |'
  ];

  const note = rows.reduce((acc, row) => acc.concat('| ' + row.join(' | ') + ' |'), hrows);
  note.push('end note', '');

  return note.join('\n');
}

const buildTable = (data, isCall) => {
  const header = isCall
    ? `${YELLOW_ON_YELLOW}|= type |= name |= value|\n`
    : `${YELLOW_ON_YELLOW}|= type |= value|\n`;

  const fn = isCall
    ? r => `|${r.type} | ${r.name} | ${r.value} |`
    : r => `|${r.type} | ${r.value} |`;

  if (!data || !data.length) return null;

  const rows = data.map(fn).join('\n');
  return header + rows
}

const createDirectedPairs = pairs => {
  return pairs.map(p => {
    if (p.type === 'revert') {
      return `${p.source} x--> ${p.destination}: ${p.message}`;
    }

    if (p.type === 'call' || p.type === 'return') {
      const lifeline = p.type === 'call' ? '++' : '--';
      let directed = `${p.source} -> ${p.destination} ${lifeline}: ${p.message}`;

      if (p.annotation) {
        const note = makeNote(p.annotation);
        if (note) directed = directed + '\n' + note;
      }

      return directed;
    }

    if (p.type === 'deactivate') {
      return `deactivate ${p.participant}`;
    }
  });
}


const generateSequenceDiagramAssets = ({ legends, participants, pumlRelations, txHash }) => {

  const pumlParticipants = Object.entries(participants)
    .map(([k,v]) => {
      const participantType = v === 'EOA' ? 'actor' : 'participant';
      return `${participantType} ${v} as "${k}"`
    });

  const pumlLegend = createLegendTable(legends);

  const directedPairs = createDirectedPairs(pumlRelations);

  const epilogue = '@enduml';
  const prologue = '@startuml';
  const skin = `skinparam legendBackgroundColor ${YELLOW}`
  const title = `title Txn Hash: ${txHash}`;

  const puml = [
    prologue, '',
    skin, '',
    title, '',
    pumlParticipants.join('\n'), '',
    directedPairs.join('\n'), '',
    pumlLegend, '',
    epilogue, ''
  ].join('\n');

  const encodedUrl = 'https://www.planttext.com/api/plantuml/svg/' + plantumlEncoder.encode(puml);
  return { encodedUrl, puml };
}

module.exports = { generateSequenceDiagramAssets }
