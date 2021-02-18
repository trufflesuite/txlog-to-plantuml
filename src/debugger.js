const { Environment } = require("@truffle/environment")
const { CLIDebugger } = require("@truffle/core/lib/debug/cli");
const { selectors: $ } = require("@truffle/debugger");

const getTxLog = async (truffleConfig, options) => {
  const { compileAll, compileTests, fetchExternal, txHash } = options;

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
  return await bugger.view($.txlog.views.transactionLog);
}


module.exports = {
  getTxLog
}
