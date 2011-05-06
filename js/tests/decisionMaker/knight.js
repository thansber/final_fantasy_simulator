$(document).ready(function() {

  /* ================ */
  /* ---- KNIGHT ---- */
  /* ================ */
  module("Knight actions");
  
  test("attacking a Black Wizard", function() {
    var s = DecisionMakerTest.setup("Fi-Fi-Fi-FivBM-WM-RM-BM");
    var result = DecisionMakerTest.chooseAnAction(s, 0);
    ok(result.valid, "Knight should be able to attack a Black Wizard");
    equal(result.target.charName, "BlackWiz5", "Knight should be attacking first Black Wizard");
  });
  
  test("attacking a Black Wizard skipping a dead one", function() {
    var s = DecisionMakerTest.setup("Fi-Fi-Fi-FivBM-WM-RM-BM");
    // Now make the first BM dead, Fi should target the 2nd one
    s.battle.group2.chars[0].addStatus(FFSim.Dead);
    var result = DecisionMakerTest.chooseAnAction(s, 0);
    ok(result.valid, "Knight should be able to attack a Black Wizard");
    equal(result.target.charName, "BlackWiz8", "Knight should be attacking last Black Wizard");
  });
  
  test("attacking a Black Wizard exclusively", function() {
    // Test exclusivity
    var s = DecisionMakerTest.setup("Fi-Fi-Fi-FivBM-WM-RM-BM");
    var result = DecisionMakerTest.chooseAnAction(s, 0); 
    var result2 = DecisionMakerTest.chooseAnAction(s, 1, [result]);  
    equal(result.target.charName, "BlackWiz5", "1st knight should be attacking 1st Black Wizard");
    equal(result2.target.charName, "BlackWiz8", "2nd knight should be attacking 2nd Black Wizard");
  });
  
  test("attacking a White Wizard skipping Black Wizards", function() {
    var s = DecisionMakerTest.setup("Fi-Fi-BM-BMvBM-WM-RM-BM");
    // Make both BMs dead, Fi should move on to the WM
    s.battle.group2.chars[0].addStatus(FFSim.Dead);
    s.battle.group2.chars[3].addStatus(FFSim.Dead);
    var result = DecisionMakerTest.chooseAnAction(s, 0); 
    ok(result.valid, "Knight should still be able to attack a White Wizard");
    equal(result.target.charName, "WhiteWiz6", "Knight should be attacking White Wizard");
  });
  
  test("attacking a Master skipping Black and White Wizards", function() {
    var s = DecisionMakerTest.setup("Fi-Fi-BM-BMvBM-RM-BB-WM");
    // Make BM and WM dead, Fi should move on to the BB
    s.battle.group2.chars[0].addStatus(FFSim.Dead);
    s.battle.group2.chars[3].addStatus(FFSim.Dead);
    var result = DecisionMakerTest.chooseAnAction(s, 0); 
    ok(result.valid, "Knight should still be able to attack a Master");
    equal(result.target.charName, "Master7", "Knight should be attacking Master");
  });
  
  test("dogpiling a Master", function() {
    var s = DecisionMakerTest.setup("Fi-Fi-Fi-BMvRM-RM-BB-RM");
    var result = DecisionMakerTest.chooseAnAction(s, 0); 
    var result2 = DecisionMakerTest.chooseAnAction(s, 1, [result]); 
    var result3 = DecisionMakerTest.chooseAnAction(s, 2, [result, result2]); 
    
    ok(result.valid, "Knight1 should be able to attack a Master");
    ok(result2.valid, "Knight2 should be able to attack a Master");
    ok(result3.valid, "Knight3 should be able to attack a Master");
    equal(result.target.charName, "Master7", "Knight1 should be attacking Master");
    equal(result2.target.charName, "Master7", "Knight2 should be attacking Master");
    equal(result3.target.charName, "Master7", "Knight3 should be attacking Master");
  });
  
  test("dogpiling a White Wizard when it is the last one left", function() {
    var s = DecisionMakerTest.setup("Fi-Fi-Fi-BMvRM-RM-RM-WM");
    var whiteWizardTarget = s.battle.group2.chars[3].charName;
    for (var i = 0; i < 3; i++) {
      s.battle.group2.chars[i].addStatus(FFSim.Dead); // kill the first 3 red wizards
    }
    var result = DecisionMakerTest.chooseAnAction(s, 0); 
    var result2 = DecisionMakerTest.chooseAnAction(s, 1, [result]); 
    var result3 = DecisionMakerTest.chooseAnAction(s, 2, [result, result2]); 
    ok(result.valid, "Knight1 should be attacking");
    ok(result2.valid, "Knight2 should be attacking");
    ok(result3.valid, "Knight3 should be attacking");
    equal(result.target.charName, whiteWizardTarget, "Knight1 should be attacking " + whiteWizardTarget);
    equal(result2.target.charName, whiteWizardTarget, "Knight2 should be attacking " + whiteWizardTarget);
    equal(result3.target.charName, whiteWizardTarget, "Knight3 should be attacking " + whiteWizardTarget);
  });
  
});