# linode-dns-tools
A tool collection based on the previous api v3  [github](http://github.com/punkave/linode-dns-tools) was adapted to api v4 for creating and importing a DNS domain from an DNS zone export file [github](https://github.com/Evolane/linode-dns-tools ).



<a href="http://evolane.eu/"><img src="https://github.com/Evolane/linode-dns-tools/blob/main/logos/logo-evolane.png" align="right" /></a>

A collection of tools for the [linode DNS API](https://www.linode.com/docs/api/domains/). 

## Requirements

You must provide your linode API key, which you can generate via your linode profile [linode console] (https://cloud.linode.com/profile/tokens).

## Installation

```
npm install linode-dns-tools
npm run correct 

( npm install -g linode-dns-tools 
  is not recommended as one still has to correct the @linode/api-v4 module for the ERROR below 
  So we added the following "correct" command to the package.json scripts that will change an original indec.js file
    "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1" , 
    "correct": "cp index.js  ./node_modules/@linode/validation/lib/esm/ "
  $ ls -l ./node_modules/@linode/validation/lib/esm/index.js*
-rw-r--r--  1 xxxxxxx  staff  40965 Dec 23 10:00 ./node_modules/@linode/validation/lib/esm/index.js
-rw-r--r--  1 xxxxxxx  staff  40805 Dec 23 10:00 ./node_modules/@linode/validation/lib/esm/index.js.ori

ERROR   
$ node linode_create_import_domain.js -f importfiles/akamai.test.dns.txt -t 9138exxxxxxxxxxxxxxxxxxxx
file:///Users/xxxxxxx/projects/linode-dns-tools/node_modules/@linode/validation/lib/esm/index.js:219
import { parse as parseIP, parseCIDR } from "ipaddr.js";
                           ^^^^^^^^^
SyntaxError: Named export 'parseCIDR' not found. The requested module 'ipaddr.js' is a CommonJS module, which may not support all module.exports as named exports.
CommonJS modules can always be imported via the default export, for example using:
import pkg from 'ipaddr.js';
const { parse: parseIP, parseCIDR } = pkg;  
```
) 

# The tools

## linode-import-zone-file

Imports bind-style DNS zone files via the Linode API. Very useful if you've exported one from another hosting service that won't allow Linode's automatic zone export feature.
This is the case for most cloud services.
You may have to adapt the export zone file. See e.g. a Google exported zone file importfiles/akamai.test.dns.txt.ori  was changed to fit the program : 
- IN in the records removed
- the point after the origin name must be removed on all lines e.g. 
akamai.test.
changed to 
akamai.test 
- SOA file replaced an put to the first line 
akamai.test. 21600 IN SOA ns-cloud-d1.googledomains.com. cloud-dns-hostmaster.google.com. 1 21600 3600 259200 300
changed to 
akamai.test      3600                    ns23.domaincontrol.com. dns.jomax.net. (
                                        2022120903
                                        28800
                                        7200
                                        604800
                                        300
                                        ) 
Note that the name server in the SOA record and the NS records are ignored.  

### Usage

```
linode-import-zone-file zonefile
```

It takes a little time depending on how many records you have.

TODO: currently no support for SRV records. Pull requests welcome.

Note that if an error is reported, no records beyond that point are imported.

Runs quietly if nothing is wrong. Use `--verbose` for detailed output.


## About Evolane

`linode-dns-tools` was created at [Evolane](http://evolane.eu) to support our work on Evolane, an open-source content management system built on node.js. If you like `linode-dns-tools` you should definitely [check out evolane.eu](http://evolane.eu). 

## Support

Feel free to open issues on [github](https://github.com/Evolane/linode-dns-tools/master/logos/logo-evolane.png).

<a href="http://evolane.eu/"><img src="https://github.com/Evolane/linode-dns-tools/blob/main/logos/logo-evolane.png" /></a>
