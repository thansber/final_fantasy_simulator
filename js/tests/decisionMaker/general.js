$(document).ready(function() {
  
  module("General actions");
  
  test("character is dead", function() {
    var s = DecisionMakerTest.setup("Th-BB-BM-BMvFi-BB-RM-WM");
    s.battle.group1.chars[0].addStatus(Status.Dead);
    var result = DecisionMakerTest.chooseAnAction(s, 0);
    equal(result, null, "Dead character should return a null result");
  });
  
  test("no available choices", function() {
    var s = DecisionMakerTest.setup("Th-BB-BM-BMvFi-BB-RM-WM", true);
    var result = DecisionMakerTest.chooseAnAction(s, 0);
    equal(result, null, "Result with empty choices for char should be null");
  });

});