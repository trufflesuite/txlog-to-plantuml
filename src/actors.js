module.exports = class Actors {
  constructor (option) {
    this.shortParticipantNames = option.shortParticipantNames || false;

    this.addressKeyPairs = new Set();

    // address:contractName -> { address, contractName, alias, displayName }
    this.addressKey2entry = {};
    this.alias2address = {};
  }

  add ({ address, contractName }, isEOA = false) {
    const key = `${address}:${contractName}`;
    if (this.addressKeyPairs.has(key)) {
      return;
    }

    this.addressKeyPairs.add(key);

    // * alias is used for describing an actor in the plantuml
    // * displayName is how the alias is displayed in participant section

    let count = 0;
    let alias;
    let displayName;
    if (isEOA) {
      alias = displayName = "EOA";
      contractName = "Externally Owned Account";
    } else {
      alias = `${contractName}_${(++count).toString().padStart(2, 0)}`;
      while (alias in this.alias2address) {
        alias = `${contractName}_${(++count).toString().padStart(2, 0)}`;
      }
      displayName = this.shortParticipantNames
        ? alias
        : `${address}:${contractName}`;
    }

    this.alias2address[alias] = key;
    this.addressKey2entry[key] = {
      address,
      alias,
      contractName,
      displayName: this.shortParticipantNames ? alias : displayName
    };
  }

  getAlias ({ address, contractName }) {
    const key = `${address}:${contractName}`;
    const entry = this.addressKey2entry[key];
    return entry.alias;
  }

  getAddressForAlias (alias) {
    const key = this.alias2address[alias];
    return key ? key.split(":")[0] : key;
  }

  getFirstAliasForAddress (address) {
    for (const key of this.addressKeyPairs) {
      if (key.startsWith(address)) {
        return this.addressKey2entry[key].alias;
      }
    }
    return address;
  }

  getAllParticipants () {
    const actors = [];
    for (const ady of this.addressKeyPairs) {
      actors.push(this.addressKey2entry[ady]);
    }
    return actors;
  }
};
