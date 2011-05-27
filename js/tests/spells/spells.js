$(document).ready(function() {
  module("Spell setup");

  test("spell lookup", function() {
    var name = "CURE";
    var s = Spell.lookup(name); 
    ok(s != null, name + " should have been found");
  });
  
  test("spell attributes set", function() {
    var name = "AICE";
    var s = Spell.lookup(name); 
    equal(s.spellLevel, 4, "Spell level is not correct");
    equal(s.spellId, name, "Spell ID is not correct");
    deepEqual(s.spellType, Spell.SpellType.ResistElement, "Spell type is not correct");
    deepEqual(s.spellTarget, Spell.TargetGroup.All, "Spell target is not correct");
    equal(s.element, Element.Ice, "Element is not correct");
    equal(s.accuracy, 0, "Spell accuracy is not correct");
    equal(s.effectivity, 0, "Spell effectivity is not correct");
    equal(s.status, undefined, "Spell status is not correct");
    equal(s.allowedClasses.length, 4, "# of allowed classes is not correct");
  });
 
  
});