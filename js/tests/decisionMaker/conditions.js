$(document).ready(function() {
  
  module("Conditions");
  
  test("Parsing valid condition", function() {
    var c = new DecisionTree.Condition("HP < 100");
    equal(c.attr, "HP");
    equal(c.operand, "<");
    equal(c.value, 100);
    notEqual(c.operandFunction, null);
  });
  
  test("Parsing condition with less than 3 elements", function() {
    var c = "HP";
    raises(function() {
      new DecisionTree.Condition(c);
    }, function(exception) {
      if (!exception instanceof DecisionTree.ConditionSetupException) {
        return false;
      }
      return exception.message == "Condition text must have 3 elements separated by spaces, [" + c + "] only contained 1";
    });
  });
  
  test("Parsing condition with an invalid operand", function() {
    var c = "HP ~= 10";
    raises(function() {
      new DecisionTree.Condition(c);
    }, function(exception) {
      if (!exception instanceof DecisionTree.ConditionSetupException) {
        return false;
      }
      return exception.message == "Unsupported operand [~=]";
    });
  });
  
  test("HP equality", function() {
    var condition = new DecisionTree.Condition("HP = 100"); 
    ok(condition.isValid(Character.create().hp(100)));
    ok(!condition.isValid(Character.create().hp(100, 90)));
    ok(!condition.isValid(Character.create().hp(100).addStatus(Status.Dead)));
  });
  
  test("HP greater than", function() {
    var condition = new DecisionTree.Condition("HP > 100"); 
    ok(condition.isValid(Character.create().hp(150, 120)));
    ok(!condition.isValid(Character.create().hp(100)));
  });
  
  test("HP less than using static value", function() {
    var condition = new DecisionTree.Condition("HP < 50"); 
    ok(!condition.isValid(Character.create().hp(150, 120)));
    ok(condition.isValid(Character.create().hp(100, 40)));
  });

  test("HP less than using percentage", function() {
    var condition = new DecisionTree.Condition("HP < 50%"); 
    ok(!condition.isValid(Character.create().hp(150, 120)));
    ok(condition.isValid(Character.create().hp(100, 40)));
    ok(!condition.isValid(Character.create().hp(90, 45)));
  });
  

  
});