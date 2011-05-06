$(document).ready(function() {

  /* =============== */
  /* ---- NINJA ---- */
  /* =============== */
  module("Ninja actions");
  
  test("casting FAST on a Master", function() {
    var s = DecisionMakerTest.setup("Th-Fi-Fi-BBvRM-RM-BB-RM");
    var result = DecisionMakerTest.chooseAnAction(s, 0); 
    ok(result.valid, "Ninja should be able to cast FAST on a Master");
    equal(result.spell, "FAST", "Spell being cast should be FAST");
    equal(result.target.charName, "Master4", "Spell should be cast on a Master");
  });
  
  test("casting FAST on a Master exclusively", function() {
    var s = DecisionMakerTest.setup("Th-Fi-Th-BBvRM-RM-BB-RM");
    var result = DecisionMakerTest.chooseAnAction(s, 0); 
    var result2 = DecisionMakerTest.chooseAnAction(s, 2, [result]); 
    ok(result.valid, "Ninja1 should be able to cast FAST on a Master");
    ok(result2.valid, "Ninja3 should be able to cast FAST on a Knight");
    equal(result.spell, "FAST", "Spell being cast should be FAST by Ninja1");
    equal(result2.spell, "FAST", "Spell being cast should be FAST by Ninja2");
    equal(result.target.charName, "Master4", "Spell should be cast on a Master");
    equal(result2.target.charName, "Knight2", "Spell should be cast on a Knight (skipping Master)");
  });
  
  test("casting FAST when it is already applied", function() {
    var s = DecisionMakerTest.setup("Th-Fi-Th-BBvRM-RM-BB-RM");
    s.battle.group1.chars[3].hitMultiplier = 2;
    var result = DecisionMakerTest.chooseAnAction(s, 0); 
    ok(result.valid, "Ninja1 should be able to cast FAST on a Knight");
    equal(result.spell, "FAST", "Spell being cast should be FAST by Ninja1");
    equal(result.target.charName, "Knight2", "Spell should be cast on a Knight (since Master was already FASTed)");
  });
  
  test("casting TMPR on a Knight", function() {
    var s = DecisionMakerTest.setup("Th-Fi-Th-BBvRM-RM-BB-RM");
    var knight = s.battle.group1.chars[1];
    var master = s.battle.group1.chars[3]; 
    knight.hitMultiplier = 2;
    master.hitMultiplier = 2;
    var result = DecisionMakerTest.chooseAnAction(s, 0); 
    ok(result.valid, "Ninja1 should be able to cast TMPR on a Knight");
    equal(result.spell, "TMPR", "Spell being cast should be TMPR by Ninja1");
    equal(result.target.charName, knight.charName, "Spell should be cast on " + knight.charName);
  });
  
  test("attacking when a Knight is already TMPR'd", function() {
    var s = DecisionMakerTest.setup("Th-Fi-Th-WMvRM-RM-BB-RM");
    var knight = s.battle.group1.chars[1]; 
    var expectedTargetName = s.battle.group2.chars[2].charName;
    knight.hitMultiplier = 2; // FAST the Knight
    knight.spellAttack = 14; // TMPR the Knight
    var result = DecisionMakerTest.chooseAnAction(s, 0);
    ok(result.valid, "Ninja1 should be able to attack");
    equal(result.target.charName, expectedTargetName, "Attack target should be " + expectedTargetName);
  });
  
  test("attacking when there are no available chars to buff", function() {
    var s = DecisionMakerTest.setup("Th-RM-Th-WMvRM-RM-BB-WM");
    var expectedTargetName = s.battle.group2.chars[3].charName;
    var result = DecisionMakerTest.chooseAnAction(s, 0); 
    ok(result.valid, "Ninja1 should be able to attack");
    equal(result.target.charName, expectedTargetName, "Attack target should be " + expectedTargetName);
  });
  
  
});