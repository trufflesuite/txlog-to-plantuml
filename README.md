```
Truffle Transaction Visualizer

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

## Todo

- [ ] Tests
  - [ ] Participants
    - [x] uses short participant names
    - [x] can add participants
    - [x] avoids alias name collisions
    - [x] tracks all participants
  - [x] Constructor calls
    - [x] invoked with no parameters
    - [x] invoked with a contract parameter
    - [x] invoked with ETHER
  - [x] CallRelation
  - [x] ReturnRelation
  - [x] RevertRelation
    - [x] can revert entire transaction
    - [x] can be caught
  - [ ] MessageRelation
  - [ ] SelfDestructRelation
  - [x] Deactivate

## Plantuml server

https://github.com/plantuml/plantuml-server

```
docker run -d -p 8080:8080 plantuml/plantuml-server:jetty

# prereqs on Arch

$ sudo pacman -Sy jre-openjdk-headless
$ sudo pacman -Sy maven``
```
