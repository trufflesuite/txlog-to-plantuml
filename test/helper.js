const relationsToMatch = (commands, expectedRelations) =>
  commands.every((cmd, i) => cmd instanceof expectedRelations[i]);

const verifyTypes = (obj, expected) => {
  for (let [k, v] of Object.entries(expected)) {
    expect(obj).toHaveProperty(k, v);
  }
};

module.exports = {
  relationsToMatch,
  verifyTypes
};
