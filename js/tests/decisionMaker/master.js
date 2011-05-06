$(document).ready(function() {

  /* ================ */
  /* ---- KNIGHT ---- */
  /* ================ */
  module("Master actions");
  
  test("attacking a Black Wizard", function() {
    var s = DecisionMakerTest.setup("BB-BB-BB-BBvBM-WM-RM-BM");
    var expectedTargetName = s.battle.group2.chars[0].charName;
    var result = DecisionMakerTest.chooseAnAction(s, 0);
    ok(result.valid, "Master should be able to attack a Black Wizard");
    equal(result.target.charName, expectedTargetName, "Knight should be attacking " + expectedTargetName);
  });
  
  test("at most 2 Masters attack a Red Wizard", function() {
    var s = DecisionMakerTest.setup("BB-BB-BB-BBvTh-Th-Th-RM");
    var expectedRedWizardName = s.battle.group2.chars[3].charName;
    var expectedNinjaName = s.battle.group2.chars[0].charName;
    var result = DecisionMakerTest.chooseAnAction(s, 0);
    var result2 = DecisionMakerTest.chooseAnAction(s, 1, [result]);
    var result3 = DecisionMakerTest.chooseAnAction(s, 2, [result, result2]);
    equal(result.target.charName, expectedRedWizardName, "1st Master should be attacking " + expectedRedWizardName);
    equal(result2.target.charName, expectedRedWizardName, "2nd Master should be attacking " + expectedRedWizardName);
    equal(result3.target.charName, expectedNinjaName, "3rd Master should be attacking " + expectedNinjaName);
  });
  
});