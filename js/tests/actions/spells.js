$(document).ready(function() {
  module("Casting spells");

  test("trying to cast a spell on a single target on same team", function() {
    var battle = CharBuilder.setup("Fi-Th-Th-BMvRM-RM-RM-RM");
    var knight = battle.group1.chars[0];
    var blackWizard = battle.group1.chars[3];
    var result = Action.castSpell(blackWizard, "TMPR", knight);
    equal(result.type, "S", "Spell result should be 'S'");
    deepEqual(result.source, blackWizard, "Spell source should be the same as the original black wizard");
    equal(result.target[0].charName, knight.charName, "Spell target should be the knight");
  });

  test("trying to cast a spell on a dead person", function() {
    var battle = CharBuilder.setup("Fi-Th-Th-BMvRM-RM-RM-RM");
    var knight = battle.group1.chars[0];
    var blackWizard = battle.group1.chars[3];
    knight.addStatus(Status.Dead);
    var result = Action.castSpell(blackWizard, "FAST", knight);
    equal(result.target.charName, null, "Spell target should be nobody");
    ok(result.ineffective, "Spell should be ineffective since target is dead");
  });
  
  test("try to cast a healing spell on a dead person", function() {
    var battle = CharBuilder.setup("Fi-Th-Th-WMvRM-RM-RM-RM");
    var knight = battle.group1.chars[0];
    var whiteWizard = battle.group1.chars[3];
    knight.addStatus(Status.Dead);
    var result = Action.castSpell(whiteWizard, "CUR3", knight);
    equal(result.target.charName, null, "Spell target should be nobody");
    ok(result.ineffective, "Spell should be ineffective since target is dead");
    equal(knight.hitPoints, 0, "Target should still have 0 hit points, since healing a dead person is useless");
  });
});