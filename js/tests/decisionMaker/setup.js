var DecisionMakerTest = (function() {
  
  var setup = function(matchup, noChoices) {
    var battle = FFSim.charBuilder.setup(matchup);
    var dm = new FFSim.Action.DecisionMaker(battle, noChoices ? {} : FFSim.Action.Level25Choices, {doNothing:true});
    return {battle:battle, dm:dm};
  };
  
  var chooseAnAction = function(setup, charIndex, prevChoices) {
     return setup.dm.chooseCharAction({
       currentChar: setup.battle.group1.chars[charIndex], 
       group: setup.battle.group1.chars, 
       otherGroup: setup.battle.group2.chars, 
       prevChoices: prevChoices
     });
  };
  
  return {
    setup: setup
   ,chooseAnAction: chooseAnAction
  };
})();