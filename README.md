![](images/pink-panther.jpg)

```sh
Truffle transaction visualizer: a study aid for Ethereum transactions.

usage:
  truffle run tx2seq [options] <tx-hash>

options:
  -h --help                         Show help
  -v --version                      Show version
  -o --outfile=OUTFILE              Specify the output filename
  -s --short-participant-names      Generate short names for participants. This means
                                    <contract-name> instead of <address>:<contract-name>
  -x --fetch-external               Fetch external sources from EtherScan and Sourcify
```

## Plantuml server

https://github.com/plantuml/plantuml-server

```
docker run -d -p 8080:8080 plantuml/plantuml-server:jetty

### prereqs
```

$ sudo pacman -Sy jre-openjdk-headless
$ sudo pacman -Sy maven``

```

```
