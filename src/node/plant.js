const { ethers } = require('ethers');

const tuple = (fg, bg) => `<${fg},${bg}>`;

const YELLOW_VIVID = '#D0D000';
const YELLOW = '#FEFECE';

const YELLOW_ON_YELLOW_VIVID = tuple(YELLOW, YELLOW_VIVID);
const YELLOW_ON_YELLOW = tuple(YELLOW, YELLOW);


class PlantUMLDeactivate {
  constructor(participant) { this.participant = participant; }
  render(p2alias) {
    return [
      `deactivate "${this.participant}"`,
    ].join('\n');
  }
}

class PlantUMLRelation {
  constructor({
    source,
    destination,
    arrow='->',
    lifeline='',
    message='',
    parameters,
    returnValues,
    value=0,
    isCall=true
  }) {
    this.source = source;
    this.destination = destination;
    this.arrow = arrow;
    this.isCall = isCall;
    this.lifeline = lifeline;
    this.message = message;
    this.parameters = parameters;
    this.returnValues = returnValues;
    this.value = value;
  }

  getEthRender(unit, displayUnit) {
    const value = ethers.utils.formatUnits(
      ethers.BigNumber.from(this.value.toString()),
      unit.toLowerCase()
    );

    return `{ ${value} ${displayUnit} }`;
  }

  render(p2alias, unit='gwei', displayUnit='GWEI') {

    const header = ['type', 'name', 'value'];
    let dataRows = this.parameters || this.returnValues || [];

    const isEmpty = dataRows.length === 0;

    // handle multiline string values
    dataRows = dataRows.reduce((acc, row) => {
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

    const encodeTableRow = (row, sep='|', colNames=header) => {
      sep = sep.trim();
      const left = `${sep} `;
      const right = ' |';

      const xs = Array.isArray(row)
        ? row
        : colNames.map(c => row[c]);

      return left + xs.join(` ${sep} `) + right
    }

    const [openIndicator, closeIndicator] = this.isCall
      ? [`${this.message}(`, ')']
      : [`Return (`, ')' ];

    const data = [
      `${openIndicator}`,
      YELLOW_ON_YELLOW + encodeTableRow(header, '|='),
      ...dataRows.map(r => encodeTableRow(r, '|'))
    ];

    // last data row
    data.push(
      this.isCall
        ? `${closeIndicator} ${this.getEthRender(unit, displayUnit)}`
        : `${closeIndicator}`
    );

    const sep = '\\n\\\n';
    const table = isEmpty ? '' : data.join(sep);

    const lines = [
      `"${this.source}" ${this.arrow} "${this.destination}" ${this.lifeline}: ${table}`
    ];
    return lines.join('\n');
  }
}

module.exports = {
  PlantUMLDeactivate,
  PlantUMLRelation
}
