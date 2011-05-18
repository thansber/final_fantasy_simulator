var Spell = (function() {
  
  var ALL = {};
  
  var TargetType = {
    Single:{
      apply : function(spell, caster, target) { 
        spell.applyToTarget(caster, target);   
      }
    }
   ,All:{
     apply : function(spell, caster, targets) {
       var spellTargets = [];
       if (!jQuery.isArray(targets)) {
         spellTargets = jQuery.makeArray(targets);
       } else {
         spellTargets = jQuery.merge([], targets);
       }
       jQuery(spellTargets).each(function() {
         if (!this.isDead()) {
           spell.applyToTarget(caster, this);
         }
       });
     }
   }
   ,Self:{
     apply : function(spell, caster) {
       spell.applyToTarget(caster, caster);
     }
   }
  };
  
  var TargetGroup = {Same:{}, Other:{}, None:{}};
  var SpellType = {
    HpRecovery : {
      targetGroup : TargetGroup.Same
     ,apply : function(spell, caster, target) {
        if (target.isDead()) {
          return;
        }
        var hpUp = RNG.randomUpTo(2 * spell.effectivity, spell.effectivity);
        hpUp = (hpUp > 255 ? 255 : hpUp);

        spell.result.dmg = hpUp;
        target.applyDamage(hpUp * -1);
      }
   }
   ,HpRecoveryFull : {
     targetGroup : TargetGroup.Same
    ,apply : function(spell, caster, target) {
       if (target.isDead()) {
         return;
       }
       target.hitPoints = target.maxHitPoints;
       for (var s in Status.AllExceptDead) {
         target.removeStatus(Status.AllExceptDead[s]);
       }
     }
   }
   ,Damage : {
     targetGroup : TargetGroup.Other
    ,apply : function(spell, caster, target) {
       var maxDmg = 2 * spell.effectivity;
       var minDmg = spell.effectivity;
       
       if (spell.element) {
         if (target.isProtectedFrom(spell.element)) {
           maxDmg = spell.effectivity; // halved
           minDmg = spell.effectivity * 0.5; // halved
         } else if (target.isWeakTo(spell.element)) {
           maxDmg = Math.floor(maxDmg * 1.5);
           minDmg = Math.floor(minDmg * 1.5);
         }
       }
       
       var dmg = RNG.randomUpTo(maxDmg, minDmg);
       var doubled = false;
       if (spellSuccess(spell, caster, target)) {
         dmg *= 2;
         doubled = true;
       }
       var dmgLog = "    dmg=" + dmg + (doubled ? " (DOUBLED)" : "") + " out of " + (doubled ? minDmg * 2 : minDmg) + "-" + (doubled ? maxDmg * 2 : maxDmg);

       Output.log(dmgLog);
       
       spell.result.dmg.push(dmg);
       target.applyDamage(dmg);
       spell.result.died.push(target.isDead());
     }
   }
   ,StatUp : {
     targetGroup : TargetGroup.Same
    ,apply : function(spell, caster, target) { target[spell.statChanged] += spell.effectivity; }
   }
   ,StatUpMulti : {
     targetGroup : TargetGroup.Same
    ,apply : function(spell, caster, target) {
       target[spell.statChanged.eff] += spell.effectivity;
       target[spell.statChanged.acc] += spell.accuracy;
     }
   }
   ,StatDown : {
     targetGroup:TargetGroup.Other
    ,apply : function(spell, caster, target) {
       var statChangeSuccess = spellSuccess(spell, caster, target);
       if (statChangeSuccess) {
         target[spell.statChanged] -= spell.effectivity;
       }
       spell.result.success.push(statChangeSuccess);
     }
   }
   ,AddStatus : {
     targetGroup : TargetGroup.Other
    ,apply : function(spell, caster, target) {
       var statusSuccess = spellSuccess(spell, caster, target);
       if (statusSuccess) {
         target.addStatus(spell.status);
       }
       spell.result.success.push(statusSuccess);
     }
   }
   ,AddStatus300Hp : {
     targetGroup : TargetGroup.Other
    ,apply : function(spell, caster, target) {
      var statusSuccess = false;
      if (target.hitPoints <= 300 && !target.isProtectedFrom(spell.element)) {
        target.addStatus(spell.status);
        statusSuccess = true;
      }
      spell.result.success.push(statusSuccess);
     }
   }
   ,RemoveStatus : {
     targetGroup : TargetGroup.Same
    ,apply : function(spell, caster, target) {
       var statusSuccess = target.hasStatus(spell.status);
       target.removeStatus(spell.status);
       spell.result.success.push(statusSuccess);
     }
   }
   ,ResistElement : {
     targetGroup : TargetGroup.Same
    ,apply : function(spell, caster, target) {
       var elementsResisted = [];
       if (jQuery.isArray(spell.element)) {
         jQuery.merge(elementsResisted, spell.element);
       } else {
         elementsResisted.push(spell.element);
       }
       
       jQuery(elementsResisted).each(function() { target.protectFrom(this); });
     }
   }
   ,WeakToElement : {
     targetGroup:TargetGroup.Other
    ,apply : function(spell, caster, target) {
       var elementsWeakTo = [];
       if (jQuery.isArray(spell.element)) {
         jQuery.merge(elementsWeakTo, spell.element);
       } else {
         elementsWeakTo.push(spell.element);
       }
       
       jQuery(elementsWeakTo).each(function() { target.weakTo(this, true); });
     }
   }
   ,HitMultiplierUp : {
     targetGroup : TargetGroup.Same
    ,apply : function(spell, caster, target) {
       target.hitMultiplier += parseInt(spell.hitMultiplierChange, 10);
       if (target.hitMultiplier > 2) {
         target.hitMultiplier = 2;
       }
     }
   } 
   ,HitMultiplierDown : {
     targetGroup:TargetGroup.Other
    ,apply : function(spell, caster, target) {
      var success = spellSuccess(spell, caster, target);
      if (success) {
        target.hitMultiplier += parseInt(spell.hitMultiplierChange, 10);
        if (target.hitMultiplier < 0) {
          target.hitMultiplier = 0;
        }
      }
      spell.result.success.push(success);
    }
   }
   ,MoraleDown : {
     targetGroup:TargetGroup.Other
    ,apply : function(spell, caster, target) { alert("This spell does not work yet [" + spell.spellId + "]"); }
   }
   ,NonBattle : {
     targetGroup:TargetGroup.None
    ,apply : function(spell, caster, target) { alert("This spell cannot be cast in battle [" + spell.spellId + "]"); }
   }
  };
  
  var spellSuccess = function(spell, caster, target) {
    var baseChance = 148;
    if (spell.element) {
      if (target.isProtectedFrom(spell.element)) {
        baseChance = 0;
      }
      if (target.isWeakTo(spell.element)) {
        baseChance += 40;
      }
    }
    
    var success = false; 
    var r = RNG.randomUpTo(Action.AUTO_MISS);
    var logMsg = caster.charName + " casting " + spell.spellId + " - ";
    
    if (r == Action.AUTO_HIT) {
      logMsg += "HIT-AUTO";
      success = true;
    } else if (r == Action.AUTO_MISS) {
      logMsg += ",MIS-AUTO";
      success = false;
    } else {
      success = (r <= baseChance + spell.accuracy - target.magicDef);
      logMsg += success ? "HIT" : "MISS";
    }

    logMsg += "=[to hit=" + (baseChance + spell.accuracy - target.magicDef) + "(" + baseChance + "+" + spell.accuracy + "-" + target.magicDef + ")" + ",rnd=" + r + "]";

    Output.log(logMsg);
      
    return success;
  };
  
  function Spell(level, spellId, targetType, type, stats, allowedClasses) {
    if (!targetType) { 
      alert("Invalid target type for spell [" + spellId + "]"); 
    }
    if (!type) { 
      alert("Invalid type for spell [" + spellId + "]"); 
    }
    stats = stats || {};
    this.spellLevel = level;
    this.spellId = spellId.toUpperCase();
    this.effectivity = stats.eff;
    this.accuracy = stats.acc;
    this.statChanged = stats.statChanged;
    this.element = stats.element;
    this.status = stats.status;
    this.isAlreadyApplied = stats.isAlreadyApplied; // function
    this.allowedClasses = jQuery.merge([], allowedClasses);
    this.spellType = type;
    this.targetType = targetType;
    this.hitMultiplierChange = stats.hitMultiplierChange;
    this.result = {};
    this.result.success = [];
    ALL[this.spellId] = this;
  };
  Spell.prototype.cast = function(source, target) { this.targetType.apply(this, source, target); }
  Spell.prototype.applyToTarget = function(caster, target) { this.spellType.apply(this, caster, target); };
  
  new Spell(1, "CURE", TargetType.Single, SpellType.HpRecovery, {eff:16, acc:0}, [CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  new Spell(1, "FOG" , TargetType.Single, SpellType.StatUp, {eff:8, acc:0, statChanged:"spellDef"}, [CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
//02 HARM     20       24       --     A-E   Damage Undead         100   WM
  new Spell(1, "RUSE", TargetType.Self,   SpellType.StatUp, {eff:80, acc:0, statChanged:"spellEvasion"}, [CharacterClass.KNIGHT, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  
  new Spell(1, "FIRE", TargetType.Single, SpellType.Damage, {eff:10, acc:24, element:Element.Fire}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(1, "LIT" , TargetType.Single, SpellType.Damage, {eff:10, acc:24, element:Element.Lightning}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(1, "LOCK", TargetType.Single, SpellType.StatDown, {eff:20, acc:64, statChanged:"spellEvasion"}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(1, "SLEP", TargetType.All,    SpellType.AddStatus, {eff:0, acc:24, element:Element.Status, status:Status.Asleep}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  
  new Spell(2, "ALIT", TargetType.All,    SpellType.ResistElement, {eff:0,acc:0, element:Element.Lightning}, [CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  new Spell(2, "INVS", TargetType.Single, SpellType.StatUp, {eff:40, acc:0, statChanged:"spellEvasion"}, [CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  new Spell(2, "LAMP", TargetType.Single, SpellType.RemoveStatus, {eff:0, acc:0, element:Element.Status, status:Status.Blind}, [CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  new Spell(2, "MUTE", TargetType.All,    SpellType.AddStatus, {eff:0, acc:64, status:Status.Silenced}, [CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  
  new Spell(2, "DARK", TargetType.All,    SpellType.AddStatus, {eff:0, acc:24, element:Element.Status, status:Status.Blind}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(2, "ICE" , TargetType.Single, SpellType.Damage, {eff:20, acc:24, element:Element.Ice}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(2, "SLOW", TargetType.All,    SpellType.HitMultiplierDown, {eff:0, acc:64, element:Element.Status, hitMultiplierChange:-1}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(2, "TMPR", TargetType.Single, SpellType.StatUp, {eff:14, acc:0, statChanged:"spellAttack", isAlreadyApplied:function() { return this.spellAttack > 0; }}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  
  new Spell(3, "AFIR", TargetType.All,    SpellType.ResistElement, {eff:0,acc:0, element:Element.Fire}, [CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  new Spell(3, "CUR2", TargetType.Single, SpellType.HpRecovery, {eff:33, acc:0}, [CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  new Spell(3, "HEAL", TargetType.All,    SpellType.HpRecovery, {eff:12, acc:0}, [CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  //12 HRM2     40       24       --     A-E   Damage Undead        1500   WM
  
  new Spell(3, "FIR2", TargetType.All,    SpellType.Damage, {eff:30, acc:24, element:Element.Fire}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(3, "HOLD", TargetType.Single, SpellType.AddStatus, {eff:0, acc:64, element:Element.Status, status:Status.Paralyzed}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(3, "LIT2", TargetType.All,    SpellType.Damage, {eff:30, acc:24, element:Element.Lightning}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(3, "LOK2", TargetType.All,    SpellType.StatDown, {eff:20, acc:40, statChanged:"spellEvasion"}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  
  new Spell(4, "AICE", TargetType.All,    SpellType.ResistElement, {eff:0,acc:0, element:Element.Ice}, [CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  new Spell(4, "AMUT", TargetType.Single, SpellType.RemoveStatus, {eff:0, acc:0, status:Status.Silenced}, [CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  new Spell(4, "FEAR", TargetType.All,    SpellType.MoraleDown, {eff:40, acc:24, element:Element.Status}, [CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  new Spell(4, "PURE", TargetType.Single, SpellType.RemoveStatus, {eff:0, acc:0, status:Status.Poisoned}, [CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  
  new Spell(4, "CONF", TargetType.All,    SpellType.AddStatus, {eff:0, acc:64, status:Status.Confused}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(4, "FAST", TargetType.Single, SpellType.HitMultiplierUp, {eff:0, acc:0, hitMultiplierChange:1, isAlreadyApplied: function() { return this.hitMultiplier > 1; }}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(4, "ICE2", TargetType.All,    SpellType.Damage, {eff:40, acc:24, element:Element.Ice}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(4, "SLP2", TargetType.Single, SpellType.AddStatus, {eff:0, acc:64, status:Status.Asleep}, [CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  
  new Spell(5, "CUR3", TargetType.Single, SpellType.HpRecovery, {eff:66, acc:0}, [CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  new Spell(5, "HEL2", TargetType.All,    SpellType.HpRecovery, {eff:24, acc:0}, [CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  //23 HRM3     60       24       --     A-E   Damage Undead        8000   WM
  new Spell(5, "LIFE", TargetType.Single, SpellType.NonBattle, {eff:0, acc:0}, [CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  
  new Spell(5, "BANE", TargetType.All,    SpellType.AddStatus, {eff:0, acc:40, element:Element.PoisonStone, status:Status.Dead}, [CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(5, "FIR3", TargetType.All,    SpellType.Damage, {eff:50, acc:24, element:Element.Fire}, [CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(5, "SLO2", TargetType.Single, SpellType.HitMultiplierDown, {eff:0, acc:64, hitMultiplierChange:-1}, [CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(5, "WARP", TargetType.Single, SpellType.NonBattle, {eff:0, acc:0}, [CharacterClass.RED_WIZARD, CharacterClass.BLACK_WIZARD]);
  
  new Spell(6, "EXIT", TargetType.Single, SpellType.NonBattle, {eff:0, acc:0}, [CharacterClass.RED_WIZARD, CharacterClass.WHITE_WIZARD]);
  new Spell(6, "FOG2", TargetType.All,    SpellType.StatUp, {eff:12, acc:0, statChanged:"spellDef"}, [CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  new Spell(6, "INV2", TargetType.All,    SpellType.StatUp, {eff:40, acc:0, statChanged:"spellEvasion"}, [CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  new Spell(6, "SOFT", TargetType.Single, SpellType.NonBattle, {eff:0, acc:0}, [CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  
  new Spell(6, "LIT3", TargetType.All,    SpellType.Damage, {eff:60, acc:24, element:Element.Lightning}, [CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(6, "QAKE", TargetType.All,    SpellType.AddStatus, {eff:0, acc:24, element:Element.Earth, status:Status.Dead}, [CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(6, "RUB" , TargetType.Single, SpellType.AddStatus, {eff:0, acc:24, element:Element.Death, status:Status.Dead}, [CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(6, "STUN", TargetType.Single, SpellType.AddStatus300Hp, {eff:0, acc:0, element:Element.Status, status:Status.Paralyzed}, [CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  
  new Spell(7, "ARUB", TargetType.All,    SpellType.ResistElement, {eff:0, acc:0, element:[Element.Earth, Element.Status, Element.Death]}, [CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  new Spell(7, "CUR4", TargetType.Single, SpellType.HpRecoveryFull, {eff:0, acc:0}, [CharacterClass.WHITE_WIZARD]);
  new Spell(7, "HEL3", TargetType.All,    SpellType.HpRecovery, {eff:48, acc:0}, [CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]);
  // 32 HRM4     80       48       --     A-E   Damage Undead       45000   WW
  
  new Spell(7, "BLND", TargetType.Single, SpellType.AddStatus300Hp, {eff:0, acc:0, element:Element.Status, status:Status.Blind}, [CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(7, "BRAK", TargetType.Single, SpellType.AddStatus, {eff:0, acc:64, element:Element.PoisonStone, status:Status.Petrified}, [CharacterClass.BLACK_WIZARD]);
  new Spell(7, "ICE3", TargetType.All,    SpellType.Damage, {eff:70, acc:24, element:Element.Ice}, [CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]);
  new Spell(7, "SABR", TargetType.Self,   SpellType.StatUpMulti, {eff:16, acc:40, statChanged:{eff:"spellAttack", acc:"spellHit"}}, [CharacterClass.BLACK_WIZARD]);
  
  new Spell(8, "FADE", TargetType.All,    SpellType.Damage, {eff:80, acc:107}, [CharacterClass.WHITE_WIZARD]);
  new Spell(8, "LIF2", TargetType.Single, SpellType.NonBattle, {eff:0, acc:0}, [CharacterClass.WHITE_WIZARD]);
  new Spell(8, "WALL", TargetType.Single, SpellType.ResistElement, {eff:0, acc:0, element:Element.AllElements}, [CharacterClass.WHITE_WIZARD]);
  new Spell(8, "XFER", TargetType.Single, SpellType.WeakToElement, {eff:0, acc:107, element:Element.AllElements}, [CharacterClass.WHITE_WIZARD]);
  
  new Spell(8, "NUKE", TargetType.All,    SpellType.Damage, {eff:100, acc:107}, [CharacterClass.BLACK_WIZARD]);
  new Spell(8, "STOP", TargetType.All,    SpellType.AddStatus, {eff:0, acc:48, element:Element.Time, status:Status.Paralyzed}, [CharacterClass.BLACK_WIZARD]);
  new Spell(8, "XXXX", TargetType.Single, SpellType.AddStatus, {eff:0, acc:0, element:Element.Death, status:Status.Dead}, [CharacterClass.BLACK_WIZARD]);
  new Spell(8, "ZAP!", TargetType.All,    SpellType.AddStatus, {eff:0, acc:32, element:Element.Time, status:Status.Dead}, [CharacterClass.BLACK_WIZARD]);
  
  return {
     ALL : ALL
    ,TargetType : TargetType
    ,TargetGroup : TargetGroup
    ,SpellType : SpellType
    
    ,lookup : function(spellId) { return ALL[spellId]; }
  };
})();