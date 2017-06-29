'use strict';

const http = require('https');
const url = require('url');

class Bot {
  constructor(WebHookUrl) {
    let hookPath = url.parse(WebHookUrl);
    this.reqOpt = {
      protocol: hookPath.protocol,
      method: 'POST',
      hostname: hookPath.hostname,
      path: hookPath.path,
      headers: {
        'content-type': 'application/json'
      }
    }
  }

  Send(someMsg, callback) {
    var req = http.request(this.reqOpt);
    req.on('aborted', () => {
      console.log(`Message aborted by server :(`);
    });
    req.end(JSON.stringify(someMsg), 'utf8', () => {
      console.log(`Message Sent.`);
    });
    req.on('response', (res) => {
      console.log(`Msg was received. Response: [${res.statusCode}]\n`);
      res.pipe(process.stdout);
      res.on('end', e => {
        callback && callback(res);
      });
    });
  }
}

module.exports = Bot;
