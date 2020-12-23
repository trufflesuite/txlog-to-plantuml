console.log('will i import?');
const util = require("util");
const neodoc = require("neodoc");
const { Environment } = require("@truffle/environment")

const Codec = require("@truffle/codec");
const { CLIDebugger } = require("@truffle/core/lib/debug/cli");
const { selectors: $ } = require("@truffle/debugger");

const commandName = "tx2seq";
const usage = `
usage: ${commandName} [--fetch-external|-x] <tx-hash>

options:
  --fetch-external, -x
    Fetch external sources from EtherScan and Sourcify
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

const arguments = args =>
  args.map(({name, value}) => `${value.type.typeHint} ${name} = ${codecInspect(value, { depth: null })}`)
      .join(", ");

const run = async (config) => {
  await Environment.detect(config);
  console.log('entry the function');
  const { txHash, fetchExternal } = parseOptions(process.argv);

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
  console.log('%O', txLog);

  const calls = [{
    type: 'actor',
    name:  txLog.origin,
    display: `${txLog.origin.slice(2,6)}..${txLog.origin.slice(-4)}`,
    to: `${txLog.actions[0].contractName}.${txLog.actions[0].functionName}`
  }];

  // list actions
  for (const action of txLog.actions) {
    const args = arguments(action.arguments);

    calls.push({
      type: 'participant',
      name: `${action.contractName}`,
      input: `${action.functionName}(${args})`,
      output: action.returnValues.map(rv => codecInspectWithType(rv)).join(', ')
    });

    for (const step of action.actions) {
      const args = arguments(step.arguments);
      calls.push({
        type: 'participant',
        name: `${step.contractName}`,
        input: `${step.functionName}(${args})`,
        output: step.returnValues.map(rv => codecInspectWithType(rv)).join(', ')
      });
    }
  }
  console.log('calls: %O', calls);

  const stackFrame = [];
  const pumlParticipants = [];
  const pumlCommands = [];
  let alias, top;
  let currentCall = 0;

  // give eow an input
  if (calls.length) calls[0].input = calls[1].input;

  for (const call of calls) {
    alias = (!pumlParticipants.length)
      ? 'eow'
      : `p${++currentCall}`;
    call.participant = alias;

    if (stackFrame.length) {
      pumlCommands.push(`${top.participant} -> ${alias} : ${call.input}`);
      pumlCommands.push(`activate ${alias}\n`);
    }

    const kind = pumlParticipants.length ? 'participant' : 'actor';
    pumlParticipants.push(`${kind} ${call.display || call.name} as ${alias}`);
    stackFrame.push(call);
    top = call;
  }


  // TODO: handle unwind on errors
  //       if a revert/error is detected unwind to eow. ???
  //       maybe?

  let activeFrame = stackFrame.pop();
  while (stackFrame.length) {
    top = stackFrame.pop();
    pumlCommands.push(`${activeFrame.participant} -> ${top.participant} : ${activeFrame.output}`);
    pumlCommands.push(`deactivate ${activeFrame.participant}\n`);
    activeFrame = top;
  }

  const prologue = `@startuml\n\n`;
  const epilogue = `\n\n@enduml\n`;
  const title = `title Txn Hash: ${txHash}\n\n`;
  const actors = pumlParticipants.join(`\n`) + '\n\n';
  const puml = prologue + title + actors + pumlCommands.join(`\n`) + epilogue;

  console.log('\n-- output --\n');
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
    smartOptions: true,
    allowUnknown: true
  });

  const fetchExternal = options["--fetch-external"] || options["-x"];

  return {
    fetchExternal,
    txHash
  };
}

module.exports = util.callbackify(run);
