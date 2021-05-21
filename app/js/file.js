const { parseISO, isBefore } = require('date-fns');
const { format } = require('date-fns-tz');

const _ = require('lodash');

const fs = window.node.fs.promises;
const path = window.node.path;

module.exports = class LogFile {
  constructor(file) {
    this.file = file;
    this.data = [];
  }

  async start() {
    const ext = path.extname(this.file);
    if(ext !== '.log') {
      return { success: false, code: 'ext', data: ext }
    } 
    const file = await fs.readFile(this.file, 'utf-8');
    const fileToJson = file.split('\n').filter(Boolean);
    this.data = fileToJson
      .filter((line) => line)
      .map((line) => {
        const newLine = JSON.parse(line);
        if (newLine.data) {
          newLine.data = JSON.parse(newLine.data);
        }

        return newLine;
      });
    return this.transform();
  }

  transform() {
    const groupByExecutionId = _.groupBy(this.data, 'executionId');
    const groupsExecutionId = Object.values(groupByExecutionId);
    const data = groupsExecutionId.sort((a, b) => {
      if (a[0] && b[0]) {
        return isBefore(parseISO(a.firstTime), parseISO(b.firstTime)) ? 1 : -1;
      }
      return -1;
    }).map((g) => {
      const groupByUniqueKey = _.groupBy(g, 'uniqueKey');
      const groupUniqueKey = Object.values(groupByUniqueKey);
      return groupUniqueKey
        .map((line) => {
          const { uniqueKey, timestamp } = line[0];

          const items = line.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          const lastItem = items[items.length - 1];

          const parsedDate = parseISO(lastItem.timestamp);
          const znDate = format(parsedDate, 'dd/MM/yyyy HH:mm:ss', {
            timeZone: 'America/Sao_Paulo',
          });

          let status;
          const existFinalLog = items.find((i) => i.finalLog);
          if (existFinalLog) {
            status = existFinalLog.status;
          } else {
            status = 'PENDING';
          }

          return {
            uniqueKey,
            status,
            time: znDate,
            timestamp: lastItem.timestamp,
            firstTime: timestamp,
            items,
          };
        })
        .sort((a, b) => {
          if (a.uniqueKey.startsWith('session')) {
            if (isBefore(parseISO(a.firstTime), parseISO(b.firstTime))) {
              return -1;
            }
            return 1;
          }
          return isBefore(parseISO(a.timestamp), parseISO(b.timestamp))
            ? 1
            : -1;
        });

    }).flat();

    return { success: true, data }
  }
};
