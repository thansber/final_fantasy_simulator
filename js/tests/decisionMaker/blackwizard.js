$(document).ready(function() {
  
  /* ====================== */
  /* ---- BLACK WIZARD ---- */
  /* ====================== */
  module("Black Wizard actions");
  
  test("casting NUKE", function() {
    var s = DecisionMakerTest.setup("BM-RM-Th-WMvRM-RM-BB-RM");
    var result = DecisionMakerTest.chooseAnAction(s, 0); 
    ok(result.valid, "BlackWiz1 should be able to cast NUKE");
    equal(result.spell, "NUKE", "Spell being cast should be NUKE by BlackWiz1");
    equal(result.target.length, 4, "Spell should be cast on the other group");
  });
  
  test("casting ICE3 after using up L8 spell charges", function() {
    var s = DecisionMakerTest.setup("BM-RM-Th-WMvRM-RM-BB-RM");
    s.battle.group1.chars[0].useSpellCharge(8);
    var result = DecisionMakerTest.chooseAnAction(s, 0); 
    ok(result.valid, "BlackWiz1 should be able to cast ICE3");
    equal(result.spell, "ICE3", "Spell being cast should be ICE3 by BlackWiz1");
    equal(result.target.length, 4, "Spell should be cast on the other group");
  });
  
  test("casting LIT3 after using up L7/L8 spell charges", function() {
    var s = DecisionMakerTest.setup("BM-RM-Th-WMvRM-RM-BB-RM");
    s.battle.group1.chars[0].useSpellCharge(8);
    for (var i = 0; i < 3; i++) {
      s.battle.group1.chars[0].useSpellCharge(7);
    }
    var result = DecisionMakerTest.chooseAnAction(s, 0); 
    ok(result.valid, "BlackWiz1 should be able to cast LIT3");
    equal(result.spell, "LIT3", "Spell being cast should be LIT3 by BlackWiz1");
    equal(result.target.length, 4, "Spell should be cast on the other group");
  });
  
  test("used up all spell charges", function() {
    var s = DecisionMakerTest.setup("BM-RM-Th-WMvRM-RM-BB-RM");
    s.battle.group1.chars[0].useSpellCharge(8);
    for (var i = 0; i < 3; i++) {
      s.battle.group1.chars[0].useSpellCharge(7);
    }
    for (var i = 0; i < 5; i++) {
      s.battle.group1.chars[0].useSpellCharge(6);
    }
    for (var i = 0; i < 5; i++) {
      s.battle.group1.chars[0].useSpellCharge(5);
    }
    var result = DecisionMakerTest.chooseAnAction(s, 0); 
    ok(!result.valid, "BlackWiz1 should be out of spells and out of actions");
  });
  
});