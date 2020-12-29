const fs = require('fs');
const util = require("util");
const neodoc = require("neodoc");
const { Environment } = require("@truffle/environment")

const Codec = require("@truffle/codec");
const { CLIDebugger } = require("@truffle/core/lib/debug/cli");
const { selectors: $ } = require("@truffle/debugger");

const commandName = "tx2seq";
const truffleCommand = "truffle run tx2seq";
const commandVersion = `Truffle transaction visualizer ${commandName}: 0.0.0`;
const usage = `
Truffle transaction visualizer: a study aid for Ethereum transactions.

usage:
  ${truffleCommand} [options] <tx-hash>

options:
  -h --help                         Show help
  -v --version                      Show version
  -o --outfile=OUTFILE              Specify the output filename
  -s --short-participant-names      Generate short names for participants. This means
                                    <contract-name> instead of <address>:<contract-name>
  -x --fetch-external               Fetch external sources from EtherScan and Sourcify
`;

const codecInspect = (typedValue, options) => {
  const data = new Codec.Format.Utils.Inspect.ResultInspector(typedValue);
  return util.inspect(data);
}

const codecInspectWithType = (typedValue, options) => {
  const metaValue = typedValue.value ? typedValue.value : typedValue
  const value = codecInspect(metaValue, options);
  return `${metaValue.type.typeHint} ${value}`;
}

const arguments = args => {
  return args
    ?  args.map(({name, value}) => `${value.type.typeHint} ${name} = ${codecInspect(value, { depth: null })}`) .join(", ")
    : '-';
}

const generateUml = (actions, txHash, {shortParticipantNames}) => {
  let participantCounter = 0;
  const participants = {};
  const pumlRelations = [];

  const constructName = (n, lastKnownAddress) => shortParticipantNames
    ?  `${n.contractName}`
    :  `${n.address||lastKnownAddress}:${n.contractName}`

  const getNameAndAlias = (n, lastKnownAddress) => {
    let name, alias;
    if (n.type === 'transaction') {
      name = `${n.origin.slice(2,5)}..${n.origin.slice(-4)}`;
      alias = 'eow'
      participants[name] = alias;
    } else {
      name = constructName(n, lastKnownAddress);
      if (!(name in participants)){
        alias = `p${++participantCounter}`
        participants[name] = alias;
      }
      alias = participants[name];
    }
    return {name, alias};
  }

  // store src and dst of revert message
  const revertRelation = { src: null, dst: null, deactivations: [] }


  // keep track of current address for internal calls. is this right?
  let currentAddress;

  for (const {src, dst, isCall} of actions) {
    if (!src || !dst ) continue;

    const sourceArgs = src.arguments ? arguments(src.arguments) : '';
    const destinationArgs = dst.arguments ? arguments(dst.arguments) : '';

    if (isCall && src.type === 'callexternal') currentAddress = src.address

    const source = {
      alias: getNameAndAlias(src, currentAddress).alias,
      error: src.error,
      input: `${src.functionName}(${sourceArgs})`,
      output: src.returnValues  && src.returnValues.map(rv => codecInspectWithType(rv)).join(', '),
      returnKind: src.returnKind
    };

    const destination = {
      alias: getNameAndAlias(dst, currentAddress).alias,
      error: dst.error,
      input: `${dst.functionName}(${destinationArgs})`,
      output: dst.returnValues && dst.returnValues.map(rv => codecInspectWithType(rv)).join(', '),
      returnKind: dst.returnKind,
    };

    let relation;
    if (isCall) {
      relation = `${source.alias} -> ${destination.alias} ++ : ${destination.input}`
      pumlRelations.push(relation);
    } else {
      if (source.returnKind === 'revert') {
        revertRelation.deactivations.push(`deactivate ${source.alias}`);
        revertRelation.src = revertRelation.src || source.alias;
        revertRelation.err = revertRelation.err || source.error.arguments[0].value.value.asString;
        revertRelation.dst = destination.alias;

      } else if (source.returnKind === 'return') {
        relation = `${source.alias} -> ${destination.alias} -- : ${source.output}`;
        pumlRelations.push(relation);
      }
    }
  }

  // add revert if necessary
  if (revertRelation.src) {
    pumlRelations.push(`${revertRelation.src} --> ${revertRelation.dst}: ${revertRelation.err}`);
    pumlRelations.push(...revertRelation.deactivations);
  }

  const pumlParticipants = Object.entries(participants)
    .map(([k,v]) => {
      const participantType = v === 'eow' ? 'actor' : 'participant';
      return `${participantType} ${v} as "${k}"`
    })

  const prologue = `@startuml\n\n`;
  const epilogue = `\n\n@enduml\n`;
  const title = `title Txn Hash: ${txHash}\n\n`;
  const actors = pumlParticipants.join(`\n`) + '\n\n';
  const puml = prologue + title + actors + pumlRelations.join(`\n`) + epilogue;

  return puml;
}

const visit = (root, parent, umlActions=[]) => {
  umlActions.push({src: parent, dst: root, isCall: true });
  for (const action of root.actions) {
    visit(action, root, umlActions);
  }
  umlActions.push({src: root, dst: parent, isCall: false });
}


const run = async (config) => {
  await Environment.detect(config);
  const { txHash, fetchExternal, outFile, shortParticipantNames } = parseOptions(process.argv);

  const cli = new CLIDebugger(
    config.with({
      fetchExternal,
      logger: {
        log: () => {}
      }
    }),
    { txHash }
  );

  const bugger = await cli.connect();

  while (!bugger.view($.trace.finished)) {
    bugger.advance();
  }

  const txLog = bugger.view($.txlog.views.transactionLog);
  const umlActions = [];
  visit(txLog, null, umlActions);

  const puml = generateUml(umlActions, txHash, {shortParticipantNames});
  fs.writeFileSync(outFile, puml);
  console.log(`Plantuml specs written to: ${outFile}`);
}

const parseOptions = (args) => {
  // convert raw args for neodoc
  // process.argv will roughly be: `node <truffle-path> run tx2seq ...`
  // and we want `truffle run tx2seq`
  const argv = args.slice(args.indexOf(commandName) - 1);

  const parsedOptions = neodoc.run(usage, {
    argv,
    optionsFirst: true,
    version: commandVersion,
    laxPlacement: true
  });

  const {
    "<tx-hash>": txHash,
    ...options
  } = parsedOptions;

  const fetchExternal = options["--fetch-external"] ? true : false;
  const shortParticipantNames = options["--short-participant-names"] ? true : false;
  const outFile =  options["--outfile"] || `${txHash}.puml`;

  return {
    fetchExternal,
    outFile,
    shortParticipantNames,
    txHash
  };
}

module.exports = util.callbackify(run);
