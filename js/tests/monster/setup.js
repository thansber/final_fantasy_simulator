$(document).ready(function() {
  module("Monster setup");

  test("lookup found (using IMP)", function() {
    var name = "IMP";
    var monster = Monster.lookup(name); 
    ok(monster != null, name + " should have been found");
  });
  
  test("stats set correctly (using IMP)", function() {
    var monster = Monster.lookup("IMP"); 
    equal(monster.hp, 8, "HP incorrectly set");
    equal(monster.attack, 4, "Attack incorrectly set");
    equal(monster.accuracy, 2, "Accuracy incorrectly set");
    equal(monster.numHits, 1, "# hits incorrectly set");
    equal(monster.criticalRate, 1, "Critical rate incorrectly set");
    equal(monster.defense, 4, "Defense incorrectly set");
    equal(monster.evasion, 6, "Evasion incorrectly set");
    equal(monster.magicDef, 16, "Magic defense incorrectly set");
    equal(monster.morale, 106, "Morale incorrectly set");
  });
  
  test("multiple names (using GrIMP)", function() {
    var name = "GrIMP";
    var monster = Monster.lookup(name); 
    equal(monster.name, name, "Incorrect original name");
    equal(monster.otherNames["translated"], "Goblin Guard", "Incorrect translated name");
  });
  
  test("single type (using GrIMP)", function() {
    ok(Monster.lookup("GrIMP").isType(Monster.Types.Giant), "Incorrect type");
  });
  
  test("multiple types (using WrWOLF)", function() {
    var monster = Monster.lookup("WrWOLF");
    var expectedTypes = [Monster.Types.Magical, Monster.Types.Were, Monster.Types.Regenerative];
    for (var t in expectedTypes) {
      ok(monster.isType(expectedTypes[t]), "Monster should be of type " + expectedTypes[t]);
    }
  });
  
  test("attack status/element (using WrWOLF)", function() {
    var monster = Monster.lookup("WrWOLF");
    deepEqual(monster.attackStatus, Status.Poison, "Incorrect status attack");
    deepEqual(monster.attackElement, Element.PoisonStone, "Incorrect element attack");
  });
  
  test("no attack status/element (using GrWOLF)", function() {
    var monster = Monster.lookup("GrWOLF");
    equal(monster.attackStatus, null, "Status attack should be null");
    equal(monster.attackElement, null, "Element attack should be null");
  });
  
  test("element weaknesses/resistances (using FrWOLF)", function() {
    var monster = Monster.lookup("FrWOLF");
    ok(monster.isWeakTo(Element.Fire), "Should be weak to fire");
    ok(!monster.isWeakTo(Element.Time), "Should not be weak to time");
    ok(monster.isProtectedFrom(Element.Ice), "Should resist ice");
    ok(!monster.isProtectedFrom(Element.Earth), "Should not resist earth");
  });
  
  test("element weaknesses/resistances when not set (using WOLF)", function() {
    var monster = Monster.lookup("WOLF");
    for (var e in Element.AllElements) {
      var element = Element.AllElements[e];
      ok(!monster.isWeakTo(element), "Should not be weak to " + element);
      ok(!monster.isProtectedFrom(element), "Should not resist " + element);
    }
  });
  
});