/*
Command 
$ node createdomain.js -f evolane.be.dns.txt 
Input file domain export eg evolane.be.dns.txt (only SOA record used )
!!! No IN en evolane.be ipv evolane.be.
evolane.be 21600 IN SOA ns1.linode.com. cloud-dns-hostmaster.google.com. ( 
        1  
        14400 
        3600 
        604800 
        3600 ) 
evolane.be 21600 IN NS ns1.xxx.com.
evolane.be 21600 IN NS ns2.xxx.com.
evolane.be 21600 IN NS ns3.xxx.com.
evolane.be 18000 IN A 88.221.24.160
evolane.be 604800 MX 5 alt1.aspmx.l.google.com.
evolane.be 604800 MX 5 alt2.aspmx.l.google.com.

*/

import fs from 'fs';
import _yargs from 'yargs';
import _ from 'lodash';
import { hideBin } from 'yargs/helpers';
const yargs = _yargs(hideBin(process.argv));
import { setToken, getProfile, getDomain, createDomain } from '@linode/api-v4';
setToken('9138eb87xxxxxxxxxxxxxxxxxxxxxxxxx');


  const argv = await yargs
      .option('filename', { type: 'string', require: true })
      .alias('f', 'filename')
      .argv;
  var input = fs.readFileSync(argv.filename, 'utf8' , error => {
      if (error) throw error;
      //console.log(`File ${argv.filename} saved.`);
  });


  
// 1104251419 ; serial
// 10800 ; refresh
// 3600 ; retry
// 604800 ; expire
// 10800 ; minimum

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

var id;



/*var domain = 1935127;
getDomain (argv.domainid).then((response) => {
  //return response.username;
  var user =  response.domain;
  console.log( `Test ${user}!`); 
});    
*/

createDomain( {
      domain: domainName,
      type: 'master',
      soa_email: 'admin@' + domainName,
      refresh_sec: parseInt(timing.refresh),
      retry_sec: parseInt(timing.retry),
      expire_sec: parseInt(timing.expire),
      ttl_sec: parseInt(timing.minimum)
    }).then((response) => {
      //return response.username;
      var user =  response;
      console.log( `Test ${response}!`); 
    }).catch((error) => {
      console.error(error);
    });



  


