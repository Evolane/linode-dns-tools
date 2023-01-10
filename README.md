# linode-dns-tools
A tool collection based on the previous api v3  [github](http://github.com/punkave/linode-dns-tools) was adapted to api v4 for creating and importing a DNS domain from an DNS zone export file [github](https://github.com/Evolane/linode-dns-tools ).


<a href="http://evolane.eu/"><img src="https://github.com/Evolane/linode-dns-tools/master/logos/logo-evolane.png" align="right" /></a>

A collection of tools for the [linode DNS API](https://www.linode.com/api/dns).

## Requirements

You must provide your linode API key, which you can generate via your linode profile. If there is a `.linode-key` file in the current directory, it is used, otherwise the `.linode-key` file in your home directory is used.

## Installation

```
npm install -g linode-dns-tools
```

# The tools

## linode-import-zone-file

Imports bind-style DNS zone files via the Linode API. Very useful if you've exported one from another hosting service that won't allow Linode's automatic zone export feature.
This is the case for most cloud services.

### Usage

```
linode-import-zone-file zonefile
```

It takes a little time depending on how many records you have.

TODO: currently no support for SRV records. Pull requests welcome.

Note that if an error is reported, no records beyond that point are imported.

Runs quietly if nothing is wrong. Use `--verbose` for detailed output.

## linode-change-ip

Globally replace an IP address in all of your domains, or one particular domain. Very useful when you replace a server.

### Usage

```
linode-change-ip --old=1.1.1.1 --new=2.2.2.2
```

Optionally you can do this for just one domain:

```
linode-change-ip --old=1.1.1.1 --new=2.2.2.2 --domain=mycompany.com
```

Runs quietly if nothing is wrong. Use `--verbose` for detailed output.

## linode-add-record

A simple utility to add a new record.

```
linode-add-record --domain=foo.com --type=a --name=bar --target=1.2.3.4
```

Currently does not support record types that require more than just a name and target. Pull requests always welcome.

## About P'unk Avenue and Apostrophe

`linode-dns-tools` was created at [Evolane](http://evolane.eu) to support our work on Evolane, an open-source content management system built on node.js. If you like `linode-dns-tools` you should definitely [check out evolane.eu](http://evolane.eu). 

## Support

Feel free to open issues on [github](https://github.com/Evolane/linode-dns-tools/master/logos/logo-evolane.png).

<a href="http://evolane.eu/"><img src="https://github.com/Evolane/linode-dns-tools/master/logos/logo-evolane.png" /></a>
