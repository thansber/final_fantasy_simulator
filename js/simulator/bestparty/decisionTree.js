FFSim.Action = (function() {
    
  function DecisionMaker(battle, choices, opt) {
    this.battle = battle;
    this.choices = choices;
    
    if (!opt || !opt.doNothing) {
      FFSim.Output.log("========== DECIDING ON BEST ACTIONS FOR GROUP 1 ==========");
      var group1Actions = this.chooseGroupActions(battle.group1, battle.group2);

      FFSim.Output.log("========== DECIDING ON BEST ACTIONS FOR GROUP 2 ==========");
      var group2Actions = this.chooseGroupActions(battle.group2, battle.group1);
      FFSim.Output.log("\n\n");
      
      this.round = jQuery.merge(jQuery.merge([], group1Actions), group2Actions);
    }
  }; 

  DecisionMaker.prototype.chooseGroupActions = function(group, otherGroup) {
    var self = this;
    var actions = [];
    var prevChoices = [];
    jQuery(group.chars).each(function() {
      var currentChar = this;
      var args = {
        currentChar:currentChar, 
        group:group.chars, 
        otherGroup:otherGroup.chars, 
        prevChoices:prevChoices
      };
      var action = self.chooseCharAction(args);
      if (action && action.target) {
        prevChoices.push(action);
        var target = action.target;
        var spell = action.spell;
        var result = null;
        
        if (spell) {
          result = function() { return FFSim.castSpell(currentChar, spell, target); };
        } else {
          result = function() { return FFSim.attack(currentChar, target); };
        }
        actions.push(new FFSim.Output.Result(result));
      }
    });
    return actions;
  };

  DecisionMaker.prototype.chooseCharAction = function(args) {
    var currentChar = args.currentChar;
    FFSim.Output.log("-- determining action for " + currentChar.charName + " --");
    var classChoices = this.choices[currentChar.currentClass.name];
    if (!classChoices) {
      FFSim.Output.log("no class choices available for a " + currentChar.currentClass.name);
      return null;
    }
    if (currentChar.isDead()) {
      FFSim.Output.log(currentChar.charName + " is dead, no action taken");
      return null;
    }
    
    var result = null;
    
    jQuery(classChoices).each(function() {
      var potentialAction = this;
      var target = null;
      if (potentialAction.type == "A") {
        result = buildAttackAction(potentialAction, args); 
        return !result.valid;
      } else if (potentialAction.type == "S") {
        result = buildSpellAction(potentialAction, args); 
        return !result.valid;
      }
    });
        
    return result;
  };
    
  var buildAttackAction = function(potentialAction, args) {
    var currentChar = args.currentChar;
    var otherGroup = args.otherGroup;
    var previousChoices = args.prevChoices;
    var log = currentChar.charName + " is trying to attack";
    
    if (potentialAction.targetClass) {
      log += " a " + potentialAction.targetClass;
      var targetChars = findCharsWithClass(otherGroup, potentialAction.targetClass);
      
      if (targetChars.length == 0) {
        FFSim.Output.log(log + " - BAD IDEA, no " + potentialAction.targetClass + " is present or alive");
        return {valid:false};
      }
        
      if (potentialAction.exclusive) {
        for (var c in targetChars) {
          var targetChar = targetChars[c];
          if (!isGoingToBeAttacked(previousChoices, targetChar.charName)) {
            FFSim.Output.log(log + " - GOOD, attacking " + targetChar.charName);
            return {valid:true, target:targetChar};
          }
        }
        FFSim.Output.log(log + " - BAD IDEA, all target chars are already being attacked");
        return {valid:false};
      } else {
        var targetChar = targetChars[0]; // just use the first one
        FFSim.Output.log(log + " - GOOD, attacking " + targetChar.charName);
        return {valid:true, target:targetChar};
      }
    }
  };
    
    var buildSpellAction = function(potentialAction, args) {
        var currentChar = args.currentChar;
        var currentGroup = args.group; 
        var otherGroup = args.otherGroup;
        var previousChoices = args.prevChoices;

        var log = currentChar.charName + " is trying to cast " + potentialAction.spell;
        var spell = FFSim.getSpell(potentialAction.spell);
        
        // Check char has a spell charge
        if (!currentChar.hasSpellCharge(spell.spellLevel)) {
            FFSim.Output.log(log + " - BAD IDEA, no spell charge for level " + spell.spellLevel);
            return {valid:false};
        }
        
        if (potentialAction.targetClass) {
          log += " on " + potentialAction.targetClass;
          if (spell.spellType.targetGroup == FFSim.SpellGroup.Same) {
            var targetChars = findCharsWithClass(currentGroup, potentialAction.targetClass);
            if (targetChars.length == 0) {
              FFSim.Output.log(log + " - BAD IDEA, no " + potentialAction.targetClass + " is present or alive");
              return {valid:false};
            }
            
            var targetChar = null;
            for (var c in targetChars) {
              targetChar = targetChars[c];
              // Check if the target(s) already have the applied effects, no sense in casting again (for example, FAST)
              if (spell.isAlreadyApplied && spell.isAlreadyApplied.apply(targetChar)) {
                FFSim.Output.log(log + " - BAD IDEA, " + targetChar.charName + " already has the spell's effect applied");
                targetChar = null;
                continue;
              }
              // Check if the spell is already being cast by another member 
              if (potentialAction.exclusive && isGoingToBeCast(previousChoices, potentialAction.spell, targetChar.charName)) {
                FFSim.Output.log(log + " - BAD IDEA, " + targetChar.charName + " is already being targeted by this spell");
                targetChar = null;
                continue;
              }
              
              if (potentialAction.when) {
                var condition = new FFSim.Action.Condition(potentialAction.when);
                if (!condition.isValid(targetChar)) {
                  FFSim.Output.log(log + " - BAD IDEA, " + targetChar.charName + " does not fulfill the condition of " + potentialAction.when);
                  targetChar = null;
                  continue;
                }
              }
              break;
            }
                
            if (targetChar) {
              FFSim.Output.log(log + " - GOOD");
              return { valid:true, spell:potentialAction.spell, target:targetChar };
            } else {
              return { valid:false };
            }
          } else if (spell.spellType.targetGroup == FFSim.SpellGroup.Other) {
            FFSim.Output.log("UNSUPPORTED");
          }
        } else {
          FFSim.Output.log(log + " - GOOD");
          return { valid:true, spell:potentialAction.spell, target:otherGroup }; 
        }
    };
    
  var findCharsWithClass = function(group, charClass) {
    var matchingChars = [];
    for (var g in group) {
      if (group[g].currentClass.name == charClass && !group[g].isDead()) {
        matchingChars.push(group[g]);
      }
    }
    return matchingChars;
  }
    
  var isGoingToBeAttacked = function(prevChoices, targetName) {
    var found = false;
    jQuery(prevChoices).each(function() {
      var action = this;
      if (!action.spell && action.target.charName == targetName) {
        found = true;
        return false;
      }
    });
    return found;
  };
    
  var isGoingToBeCast = function(prevChoices, spell, targetName) {
    var found = false;
    jQuery(prevChoices).each(function() {
      var action = this;
      if (action.spell == spell && action.target.charName == targetName) {
        found = true;
        return false;
      }
    });
    return found;
  };
    
  var conditionOperands = {
    "<" : function(value, check) { return value < check; }  
   ,"<=" : function(value, check) { return value <= check; }  
   ,">" : function(value, check) { return value > check; }  
   ,">=" : function(value, check) { return value >= check; }  
   ,"=" : function(value, check) { return value == check; }  
   ,"==" : function(value, check) { return value == check; }  
  };
  
  function ConditionSetupException(msg) {
    this.message = msg;
  };
  
  function Condition(text) {
    var elems = text.split(" ");
    if (elems.length < 3) {
      throw new ConditionSetupException("Condition text must have 3 elements separated by spaces, [" + text + "] only contained " + elems.length); 
    }
    
    this.attr = elems[0];
    this.operand = elems[1];
    this.operandFunction = conditionOperands[this.operand];
    this.isPercent = elems[2].indexOf("%") > -1;
    this.value = (this.isPercent ? parseInt(elems[2].replace("%", "")) / 100 : parseInt(elems[2]));
    
    if (this.operandFunction == null) {
      throw new ConditionSetupException("Unsupported operand [" + elems[1] + "]"); 
    }
  };
  
  Condition.prototype.isValid = function(target) {
    var valueToCheck = -1;
    if (this.attr == "HP") {
      valueToCheck = (this.isPercent ? (target.hitPoints / target.maxHitPoints) : target.hitPoints);
    }
    
    return this.operandFunction.apply(null, [valueToCheck, this.value]);
  };
  
  var Level25Choices = {};
  Level25Choices[FFSim.KNIGHT] = [
    {type:"A", targetClass:FFSim.BLACK_WIZARD, exclusive:true}
   ,{type:"A", targetClass:FFSim.WHITE_WIZARD, exclusive:true}
   ,{type:"A", targetClass:FFSim.MASTER}
   ,{type:"A", targetClass:FFSim.KNIGHT}
   ,{type:"A", targetClass:FFSim.RED_WIZARD}
   ,{type:"A", targetClass:FFSim.NINJA}
  ];    
  Level25Choices[FFSim.NINJA] = [
    {type:"S", spell:"FAST", targetClass:FFSim.MASTER, exclusive:true}
   ,{type:"S", spell:"FAST", targetClass:FFSim.KNIGHT, exclusive:true}
   ,{type:"S", spell:"TMPR", targetClass:FFSim.KNIGHT, exclusive:true}
   ,{type:"A", targetClass:FFSim.BLACK_WIZARD}
   ,{type:"A", targetClass:FFSim.WHITE_WIZARD}
   ,{type:"A", targetClass:FFSim.MASTER}
   ,{type:"A", targetClass:FFSim.KNIGHT}
   ,{type:"A", targetClass:FFSim.RED_WIZARD}
   ,{type:"A", targetClass:FFSim.NINJA}
  ];
  Level25Choices[FFSim.MASTER] = [
    {type:"A", targetClass:FFSim.BLACK_WIZARD, exclusive:true}
   ,{type:"A", targetClass:FFSim.WHITE_WIZARD, exclusive:true}
   ,{type:"A", targetClass:FFSim.MASTER}
   ,{type:"A", targetClass:FFSim.KNIGHT}
   ,{type:"A", targetClass:FFSim.RED_WIZARD}
   ,{type:"A", targetClass:FFSim.NINJA}
  ];
  Level25Choices[FFSim.RED_WIZARD] = [
    {type:"S", spell:"FAST", targetClass:FFSim.MASTER, exclusive:true}
   ,{type:"S", spell:"FAST", targetClass:FFSim.KNIGHT, exclusive:true}
   ,{type:"S", spell:"TMPR", targetClass:FFSim.KNIGHT, exclusive:true}
   ,{type:"S", spell:"LIT3"}
   ,{type:"S", spell:"FIR3"}
   ,{type:"A", targetClass:FFSim.BLACK_WIZARD}
   ,{type:"A", targetClass:FFSim.WHITE_WIZARD}
   ,{type:"A", targetClass:FFSim.MASTER}
   ,{type:"A", targetClass:FFSim.KNIGHT}
   ,{type:"A", targetClass:FFSim.RED_WIZARD}
   ,{type:"A", targetClass:FFSim.NINJA}
  ];
  Level25Choices[FFSim.WHITE_WIZARD] = [
    {type:"S", spell:"CUR4", targetClass:FFSim.MASTER, when:"HP < 25%", exclusive:true}
   ,{type:"S", spell:"CUR4", targetClass:FFSim.KNIGHT, when:"HP < 25%", exclusive:true}
   ,{type:"S", spell:"CUR4", targetClass:FFSim.WHITE_WIZARD, when:"HP < 40%", exclusive:true}
   ,{type:"S", spell:"FADE"}
   ,{type:"S", spell:"CUR3", targetClass:FFSim.MASTER, when:"HP < 60%"}
   ,{type:"S", spell:"CUR3", targetClass:FFSim.KNIGHT, when:"HP < 60%"}
   ,{type:"S", spell:"CUR3", targetClass:FFSim.WHITE_WIZARD, when:"HP < 60%", exclusive:true}
   ,{type:"S", spell:"CUR3", targetClass:FFSim.BLACK_WIZARD, when:"HP < 60%", exclusive:true}
   ,{type:"S", spell:"CUR3", targetClass:FFSim.NINJA, when:"HP < 60%"}
   ,{type:"S", spell:"CUR3", targetClass:FFSim.RED_WIZARD, when:"HP < 60%"}
   ,{type:"A", targetClass:FFSim.BLACK_WIZARD}
   ,{type:"A", targetClass:FFSim.WHITE_WIZARD}
   ,{type:"A", targetClass:FFSim.MASTER}
   ,{type:"A", targetClass:FFSim.KNIGHT}
   ,{type:"A", targetClass:FFSim.RED_WIZARD}
   ,{type:"A", targetClass:FFSim.NINJA}
  ];
  Level25Choices[FFSim.BLACK_WIZARD] = [
    {type:"S", spell:"NUKE"}
   ,{type:"S", spell:"FAST", targetClass:FFSim.MASTER, exclusive:true}
   ,{type:"S", spell:"FAST", targetClass:FFSim.KNIGHT, exclusive:true}
   ,{type:"S", spell:"ICE3"}
   ,{type:"S", spell:"LIT3"}
   ,{type:"S", spell:"FIR3"}
   ,{type:"A", targetClass:FFSim.BLACK_WIZARD}
   ,{type:"A", targetClass:FFSim.WHITE_WIZARD}
   ,{type:"A", targetClass:FFSim.MASTER}
   ,{type:"A", targetClass:FFSim.KNIGHT}
   ,{type:"A", targetClass:FFSim.RED_WIZARD}
   ,{type:"A", targetClass:FFSim.NINJA}
  ];
  
  return {
    DecisionMaker : DecisionMaker
   ,Condition : Condition
   ,ConditionSetupException : ConditionSetupException
   ,Level25Choices : Level25Choices
  };
})();