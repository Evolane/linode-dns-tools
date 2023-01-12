/*
Command to create a domain from an (adapted) exported zone file
$ node linode_create_domain.js
Options:
      --help      Show help                                            [boolean]
      --version   Show version number                                  [boolean]
  -f, --filename                                             [string] [required]
  -t, --token             

$ node linode_create_domain.js -f importfiles/akamai.test.dns.txt -t 9138ebxxxxxxxxxxxx
Domain id 1943446!

akamai.test      3600                    ns23.domaincontrol.com. dns.jomax.net. (
                                        2022120903
                                        28800
                                        7200
                                        604800
                                        300
                                        ) 
akamai.test 21600 SOA ns-cloud-d1.googledomains.com. cloud-dns-hostmaster.google.com. 1 21600 3600 259200 300
akamai.test 300 A 2.17.196.88
akamai.test 300 A 2.17.196.107
akamai.test 300 MX 1 aspmx.l.google.com.
akamai.test 300 MX 5 alt1.aspmx.l.google.com.
akamai.test 21600 NS ns-cloud-d1.googledomains.com.
akamai.test 21600 NS ns-cloud-d2.googledomains.com.
akamai.test 21600 NS ns-cloud-d3.googledomains.com.
akamai.test 21600 NS ns-cloud-d4.googledomains.com.
akamai.test 300 TXT "MS=ms72154044"
_acme-challenge.akamai.test 300 TXT "gfQu7C7xf9q3iIIUdViFCkUKywQ-lqkIL4wOo_4Gevg"
www.akamai.test 300 CNAME evolane-ops.edgekey.net.

*/

import fs from 'fs';
import _ from 'lodash';
import _yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
const yargs = _yargs(hideBin(process.argv));
import { setToken, getProfile, getDomain, createDomain } from '@linode/api-v4';



  const argv = await yargs
      .option('filename', { type: 'string', require: true })
      .option('token', { type: 'string', require: true })
      .alias('f', 'filename')
      .alias('t', 'token')
      .argv;
  var input = fs.readFileSync(argv.filename, 'utf8' , error => {
      if (error) throw error;
  });

  setToken(argv.token);

// Read the SOA record ( should be the first )  
// 1 ; serial
// 14400 ; refresh
// 3600 ; retry
// 604800 ; expire
// 3600 ; minimum

var timing = input.match(/\([\s\S]+?\)/);
if (!timing) {
  console.log("I don't see an SOA record");
}
timing = timing[0];
timing = timing.split(/[\r\n]+/);
timing = _.filter(
  _.map(timing, function(item) {
    var matches = item.match(/\d+/);
    if (matches) {
      return matches[0];
    }
  }), function(item) {
    return !!item;
  }
);

if (timing.length !== 5) {
  console.log('Unable to parse SOA record, should have 5 numbers');
}

timing = {
  serial: timing[0],
  refresh: timing[1],
  retry: timing[2],
  expire: timing[3],
  minimum: timing[4]
};

var lines = input.split(/[\r\n]+/);

// Match one record, with optional TTL
var regex = new RegExp(/\s*(\S+)\s+((\d+)\s+)?([A-Z]+)\s+(.*?)\s*$/);
var records = _.map(
  _.filter(lines, (function(line) {
    return line.match(regex);
  })),
  function(line) {
    var fields = line.match(regex);
    var result = {
      name: fields[1],
      ttl: fields[3],
      type: fields[4],
      value: fields[5]
    };

    // Quotation marks are not actually part of the
    // value of the TXT record
    result.value = result.value.replace(/"/g, '');
    if (!result.ttl) {
      delete result.ttl;
    }
    if (result.type === 'MX') {
      var matches = result.value.match(/(\d+)\s*(.*)/);
      if (!matches) {
        console.log("MX record doesn't look valid");
      }
      result.priority = matches[1];
      result.value = matches[2];
    }
    return result;
  }
);

// Don't defeat the purpose by importing NS records,
// let linode provide those
records = _.filter(records, function(record) {
  return record.type !== 'NS';
});

if (!records.length) {
  console.log("No SOA record found in file.");
}

var domainName = records[0].name;
records = records.slice(1);

createDomain( {
      domain: domainName,
      type: 'master',
      soa_email: 'admin@' + domainName,
      refresh_sec: parseInt(timing.refresh),
      retry_sec: parseInt(timing.retry),
      expire_sec: parseInt(timing.expire),
      ttl_sec: parseInt(timing.minimum)
    }).then((response) => {
      var id =  response.id;
      console.log( `Domain created with id ${response.id}  ( Use this number in the “node linode_import_domain.js" step )`); 
    }).catch((error) => {
      console.error(error);
    });

    
    

  


