$(document).ready(function() {
  module("Casting spells");

  test("trying to cast a spell on a single target on same team", function() {
    var battle = FFSim.charBuilder.setup("Fi-Th-Th-BMvRM-RM-RM-RM");
    var knight = battle.group1.chars[0];
    var blackWizard = battle.group1.chars[3];
    var result = FFSim.castSpell(blackWizard, "TMPR", knight);
    equal(result.type, "S", "Spell result should be 'S'");
    deepEqual(result.source, blackWizard, "Spell source should be the same as the original black wizard");
    deepEqual(result.target[0].charName, knight.charName, "Spell target should be the knight");
  });

  test("trying to cast a spell on a dead person", function() {
    var battle = FFSim.charBuilder.setup("Fi-Th-Th-BMvRM-RM-RM-RM");
    var knight = battle.group1.chars[0];
    var blackWizard = battle.group1.chars[3];
    knight.addStatus(FFSim.Dead);
    var result = FFSim.castSpell(blackWizard, "FAST", knight);
    deepEqual(result.target, knight, "Spell target should be the knight");
    ok(result.ineffective, "Spell should be ineffective since target is dead");
  });
  
});