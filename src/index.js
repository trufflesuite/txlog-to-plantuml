const fs = require('fs');
const path = require('path');
const util = require("util");
const neodoc = require("neodoc");
const plantumlEncoder = require('plantuml-encoder')
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
  -c --compile-tests                Compile test sources
  -d --outdir=OUTDIR                Specify the output directory. [default: ./uml-output]
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
  return { type: metaValue.type.typeHint, value: value };
}

const arguments = args => {
  return args
    ?  args.map(({name, value}) => ({name, type: value.type.typeHint, value: codecInspect(value, { depth: null })}))
    : '-';
}

const buildLegend = participants => {
  const header =[
        '',
        'legend\nParticipant details',
        '<#fefece,#d0d000>|= Contract name |= address |= verified |',
        ''
  ].join('\n')
  const rows = participants.map(p => `<#fefece>| ${p.name} | ${p.address} | ? |`).join('\n');
  const footer = '\nendlegend\n\n';
  return header + rows + footer;
}

const buildTable = (data, isCall) => {
  const header = isCall
    ? '<#FEFECE,#FEFECE>|= type |= name |= value|\n'
    : '<#FEFECE,#FEFECE>|= type |= value|\n';

  const fn = isCall
    ? r => `|${r.type} | ${r.name} | ${r.value} |`
    : r => `|${r.type} | ${r.value} |`;

  if (!data || !data.length) return null;
  //if (!isCall) console.log(`data [${util.inspect(data, {depth: null})}]\n\n\n`);

  const rows = data.map(fn).join('\n');
  return header + rows
}

