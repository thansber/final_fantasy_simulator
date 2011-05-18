var Output = (function() {
    
  var consoleOn = true;
  var roundOn = true;
  var charsOn = true;
  
  function Result(actionToTake) {
    this.action = actionToTake;
  };
    
  Result.prototype.toString = function() {
    var a = this.action.apply();
    if (a == null) {
      return "";
    } 
    
    switch (a.type) {
      case "A":
        return this.attackToString(a) + "\r\n";
      case "S":
        return a.source.charName + ": Casts " + a.spell.spellId + this.spellToString(a) + "\r\n";
      case "I":
        return a.source.charName + ": Uses " + a.item.name + this.spellToString(a) + "\r\n";
      default:
        return "Invalid action type [" + a.type + "]";
    }
    
    return "";
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
    if (a.spell.spellType == Spell.SpellType.Damage) {
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
    
  var getGroupIndexFromChar = function(charName) {
    var charIndex = parseInt(charName.substr(charName.length - 1), 10);
    return (charIndex > 4 ? 1 : 0);
  }
    
  var displayChar = function(c, $container) {
    if (!Output.isChars) {
      return;
    }
    var $char = $("<div/>").addClass("char").appendTo($container);
    if (c.isDead()) {
      $char.addClass("dead");
    }
    $("<h1/>").html(c.charName).appendTo($char);
    $("<h1/>").addClass("hp").html(c.hitPoints + "/" + c.maxHitPoints).appendTo($char);
    $("<h2/>").addClass("charClass").html(c.currentClass.name).appendTo($char);
    
    var $stats = $("<div/>").addClass("stats").appendTo($char);
    $("<p/>").append($("<label/>").html("Str:")).append(c.strength).appendTo($stats);
    $("<p/>").append($("<label/>").html("Agi:")).append(c.agility).appendTo($stats);
    $("<p/>").append($("<label/>").html("Vit:")).append(c.vitality).appendTo($stats);
    $("<p/>").append($("<label/>").html("Int:")).append(c.intelligence).appendTo($stats);
    $("<p/>").append($("<label/>").html("Luck:")).append(c.luck).appendTo($stats);
    $("<p/>").append($("<label/>").html("MDef:")).append(c.magicDef).appendTo($stats);
    
    var $extraStats = $("<div/>").addClass("stats").addClass("extra").appendTo($char);
    $("<p/>").append($("<label/>").html("Atk:")).append(c.attack()).appendTo($extraStats);
    $("<p/>").append($("<label/>").html("Def:")).append(c.defense()).appendTo($extraStats);
    $("<p/>").append($("<label/>").html("Hit%:")).append(c.hitPercent()).appendTo($extraStats);
    $("<p/>").append($("<label/>").html("Crit%:")).append(c.critical()).appendTo($extraStats);
    $("<p/>").append($("<label/>").html("Eva:")).append(c.evasion()).appendTo($extraStats);
    $("<p/>").append($("<label/>").html("# hits:")).append(c.numHits()).appendTo($extraStats);
    
    var $spellCharges = $("<div/>").addClass("charges").appendTo($char);
    $("<p/>").append($("<label/>").html("Spell Charges: ")).append(c.spellChargesToString()).appendTo($spellCharges);
    
    var $weapons = $("<div/>").addClass("weapons").appendTo($char);
    $("<h2/>").html("Weapons").appendTo($weapons);
    if (c.equippedWeapon) {
      $("<p/>").append($("<label/>").html("E - ")).append(c.equippedWeapon.name).appendTo($weapons);
    }
    jQuery(c.weapons).each(function() {
      $("<p/>").append($("<label/>").html("&nbsp;")).append(this.name).appendTo($weapons);
    });
    
    var $armor = $("<div/>").addClass("armor").appendTo($char);
    $("<h2/>").html("Armor").appendTo($armor);
    jQuery(c.equippedArmor).each(function() {
      $("<p/>").append($("<label/>").html("E - ")).append(this.name).appendTo($armor);
    });
    jQuery(c.otherArmor).each(function() {
      $("<p/>").append($("<label/>").html("&nbsp;")).append(this.name).appendTo($armor);
    });
    
    $("<p/>").addClass("status").html("Statuses: " + c.statusesToString()).appendTo($char);
    $("<p/>").html("Elements protected from:").appendTo($char);
    $("<p/>").html(c.elementsProtectedFrom().join(", ")).appendTo($char);
  };
  
  var log = function(msg) {
    if (Output.isConsole) {
      console.log(msg);
    }
  };
    
  return {
    createResult : function(action) { return new Result(action); }
   ,isConsole : consoleOn
   ,isRound : roundOn
   ,isChars : charsOn
   ,log : log
   ,displayChar : displayChar
  };
})();