module.exports = class Actors {
  constructor(option) {
    this.shortParticipantNames = option.shortParticipantNames || false;

    this.addresses = new Set();

    this.address2entry = {}; // address -> { address, displayName }
    this.alias2address = {};
  }

  add({address, contractName}, isEOA=false) {
    const key = `${address}:${contractName}`;
    if (this.addresses.has(key)) {
      return;
    }

    this.addresses.add(key);

    // * alias is used for describing an actor in the plantuml
    // * displayName is how the alias is displayed in participant section

    let count = 0;
    let alias;
    let displayName;
    if (isEOA) {
      alias = 'EOA';
      displayName = this.shortParticipantNames ? alias : address;
      contractName = 'Externally Owned Account'
    } else {
      alias = `${contractName}_${(++count).toString().padStart(2, 0)}`;
      while (alias in this.alias2address) {
        alias = `${contractName}_${(++count).toString().padStart(2, 0)}`;
      }
      displayName = this.shortParticipantNames ? alias : `${address}:${contractName}`;
    }

    this.alias2address[alias] = key;
    this.address2entry[key] = {
      address,
      alias,
      contractName,
      displayName: this.shortParticipantNames ? alias : displayName
    }
  }

  getAlias({address, contractName}) {
    const key = `${address}:${contractName}`;
    const entry = this.address2entry[key];
    return entry.alias;
  }

  getAllParticipants() {
    const actors = [];
    for (const ady of this.addresses) {
      actors.push(this.address2entry[ady]);
    }
    return actors;
  }
}
