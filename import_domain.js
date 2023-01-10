/*
STEPS 

  1. get code 

install npm: @linode/api-v4 

change code so that you can do a simple node api request in nodejs

https://evolane.atlassian.net/wiki/spaces/AKM/pages/355663873/Linode+api+v4+curl+js+php

https://github.com/Evolane/linode_api_scripts/tree/main

  2. download BIND domain file ( and/or change )

Bv gcloud 

$ gcloud dns record-sets export /Users/lucdouwen/evolane.be.dns.txt --zone=evolane-be --zone-file-format

NS records will be ignored and added via the Linode createdomain api

SOA record

NOT evolane.be. 21600 IN SOA ns-cloud-b1.googledomains.com. cloud-dns-hostmaster.google.com. 1 21600 3600 259200 300

BUT 
evolane.be 21600 SOA ns1.linode.com. cloud-dns-hostmaster.google.com. (
        1
        14400
        3600
        604800
        3600 ) 

SRV record not yet supported --- create manually

A record no . after domain

NOT evolane.be. 18000 IN A 88.221.24.160

BUT evolane.be 18000 A 88.221.24.160

TXT record  no . after domain 

NOT evolane.be. 3600 IN TXT "google-site-verification=mqTzpVYDRb3hg35gf-X23fSDjlmoMpVi6DuJsyShz0A"

BUT evolane.be 3600 TXT "google-site-verification=mqTzpVYDRb3hg35gf-X23fSDjlmoMpVi6DuJsyShz0A"

MX record

NO points in start domain
evolane.be. 604800 IN MX 1 aspmx.l.google.com.
ses.evolane.be. 86400 IN MX 10 inbound-smtp.eu-west-1.amazonaws.com.

BUT 

evolane.be 604800 MX 1 aspmx.l.google.com.
ses.evolane.be 86400 MX 10 inbound-smtp.eu-west-1.amazonaws.com.

CNAME records without domain name !
NOT k2._domainkey.evolane.be. 1800 IN CNAME dkim2.mcsv.net.
BUT k2._domainkey 1800 CNAME dkim2.mcsv.net.

  3. create domain based on that file

§  node createdomain.js -f evolane.be.dns.txt 

  4. load records with id of newly created domain 

$ node importdomain.js -f evolane.be.dns.txt -d 1936678 

NB here created one type in a time. !!! Records will be created double if executed successfully twice

$ node importdomain.js -f evolane.be.dns.txt -d 1936678 2>&1 |  tee TXT.out



*/

import fs from 'fs';
import _yargs from 'yargs';
import _ from 'lodash';
import { hideBin } from 'yargs/helpers';
const yargs = _yargs(hideBin(process.argv));
import { setToken, getProfile, getDomain, createDomain, createDomainRecord } from '@linode/api-v4';
setToken('9138eb8xxxxxxxxxxxxxxxxx');


  const argv = await yargs
      .option('filename', { type: 'string', require: true })
      .option('domainid', { type: 'string', require: true })
      .alias('f', 'filename')
      .alias('d', 'domainid')
      .argv;
  var input = fs.readFileSync(argv.filename, 'utf8' , error => {
      if (error) throw error;
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


/*var domain = 1935127;
getDomain (argv.domainid).then((response) => {
  //return response.username;
  var user =  response.domain;
  console.log( `Test ${user}!`); 
});    
*/

/* Problem to get domain id from createDomain and pass it to createDomainRecord
   So in separate program
var id ;
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
      id =  response.id;
      console.log( `Test ${response.id}!`); 
    }).catch((error) => {
      console.error(error);
    });
*/

/*

evolane.be 21600 IN SOA ns1.linode.com. cloud-dns-hostmaster.google.com. ( 
        1 ; Serial 
        14400 ; Refresh after 3 hours 
        3600 ; Retry after 1 hour 
        604800 ; Expire after 1 week 
        3600 ) 
evolane.be. 18000 IN A 88.221.24.160
evolane.be. 604800 IN MX 5 alt1.aspmx.l.google.com.

type = IN
value = NS ns5.linode.com.
        A 88.221.24.160
        MX 5 alt1.aspmx.l.google.com.
[ { reason: 'Type is required.', field: 'type' } ]

        domainid: 1936372,
        createDomainRecord( {domainId: 1936372}, data).
*/


records.forEach(domainrecfunction)
function domainrecfunction(item,id){
  console.log( `${item.type} _XXX_ ${item.value}`); 
      var data = {
        type: item.type,
        name: item.name,
        target: item.value.replace(/\.$/, ''),
        "priority": 50
      };
      if (item.type === 'MX') {
        data.priority = parseInt(item.priority);
      }
      if (item.ttl) {
        data.ttl_sec = parseInt(item.ttl);
      }
      // export declare const createDomainRecord: (domainId: number, data: Partial<DomainRecord>) => Promise<DomainRecord>;
      // problem to get id from createdomain
      createDomainRecord( argv.domainid, data).then((response) => {
        //return response.username;
        var user =  response;
        console.log( `Test ${response}!`); 
      }).catch((error) => {
        console.error(error);
      });
    }


  


