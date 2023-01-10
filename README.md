# linode-dns-tools
A tool collection based on the previous api v3  [github](http://github.com/punkave/linode-dns-tools) was adapted to api v4 for creating and importing a DNS domain from an DNS zone export file [github](https://github.com/Evolane/linode-dns-tools ).



<a href="http://evolane.eu/"><img src="https://github.com/Evolane/linode-dns-tools/blob/main/logos/logo-evolane.png" align="right" /></a>

A collection of tools for the [linode DNS API](https://www.linode.com/docs/api/domains/). 

## Requirements

You must provide your linode API key, which you can generate via your linode profile [linode console] (https://cloud.linode.com/profile/tokens).

## Installation

```
npm install  @linode/api-v4 
npm install -g linode-dns-tools
```

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
