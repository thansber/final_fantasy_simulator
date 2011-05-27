$(document).ready(function() {
  module("Skill setup");

  test("skill inherits from spell", function() {
    var name = "FROST";
    var s = Spell.lookup(name); 
    ok(s != null, name + " should have been found");
  });
  
  test("skill attributes set", function() {
    var name = "HEAT";
    var s = Spell.lookup(name); 
    equal(s.spellLevel, 0, "Spell level is not correct");
    equal(s.spellId, name, "Spell ID is not correct");
    deepEqual(s.spellType, Spell.SpellType.Damage, "Spell type is not correct");
    deepEqual(s.spellTarget, Spell.TargetGroup.All, "Spell target is not correct");
    equal(s.element, Element.Fire, "Element is not correct");
    equal(s.accuracy, 32, "Spell accuracy is not correct");
    equal(s.effectivity, 12, "Spell effectivity is not correct");
    equal(s.status, undefined, "Spell status is not correct");
    equal(s.allowedClasses.length, 0, "# of allowed classes is not correct");
    ok(s.isSkill, "Skill flag should be set");
  });
  
});