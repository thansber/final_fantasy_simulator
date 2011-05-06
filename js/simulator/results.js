FFSim.Output = (function() {
    
    var consoleOn = true;
    var roundOn = true;
    var charsOn = true;
    
    function Result(actionToTake) {
        this.action = actionToTake;
        this.ffd = "";
    };
    
    Result.prototype.toString = function() {
        this.ffd = "";
        var a = this.action.apply();
        if (a == null) {
            return "";
        } else if (a.type == "A") {
            this.ffd = generateAttackFFD(a);
            return this.attackToString(a) + "\n";
        } else if (a.type == "S") {
            this.ffd = generateSpellFFD(a);
            return a.source.charName + ": Casts " + a.spell.spellId + this.spellToString(a) + "\n";
        } else if (a.type == "I") {
          return a.source.charName + ": Uses " + a.item.name + this.spellToString(a) + "\n";
        }
        return "Invalid action type [" + a.type + "]";
    };
 
    Result.prototype.attackToString = function(a) {
        var r = a.source.charName + ": ";
        
        if (a.hits != null) {
            if (a.hits == 0) {
                r += "Misses";
            } else {
                if (a.crit) {
                    r += "Critical! ";
                }
                r += a.hits + "-Hit" + (a.hits > 1 ? "s" : "");
                r += " " + a.dmg + "-Damage";
            }
            r += " against " + a.target.charName;
            
            if (a.died) {
                r += ", Terminated";
            }
        }
        else if (a.wasDead) {
            r += "Attacks " + a.target.charName + ", Ineffective";
        }
        
        return r;
    };
    
    Result.prototype.spellToString = function(a) {
        var r = "";        
        if (a.spell.spellType == FFSim.SpellType.Damage) {
            r += " for ";
            jQuery(a.target).each(function(i) { 
                if (a.dmg[i] != null) {
                    r += (i > 0 ? ", " : "") + a.dmg[i] + "-" + this.charName + (a.died[i] ? " Terminated" : "");
                }
            });
        } else {
            r += " on "
            jQuery(a.target).each(function(i) { 
              r += (i > 0 ? ", " : "") + this.charName;
              if (a.ineffective) {
                r += ", Ineffective";
              }
            });
        }
        
        return r;
    };
    
    var generateAttackFFD = function(a) {
        var ffd = "new FFDChar.Attack()";
        ffd += ".source(\"" + a.source.charName + "\"," + getGroupIndexFromChar(a.source.charName) + ")";
        ffd += ".target(\"" + a.target.charName + "\")";
        ffd += ".charIsTarget()";
        
        if (a.wasDead) {
            ffd += ".dmg(0)";
        } else {
            ffd += ".hits(" + a.hits + ")";
            ffd += ".dmg(" + a.dmg + ")";
            if (a.crit) {
                ffd += ".critical()";
            }
            if (a.died) {
                ffd += ".dead()";
            }
        }
        
        return ffd;
    };
    
    var generateSpellFFD = function(a) {
        var ffd = "new FFDChar.Spell()";
        ffd += ".source(\"" + a.source.charName + "\"," + getGroupIndexFromChar(a.source.charName) + ")";
        ffd += ".spell(\"" + a.spell.spellId + "\")";
        
        if (a.spell.spellType == FFSim.SpellType.Damage) {
            ffd += ".charIsTarget()";
            ffd += ".dmg([" + a.dmg.join(",") + "])";
            ffd += ".dead([" + a.died.join(",") + "])";
        } else {
            ffd += ".target(\"" + (a.target[0] != null ? a.target[0].charName : "") + "\")";
            ffd += ".charIsTarget()";
        }
        return ffd;
    };
    
    var getGroupIndexFromChar = function(charName) {
        var charIndex = parseInt(charName.substr(charName.length - 1), 10);
        return (charIndex > 4 ? 1 : 0);
    }
    
    var log = function(msg) {
      if (FFSim.Output.isConsole) {
        console.log(msg);
      }
    };
    
    return {
        Result : Result
       ,isConsole : consoleOn
       ,isRound : roundOn
       ,isChars : charsOn
       ,log : log
    };
    
})();