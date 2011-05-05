$(document).ready(function() {

  /* ====================== */
  /* ---- BLACK WIZARD ---- */
  /* ====================== */
  module("White Wizard actions");
  
  test("casting FADE", function() {
    var s = DecisionMakerTest.setup("BM-RM-Th-WMvRM-RM-BB-RM");
    var result = DecisionMakerTest.chooseAnAction(s, 3); 
    ok(result.valid, "WhiteWiz4 should be able to cast FADE");
    equal(result.spell, "FADE", "Spell being cast should be FADE by WhiteWiz4");
    equal(result.target.length, 4, "Spell should be cast on the other group");
  });
  
  test("casting CUR4 on a Master", function() {
    var s = DecisionMakerTest.setup("BB-RM-Th-WMvRM-RM-BB-RM");
    var master = s.battle.group1.chars[0];
    master.applyDamage(master.maxHitPoints * 0.8);
    var result = DecisionMakerTest.chooseAnAction(s, 3);
    ok(result.valid, "WhiteWiz4 should be able to cast CUR4 on a Master");
    equal(result.spell, "CUR4", "Spell being cast should be CUR4 by WhiteWiz4");
    equal(result.target.charName, "Master1", "Spell should be cast on Master4");
  });
  
  test("casting CUR4 on a Master exclusively", function() {
    var s = DecisionMakerTest.setup("BB-RM-WM-WMvRM-RM-BB-RM");
    var master = s.battle.group1.chars[0];
    master.applyDamage(master.maxHitPoints * 0.8);
    
    var result = DecisionMakerTest.chooseAnAction(s, 2);
    var result2 = DecisionMakerTest.chooseAnAction(s, 3, [result]);

    ok(result.valid, "WhiteWiz3 should be able to cast CUR4 on a Master");
    equal(result.spell, "CUR4", "Spell being cast should be CUR4 by WhiteWiz3");
    equal(result.target.charName, "Master1", "Spell should be cast on Master1");

    ok(result2.valid, "WhiteWiz4 should be able to cast FADE");
    equal(result2.spell, "FADE", "Spell being cast should be FADE by WhiteWiz3");
    equal(result2.target.length, 4, "Spell should be cast on the other group");
});
  
  test("casting CUR3 on a Master", function() {
    var s = DecisionMakerTest.setup("BB-RM-Th-WMvRM-RM-BB-RM");
    s.battle.group1.chars[3].useSpellCharge(8);
    var master = s.battle.group1.chars[0];
    master.applyDamage(master.maxHitPoints / 2);
    var result = DecisionMakerTest.chooseAnAction(s, 3);
    ok(result.valid, "WhiteWiz1 should be able to cast CUR3 on a Master");
    equal(result.spell, "CUR3", "Spell being cast should be CUR3 by WhiteWiz1");
    equal(result.target.charName, "Master1", "Spell should be cast on Master1");
  });
  
  test("casting CUR3 on a Knight", function() {
    var s = DecisionMakerTest.setup("BB-Fi-Th-WMvRM-RM-BB-RM");
    s.battle.group1.chars[3].useSpellCharge(8);
    var master = s.battle.group1.chars[0];
    var knight = s.battle.group1.chars[1];
    master.applyDamage(master.maxHitPoints * 0.25); // not enough to warrant a CUR3
    knight.applyDamage(knight.maxHitPoints * 0.5); // enough to warrant a CUR3
    var result = DecisionMakerTest.chooseAnAction(s, 3);
    ok(result.valid, "WhiteWiz1 should be able to cast CUR3 on a Knight");
    equal(result.spell, "CUR3", "Spell being cast should be CUR3 by WhiteWiz1");
    equal(result.target.charName, "Knight2", "Spell should be cast on Knight2");
  });
  
});