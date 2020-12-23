stack: [
  { actor: '0xB204007d72Bd18A8C1c42ca5E798d284cd22829C', to: 'Foo.testBar' },
  { participant: 'Foo.testBar', input: 'uint256 x = 9', output: 'uint256 10' },
  { participant: 'Bar.inc', input: 'uint256 x = 9', output: 'uint256 10' }
]


// define actors/particpants
// actor B204..829C as eow
// participant Foo.testBar as p1
// participant Bar.inc as p2

---

in-stack:                                                                             out-stack
  { actor: '0xB204007d72Bd18A8C1c42ca5E798d284cd22829C', to: 'Foo.testBar' },
  { participant: 'Foo.testBar', input: 'uint256 x = 9', output: 'uint256 10' },
  { participant: 'Bar.inc', input: 'uint256 x = 9', output: 'uint256 10' }

---

// eow -> p1: uint256 x = 9
// activate p1

  { participant: 'Foo.testBar', input: 'uint256 x = 9', output: 'uint256 10' },      { actor: '0xB204007d72Bd18A8C1c42ca5E798d284cd22829C', to: 'Foo.testBar', act: p1 },
  { participant: 'Bar.inc', input: 'uint256 x = 9', output: 'uint256 10' }

---

// p1 -> p2: uint256 x = 9
// activate p2

                                                                                     { participant: 'Foo.testBar', input: 'uint256 x = 9', output: 'uint256 10', act: p2 }
  { participant: 'Bar.inc', input: 'uint256 x = 9', output: 'uint256 10' },          { actor: '0xB204007d72Bd18A8C1c42ca5E798d284cd22829C', to: 'Foo.testBar', act: p1 },

---
// last item (start unwinding)

// p2 -> p1: uint256 10
// deactivate p2

                                                                                     { actor: '0xB204007d72Bd18A8C1c42ca5E798d284cd22829C', to: 'Foo.testBar', act: p1 },
// p1 -> eow: uint256 10
// deactivate p1

---
define actors/particpants
actor B204..829C as eow
participant Foo.testBar as p1
participant Bar.inc as p2

eow -> p1: uint256 x = 9
activate p1

p1 -> p2: uint256 x = 9
activate p2

p2 -> p1: uint256 10
deactivate p2

p1 -> eow: uint256 10
deactivate p1

---

handle this case too

@startuml

title tx2seq 0xcd8319c4230c3be9f40281a5e41c05c4a74f23479a28555be81f8a4566ec430e

actor B204..829C as eow
 participant Foo.testBar as p1
 participant Bar.inc as p2
 participant Bar.mul as p3

 eow -> p1: uint256 x = 9
 activate p1

p1 -> p2: uint256 x = 9
activate p2

p2 -> p1: uint256 10
deactivate p2

p1 -> p3: mul things
activate p3

p3 -> p1: err
deactivate p3

p1 -> eow: uint256 10
deactivate p1
@enduml
