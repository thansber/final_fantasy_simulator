var DecisionMakerTest = (function() {
  
  var setup = function(matchup, noChoices) {
    var battle = FFSim.charBuilder.setup(matchup);
    var dm = new FFSim.Action.DecisionMaker(battle, noChoices ? {} : FFSim.Level25AI.NAME, {doNothing:true});
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
  
  var useAllSpellCharges = function(source, spellLevels) {
    for (var s in spellLevels) {
      for (var i = 0; i <= 9; i++) {
        source.useSpellCharge(spellLevels[s]);
      }
    }
  };
  
  return {
    setup: setup
   ,chooseAnAction: chooseAnAction
   ,useAllSpellCharges: useAllSpellCharges
  };
})();