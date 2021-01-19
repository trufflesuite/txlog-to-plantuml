const fs = require('fs');
const util = require("util");
const { generateSequenceDiagramAssets } = require("./plantuml");

const { Environment } = require("@truffle/environment")
const Codec = require("@truffle/codec");
const { CLIDebugger } = require("@truffle/core/lib/debug/cli");
const { selectors: $ } = require("@truffle/debugger");

const codecInspect = (typedValue, options) => {
  const data = new Codec.Format.Utils.Inspect.ResultInspector(typedValue);
  return util.inspect(data);
}

const codecInspectWithType = (typedValue, options) => {
  const metaValue = typedValue.value ? typedValue.value : typedValue
  const value = codecInspect(metaValue, options);
  return { type: metaValue.type.typeHint, value: value };
}

const arguments = args => args
  ?  args.map(({name, value}) => ({name, type: value.type.typeHint, value: codecInspect(value, { depth: null })}))
  : '-';

const buildTable = (data, isCall) => {
  const header = isCall
    ? 'type name value'.split(' ')
    : 'type value'.split(' ');

  let rows = [];
  if (data && data.length) {
    rows = data.map(d => header.map(h => d[h]));
  }

  return { header, rows }
}

const generateUml = (actions, txHash, {shortParticipantNames}) => {
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
      if (isCall) legends.push({ name: 'EOA', address: n.origin });

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

    if (isCall) {
      // capture previous revert unwind details before processing call
      if (revertRelation.src) {
        pumlRelations.push({type: 'revert', source: revertRelation.src, destination: revertRelation.dst, message: revertRelation.err});

        // deactivate? is this needed here? push out before resetting?
        pumlRelations.push(...revertRelation.deactivations);
        revertRelation = { src: null, dst: null, deactivations: [] }
      }

      pumlRelations.push({
        type: 'call',
        source: source.alias,
        destination: destination.alias,
        message: `${destination.input} ${msgValue}`,
        annotation: destination.inputTable
      });

      continue
    }

    if (source.returnKind === 'return') {
      pumlRelations.push({
        type: 'return',
        source: source.alias,
        destination: destination.alias,
        message: '',
        annotation: source.outputTable
      });
    }

    if (source.returnKind === 'revert') {
      revertRelation.deactivations.push({ type: 'deactivate', participant: source.alias });
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
    pumlRelations.push({type: 'revert', source: revertRelation.src, destination: revertRelation.dst, message: revertRelation.err});
    pumlRelations.push(...revertRelation.deactivations);
  }

  return { legends, participants, pumlRelations }
}

const visit = (root, parent, umlActions=[]) => {
  umlActions.push({src: parent, dst: root, isCall: true });
  for (const action of root.actions) {
    visit(action, root, umlActions);
  }
  umlActions.push({src: root, dst: parent, isCall: false });
}

const traceTransaction = async (truffleConfig, options) => {
  const { compileAll, compileTests, fetchExternal, outFile, shortParticipantNames, txHash } = options;

  await Environment.detect(truffleConfig);

  const cli = new CLIDebugger(
    truffleConfig.with({
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

  const basename = outFile.slice(0, -4);
  const svgOutput = basename + 'svg.txt'

  // write json
  const jsonTxlog = basename + 'json';
  console.log('json output:', jsonTxlog)

  fs.writeFileSync(jsonTxlog, util.inspect(txLog, {depth: null}));

  const uml = generateUml(umlActions, txHash, {shortParticipantNames});

  // invoke plantuml things
  const { encodedUrl, puml } = generateSequenceDiagramAssets({ ...uml, txHash });

  fs.writeFileSync(svgOutput, encodedUrl);

  fs.writeFileSync(outFile, puml);
  console.log(`\nPlantuml specs written to: ${outFile}`);
}


module.exports = traceTransaction
