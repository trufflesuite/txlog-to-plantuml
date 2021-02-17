const { ethers } = require('ethers');

const tuple = (fg, bg) => `<${fg},${bg}>`;
const YELLOW = '#FEFECE';
const YELLOW_ON_YELLOW = tuple(YELLOW, YELLOW);

const splitValueRow = xs => {
  // handle multiline string values
  return xs.reduce((acc, row) => {
    if (typeof row.value !== 'string') {
      acc.push(row);
      return acc;
    }

    let hrow = true;
    for (const line of row.value.split('\\n')) {
      if (hrow) {
        acc.push([row.type, row.name, line]);
        hrow = !hrow;
      } else {
        acc.push(['', '', line]);
      }
    }
    return acc;
  }, []);
}

const encodeTableRow = (row, sep='|', colNames=['type', 'name', 'value']) => {
  sep = sep.trim();
  const left = `${sep} `;
  const right = ' |';

  const xs = Array.isArray(row)
    ? row
    : colNames.map(c => row[c]);

  return left + xs.join(` ${sep} `) + right
}

class PlantUMLDeactivate {
  constructor(participant) { this.participant = participant; }
  render() {
    return [
      `deactivate "${this.participant}"`,
    ].join('\n');
  }
}

class Relation {
  constructor({ source, destination, message, lifeline, arrow }) {
    this.source = source;
    this.destination = destination;
    this.message = message;
    this.lifeline = lifeline;
    this.arrow = arrow;
  }

  // this probably belongs in a different class...
  getEthRender(unit, displayUnit) {
    const value = ethers.utils.formatUnits(
      ethers.BigNumber.from((this.value || 0).toString()),
      unit.toLowerCase()
    );

    return `{ ${value} ${displayUnit} }`;
  }

}

class CallRelation extends Relation {
  constructor(option) {
    super({...option, arrow: '->', lifeline: '++'});
    const { parameters, value } = option;
    this.parameters = parameters;
    this.value = value;
  }

  render(unit='gwei', displayUnit='GWEI') {
    const messageHeader = ['type', 'name', 'value'];
    let dataRows = splitValueRow(this.parameters).map(r => encodeTableRow(r, '|'))

    const data = [
      `${this.message}(`,
      YELLOW_ON_YELLOW + encodeTableRow(messageHeader, '|='),
      ...dataRows,
      `) ${this.getEthRender(unit, displayUnit)}`
    ];

    const sep = '\\n\\\n';
    const table = data.join(sep);

    const lines = [
      `"${this.source}" ${this.arrow} "${this.destination}" ${this.lifeline}: ${table}`
    ];
    return lines.join('\n');
  }
}

class SelfDestructRelation extends Relation {
  constructor(option) {
    super({...option, arrow: '-[#55ff11]->', lifeline:'--'});
    const { returnValues } = option;
    this.returnValues = returnValues;
  }

  render() {
    const table = `SELFDESTRUCT`;
    return `"${this.source}" ${this.arrow} "${this.destination}" ${this.lifeline}: ${table}`
  }
}

class ReturnRelation extends Relation {
  constructor(option) {
    super({...option, arrow: '->', lifeline:'--'});
    const { returnValues } = option;
    this.returnValues = returnValues;
  }

  render() {
    const messageHeader = ['type', 'name', 'value'];
    let table = '';
    if (this.returnValues.length) {
      let dataRows = splitValueRow(this.returnValues)
        .map(r => encodeTableRow(r, '|'))

      const data = [
        `Return (`,
        YELLOW_ON_YELLOW + encodeTableRow(messageHeader, '|='),
        ...dataRows,
        `)`
      ];

      const sep = '\\n\\\n';
      table = data.join(sep);
    }

    return `"${this.source}" ${this.arrow} "${this.destination}" ${this.lifeline}: ${table}`
    ;
  }
}

class RevertRelation extends Relation {
  constructor(option) {
    super({...option, arrow: 'x-[#orange]->', lifeline: '--'});
    const { errorValues } = option;
    this.errorValues = errorValues;
  }

  render() {
    const messageHeader = ['type', 'name', 'value'];
    let dataRows = splitValueRow(this.errorValues);

    const data = [
      `REVERT! (`,
      YELLOW_ON_YELLOW + encodeTableRow(messageHeader, '|='),
      ...dataRows.map(r => encodeTableRow(r, '|')),
      `)`
    ];

    const sep = '\\n\\\n';
    const table = data.join(sep);

    return `"${this.source}" ${this.arrow} "${this.destination}" ${this.lifeline}: ${table}`;
  }
}

class MessageRelation extends Relation {
  constructor(option) {
    super({...option, arrow: '-[#green]->', lifeline: ''});
    const { parameters, value } = option;
    this.parameters = parameters;
    this.value = value;
  }

  render(unit='gwei', displayUnit='GWEI') {
    const eth = `$ ${this.getEthRender(unit, displayUnit)}`
    return `"${this.source}" ${this.arrow} "${this.destination}" ${this.lifeline}: ${eth}`;
  }
}

module.exports = {
  PlantUMLDeactivate,
  CallRelation,
  ReturnRelation,
  RevertRelation,
  MessageRelation,
  SelfDestructRelation
}
