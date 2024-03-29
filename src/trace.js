const fs = require("fs");
const util = require("util");
const plantumlEncoder = require("plantuml-encoder");
const { getTxLog } = require("./debugger");
const BigNumber = require("bignumber.js");

const Actors = require("./actors");
const Transaction = require("./node/transaction");
const CallExternal = require("./node/call-external");
const CallInternal = require("./node/call-internal");

const tuple = (fg, bg) => `<${fg},${bg}>`;
const YELLOW = "#FEFECE";
const YELLOW_VIVID = "#D0D000";
const YELLOW_ON_YELLOW_VIVID = tuple(YELLOW, YELLOW_VIVID);

const generatePlantUml = (
  umlCommands,
  umlParticipants,
  { shortParticipantNames, txHash }
) => {
  const plantuml = [
    "\n\n@startuml",
    "",
    "autonumber",
    `skinparam legendBackgroundColor ${YELLOW}`,
    "",
    `<style>
      header {
        HorizontalAlignment left
        FontColor purple
        FontSize 14
        Padding 10
      }
    </style>`,
    "",
    "header Insights by Truffle",
    "",
    `title Txn Hash: ${txHash}`,
    "",
    ""
  ];

  // add participants
  const players = umlParticipants.getAllParticipants().map(player => {
    const role = player.alias === "EOA" ? "actor" : "participant";
    return `${role} ${player.alias} as "${player.displayName}"`;
  });

  plantuml.push(...players, "");

  // add relations
  for (const cmd of umlCommands) {
    plantuml.push(cmd.render());
  }

  const legendData = [
    "",
    "legend",
    "Participant details",
    `${YELLOW_ON_YELLOW_VIVID}|= Alias |= Contract name |= Address |`,
    ...umlParticipants
      .getAllParticipants()
      .map(e => `<${YELLOW}>| ${e.alias} | ${e.contractName} | ${e.address} |`),
    "endlegend",
    ""
  ];

  plantuml.push(...legendData);

  plantuml.push("@enduml");

  const puml = plantuml.join("\n");
  const encodedUrl =
    "https://www.planttext.com/api/plantuml/svg/" +
    plantumlEncoder.encode(puml);
  return { puml, encodedUrl };
};

const visit = (root, parent, umlCommands, umlParticipants, state = {}) => {
  let currentNode;
  switch (root.type) {
    case "transaction":
      currentNode = new Transaction(root, umlParticipants);
      break;

    case "callexternal":
      currentNode = new CallExternal(root, umlParticipants);
      state.address.push(currentNode.address);
      // console.log('root', util.inspect(root, {depth: null}));
      // console.log(currentNode);
      break;

    case "callinternal":
      // assign last known address
      currentNode = new CallInternal(
        root,
        state.address[state.address.length - 1],
        umlParticipants
      );
      break;

    default:
      console.log(`${root.type} not recognized`);
      console.log("root", util.inspect(root, { depth: null }));
  }

  currentNode.push(parent, umlCommands, umlParticipants, state);

  for (const action of root.actions) {
    visit(action, currentNode, umlCommands, umlParticipants, state);
  }
  currentNode.pop(parent, umlCommands, umlParticipants, state);
};

const traceTransaction = async (truffleConfig, options) => {
  const { outFile, shortParticipantNames, txHash } = options;

  txLog = await getTxLog(truffleConfig, options);
  const basename = outFile.slice(0, -4);

  // write js
  const jsTxlog = basename + "js";
  console.log("js output:", jsTxlog);
  fs.writeFileSync(jsTxlog, util.inspect(txLog, { depth: null }));

  const umlCommands = [];
  const umlParticipants = new Actors({ shortParticipantNames });
  const state = {
    revertSource: [],
    deactivations: [],
    address: []
  };
  visit(txLog, null, umlCommands, umlParticipants, state);
  const { encodedUrl, puml } = generatePlantUml(umlCommands, umlParticipants, {
    shortParticipantNames,
    txHash
  });

  fs.writeFileSync(outFile, puml);
  console.log(`\nPlantuml specs written to: ${outFile}`);

  const svgOutput = basename + "svg.txt";
  fs.writeFileSync(svgOutput, encodedUrl);
  // console.log(encodedUrl.replace('https://www.planttext.com/api/plantuml/svg','http://teams:8080/uml'));
  console.log(
    encodedUrl.replace(
      "https://www.planttext.com/api/plantuml/svg",
      "http://13.82.143.137:8080/uml"
    )
  );
};

module.exports = {
  traceTransaction,
  visit
};
