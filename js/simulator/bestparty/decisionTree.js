FFSim.Action = (function() {
    
  var ALL_AI = {};

  var addAI = function(name, ai) {
    ALL_AI[name] = ai;
  };
  
  function DecisionMaker(battle, aiName, opt) {
    this.battle = battle;
    this.choices = ALL_AI[aiName] || {};
    
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
          var spellOptions = {};
          if (currentChar.hasItemForSpell(spell)) {
            spellOptions.item = currentChar.getItemForSpell(spell); 
          }
          result = function() { return FFSim.castSpell(currentChar, spell, target, spellOptions); };
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
        
    // If none of the choices resulted in an action, just attack the first alive character
    if (!result.valid) {
      result.valid = true;
      result.target = findFirstAliveChar(args.otherGroup);
      FFSim.Output.log(args.currentChar.charName + " had no good actions, defaulting to attacking " + result.target.charName);
    }
    
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
        
      if (potentialAction.numDuplicates) {
        for (var c in targetChars) {
          var targetChar = targetChars[c];
          if (countPreviousOccurencesForAction(previousChoices, targetChar.charName) < potentialAction.numDuplicates) {
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
        
        // Check char has a spell charge OR has an item to cast the spell
        var hasItem = currentChar.hasItemForSpell(spell.spellId);
        var canCast = currentChar.canCastSpell(spell);
        if (!hasItem && !canCast) {
            FFSim.Output.log(log + " - BAD IDEA, no item/cannot cast/spell charge for [" + spell.spellLevel + "]");
            return {valid:false};
        }
        
        // We are casting on a specific class (and therefore a single person)
        if (potentialAction.targetClass) {
          log += " on " + potentialAction.targetClass;
          // This is for casting beneficial spells on the same group as the caster
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
              if (potentialAction.numDuplicates && countPreviousOccurencesForAction(previousChoices, targetChar.charName, potentialAction.spell) >= potentialAction.numDuplicates) {
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
            // We don't handle single target spells on the other group yet
            FFSim.Output.log(log + " - UNSUPPORTED");
            return { valid:false };
          }
        } else {
          // Spell is either being cast on the other group, the caster's group, or on self
          if (potentialAction.when) {
            var condition = new FFSim.Action.Condition(potentialAction.when);
            var targetChar = null, targets = null;
            
            switch (spell.targetType) {
              case FFSim.SpellTarget.Self:
                targetChar = currentChar;
                targets = currentChar;
                break;
              case FFSim.SpellTarget.All:
                targetChar = currentChar;
                targets = jQuery.merge([], currentGroup);
                break;
            }
            // TODO: spells cast on the other group with a condition still not handled
            
            if (!condition.isValid(targetChar)) {
              FFSim.Output.log(log + " - BAD IDEA, " + targetChar.charName + " does not fulfill the condition of " + potentialAction.when);
              targetChar = null;
              return { valid:false };
            } else {
              FFSim.Output.log(log + " - GOOD");
              return { valid:true, spell:potentialAction.spell, target:targets }; 
            }
          } else {
            FFSim.Output.log(log + " - GOOD");
            return { valid:true, spell:potentialAction.spell, target:otherGroup }; 
          }
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
  };
  
  var findFirstAliveChar = function(group) {
    for (var g in group) {
      if (!group[g].isDead()) {
        return group[g];
      }
    }
    return null;
  };
    
  var countPreviousOccurencesForAction = function(prevChoices, targetName, spell) {
    var count = 0;
    jQuery(prevChoices).each(function() {
      var action = this;
      if (action.target.charName == targetName && (!action.spell || action.spell == spell)) {
        count++;
      }
    });
    return count;
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
    switch (this.attr) {
      case "HP":
        valueToCheck = (this.isPercent ? (target.hitPoints / target.maxHitPoints) : target.hitPoints);
        break;
      case "EVASION":
        valueToCheck = target.evasion();
        break;
    }
    
    return this.operandFunction.apply(null, [valueToCheck, this.value]);
  };
  
  return {
    addAI : addAI
   ,DecisionMaker : DecisionMaker
   ,Condition : Condition
   ,ConditionSetupException : ConditionSetupException
  };
})();