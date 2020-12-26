const util = require("util");
const neodoc = require("neodoc");
const { Environment } = require("@truffle/environment")

const Codec = require("@truffle/codec");
const { CLIDebugger } = require("@truffle/core/lib/debug/cli");
const { selectors: $ } = require("@truffle/debugger");

const commandName = "tx2seq";
const usage = `
Transaction to Sequence diagram tool

usage: ${commandName}  [--fetch-external] [--short-participant-names] [--help] (<tx-hash>)

options:
  -h --help                         Show help
  -x --fetch-external               Fetch external sources from EtherScan and Sourcify
  -s --short-participant-names      Generate short names for participants. This means
                                    <contract-name> instead of <address>:<contract-name>
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

  const constructName = n => shortParticipantNames
    ?  `${n.contractName}`
    :  `${n.address}:${n.contractName}`

  const getNameAndAlias = n => {
    let name, alias;
    if (n.type === 'transaction') {
      name = `${n.origin.slice(2,5)}..${n.origin.slice(-4)}`;
      alias = 'eow'
      participants[name] = alias;
    } else {
      name = constructName(n);
      if (!(name in participants)){
        alias = `p${++participantCounter}`
        participants[name] = alias;
      }
      alias = participants[name];
    }
    return {name, alias};
  }

  for (const {src, dst, isCall} of actions) {
    if (!src || !dst ) continue;

    const sourceArgs = src.arguments ? arguments(src.arguments) : '';
    const destinationArgs = dst.arguments ? arguments(dst.arguments) : '';

    const source = {
      alias: getNameAndAlias(src).alias,
      error: src.error,
      input: `${src.functionName}(${sourceArgs})`,
      output: src.returnValues  && src.returnValues.map(rv => codecInspectWithType(rv)).join(', '),
      returnKind: src.returnKind
    };

    const destination = {
      alias: getNameAndAlias(dst).alias,
      error: dst.error,
      input: `${dst.functionName}(${destinationArgs})`,
      output: dst.returnValues && dst.returnValues.map(rv => codecInspectWithType(rv)).join(', '),
      returnKind: dst.returnKind,
    };

    console.log('\n\n\nsrc:returnKind', source.returnKind);
    console.log('dst:returnKind', destination.returnKind);
    console.log('src.error: ', util.inspect(src.error, {depth:null}));
    console.log('dst.error: ', util.inspect(dst.error, {depth:null}));
    const relation = isCall
      ?  `${source.alias} -> ${destination.alias} ++ : ${destination.input}`
      :  `${source.alias} -> ${destination.alias} -- : ${source.output}`;

    pumlRelations.push(relation);

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
  const { txHash, fetchExternal, shortParticipantNames } = parseOptions(process.argv);

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

  // $ = selectors
  const txLog = bugger.view($.txlog.views.transactionLog);

  const umlActions = [];
  visit(txLog, null, umlActions);

  const puml = generateUml(umlActions, txHash, {shortParticipantNames});
  console.log(puml);
}

const parseOptions = (args) => {
  // convert raw args for neodoc
  // process.argv will roughly be: `node <truffle-path> run tx2seq ...`
  // and we want `truffle run tx2seq`
  const argv = args.slice(args.indexOf(commandName) + 1)

  const {
    "<tx-hash>": txHash,
    ...options
  } = neodoc.run(usage, {
    argv,
    optionsFirst: true,
  });

  const fetchExternal = options["--fetch-external"] || options["-x"];
  const shortParticipantNames = options["--short-participant-names"] || options["-s"] || false;

  return {
    fetchExternal,
    txHash,
    shortParticipantNames
  };
}

module.exports = util.callbackify(run);
