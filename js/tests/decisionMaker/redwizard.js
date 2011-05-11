$(document).ready(function() {
  
  /* ====================== */
  /* ---- RED WIZARD ---- */
  /* ====================== */
  module("Red Wizard actions");
  
  test("attacking a Black Wizard", function() {
    var s = DecisionMakerTest.setup("Th-Th-RM-WMvRM-RM-RM-BM");
    var redWizard = s.battle.group1.chars[2];
    var blackWizardTarget = s.battle.group2.chars[3]; 
    var result = DecisionMakerTest.chooseAnAction(s, 2); 
    equal(result.target.charName, blackWizardTarget.charName, "Should be attacking " + blackWizardTarget.charName);
  });
  
  test("casting RUSE on self", function() {
    var s = DecisionMakerTest.setup("Th-Th-RM-WMvRM-RM-RM-WM");
    var redWizard = s.battle.group1.chars[2];
    DecisionMakerTest.useAllSpellCharges(redWizard, [5,6]);
    var result = DecisionMakerTest.chooseAnAction(s, 2); 
    equal(result.spell, "RUSE", "Spell being cast should be RUSE");
    equal(result.target.charName, redWizard.charName, "Should be casting RUSE on self");
  });
  
  /* Now that RWs cast LIT3 first, they will never cast INV2
  test("casting INV2 on self", function() {
    var s = DecisionMakerTest.setup("Th-Th-RM-WMvRM-RM-RM-WM");
    var redWizard = s.battle.group1.chars[2];
    DecisionMakerTest.useAllSpellCharges(redWizard, [5, 6]);
    FFSim.castSpell(redWizard, "RUSE", redWizard);
    FFSim.castSpell(redWizard, "RUSE", redWizard);
    var result = DecisionMakerTest.chooseAnAction(s, 2); 
    equal(result.spell, "INV2", "Spell being cast should be INV2");
    equal(result.target.length, 4, "Target should be caster's group");
  });
  */
  
  test("casting INV2 on self using a White[R]", function() {
    var s = DecisionMakerTest.setup("Th-RM-RM-WMvRM-RM-RM-WM");
    var redWizard = s.battle.group1.chars[2];
    DecisionMakerTest.useAllSpellCharges(redWizard, [5, 6]);
    FFSim.castSpell(redWizard, "RUSE", redWizard);
    FFSim.castSpell(redWizard, "RUSE", redWizard);
    var result = DecisionMakerTest.chooseAnAction(s, 2); 
    equal(result.spell, "INV2", "Spell being cast should be INV2");
  });
  
  test("casting LIT3 after evasion is practically maxed", function() {
    var s = DecisionMakerTest.setup("Th-Th-RM-WMvRM-RM-RM-WM");
    var redWizard = s.battle.group1.chars[2];
    FFSim.castSpell(redWizard, "RUSE", redWizard);
    FFSim.castSpell(redWizard, "RUSE", redWizard);
    FFSim.castSpell(redWizard, "INV2", s.battle.group1.chars);
    var result = DecisionMakerTest.chooseAnAction(s, 2); 
    equal(result.spell, "LIT3", "Spell being cast should be LIT3");
    equal(result.target.length, 4, "Target should be other group");
  });
  
  
});