const generateUml = (actions, txHash, {shortParticipantNames}) => {
  let participantCounter = 0;
  const aliases = {};
  const participants = {};
  const pumlRelations = [];
  const legends = [];

  // lastKnownAddress cached for internal calls
  const constructName = (n, lastKnownAddress) => shortParticipantNames
    ?  `${n.contractName}`
    :  `${n.address||lastKnownAddress}:${n.contractName}`

  const getNameAndAlias = (n, lastKnownAddress, isCall) => {
    let name, alias;
    if (n.type === 'transaction') {
      alias = name = 'EOA'
      participants[name] = alias;

      // build up legend data
      if (isCall) legends.push({name: 'EOA', address: n.origin});

    } else {
      name = constructName(n, lastKnownAddress);

      if (!(name in participants)){

        // unknown participant, generate an alias
        let i = 0;
        alias = `${n.contractName}_${(++i).toString().padStart(2, '0')}`;
        while(alias in aliases) {
          alias = `${n.contractName}_${(++i).toString().padStart(2, '0')}`;
        }

        aliases[alias] = true;
        participants[name] = alias;
        legends.push({name: n.contractName, address: n.address})
      }

      alias = participants[name];
    }

    return {name, alias};
  }

  // store src and dst of revert message
  let revertRelation = { src: null, dst: null, deactivations: [] }

  // keep track of current address for internal calls.
  let currentAddress;

  for (const {src, dst, isCall} of actions) {

    // skip the ends
    if (!src || !dst ) continue;

    const destinationArgs = dst.arguments && dst.arguments.length ? arguments(dst.arguments) : '';
    const msgValue = isCall && dst.value ? `{ value: ${dst.value.toString()} }` : '';
    const sourceReturnValue = src.returnValues  && src.returnValues.map(rv => codecInspectWithType(rv));

    if (isCall && src.type === 'callexternal') currentAddress = src.address

    const source = {
      alias: getNameAndAlias(src, currentAddress, isCall).alias,
      error: src.error,
      outputTable: buildTable(sourceReturnValue, isCall),
      returnKind: src.returnKind
    };

    const destination = {
      alias: getNameAndAlias(dst, currentAddress, isCall).alias,
      error: dst.error,
      input: `${dst.functionName}()`,
      inputTable: buildTable(destinationArgs, isCall),
      returnKind: dst.returnKind,
    };

    let relation;

    if (isCall) {
      // capture previous revert unwind details before processing call
      if (revertRelation.src) {
        pumlRelations.push(`${revertRelation.src} x--> ${revertRelation.dst}: ${revertRelation.err}`);
        pumlRelations.push(...revertRelation.deactivations);
        revertRelation = { src: null, dst: null, deactivations: [] }
      }

      relation = `${source.alias} -> ${destination.alias} ++ : ${destination.input} ${msgValue}`;

      relation += destination.inputTable
        ?  `\nnote left #FEFECE\n${destination.inputTable}\nend note\n\n`
        : '';

      pumlRelations.push(relation);
      continue
    }

    if (source.returnKind === 'return') {
      relation = `${source.alias} -> ${destination.alias} -- :`;
      relation += source.outputTable
        ?  `\nnote left #FEFECE\n${source.outputTable}\nend note\n\n`
        : '';
      pumlRelations.push(relation);
    }

    if (source.returnKind === 'revert') {
      revertRelation.deactivations.push(`deactivate ${source.alias}`);
      // revert source should only be set once
      revertRelation.src = revertRelation.src || source.alias;

      // and its err and destination can be be updated.
      // This assumes the error does not change during unwinding
      revertRelation.dst = destination.alias;

      // oh boy! is there a guarantee that all "active" versions of solidity will have these error messages?
      // Can this be a guarantee from txLog?
      const errMsg = source && source.error && source.error.arguments && source.error.arguments[0].value.value.asString || 'revert...';

      // escape multi line revert messages
      revertRelation.err = (revertRelation.err || errMsg).replace("\n", "\\n");
      continue
    }

  }

  // add revert if necessary
  if (revertRelation.src) {
    pumlRelations.push(`${revertRelation.src} x--> ${revertRelation.dst}: ${revertRelation.err}`);
    pumlRelations.push(...revertRelation.deactivations);
  }

  const pumlParticipants = Object.entries(participants)
    .map(([k,v]) => {
      const participantType = v === 'EOA' ? 'actor' : 'participant';
      return `${participantType} ${v} as "${k}"`
    });

  const pumlLegend = buildLegend(legends);

  const prologue = `@startuml\n\n`;
  const skin = 'skinparam legendBackgroundColor #fefece\n\n'
  const epilogue = `\n\n@enduml\n`;
  const title = `title Txn Hash: ${txHash}\n\n`;
  const actors = pumlParticipants.join(`\n`) + '\n\n';
  const puml = prologue + skin + title + actors + pumlRelations.join(`\n`) + pumlLegend + epilogue;

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
  const { compileAll, compileTests, fetchExternal, outFile, shortParticipantNames, txHash } = parseOptions(process.argv);

  const cli = new CLIDebugger(
    config.with({
      compileAll,
      compileTests,
      fetchExternal,
      logger: { log: () => {} }
     }),
    { txHash }
  );

  const bugger = await cli.connect();
  await bugger.continueUntilBreakpoint([]);
  const txLog = bugger.view($.txlog.views.transactionLog);

  const umlActions = [];
  visit(txLog, null, umlActions);

  // write json
  const jsonTxlog = outFile.slice(0, -4) + 'json';
  console.log('json output:', jsonTxlog)
  fs.writeFileSync(jsonTxlog, util.inspect(txLog, {depth: null}));

  const puml = generateUml(umlActions, txHash, {shortParticipantNames});
  const encoded = plantumlEncoder.encode(puml);
  // const url = 'http://www.plantuml.com/plantuml/img/' + encoded
  const url = 'https://www.planttext.com/api/plantuml/svg/' + encoded;
  console.log(url);

  fs.writeFileSync(outFile, puml);
  console.log(`\nPlantuml specs written to: ${outFile}`);

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


  // These two options have to be set inorder for debugger to compile
  // sources.  The CLI handles this coupling and we have to maintain it here.
  //
  const compileAll = compileTests = options["--compile-tests"] ? true : false;

  const fetchExternal = options["--fetch-external"] ? true : false;
  const outFile =  options["--outfile"] || `${txHash}.puml`;
  const outDir =  options["--outdir"];
  const shortParticipantNames = options["--short-participant-names"] ? true : false;

  if (outDir !== '.') {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir)
      console.log('Directory created: ', outDir);
    }
  }

  console.log(`\t--compile-all: ${compileAll}\n\t--compile-tests: ${compileTests}`)

  return {
    'compile-all': compileAll, compileAll,
    'compile-tests': compileTests, compileTests,
    fetchExternal,
    outFile: path.resolve(outDir, outFile),
    shortParticipantNames,
    txHash
  };
}

module.exports = util.callbackify(run);
