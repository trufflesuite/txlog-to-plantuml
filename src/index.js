const fs = require('fs');
const path = require('path');
const util = require("util");
const neodoc = require("neodoc");
const traceTransaction = require('./trace');

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

const run = async (config) => {
  const commandOptions = parseOptions(process.argv);
  await traceTransaction(config, commandOptions)
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
      //console.log('Directory created: ', outDir);
    }
  }

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
