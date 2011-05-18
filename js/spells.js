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
  
  function Spell(opt) {
    var base = opt.base || {};
    var stats = opt.stats || {};
    var allowedClasses = opt.allowedClasses || [];
    
    this.spellLevel = base.level;
    this.spellId = base.name.toUpperCase();
    this.spellType = base.type;
    this.targetType = base.target;

    this.effectivity = stats.eff;
    this.accuracy = stats.acc;
    this.statChanged = stats.statChanged;
    this.element = stats.element;
    this.status = stats.status;
    this.hitMultiplierChange = stats.hitMultiplierChange;

    this.allowedClasses = jQuery.merge([],allowedClasses);
    
    this.isAlreadyApplied = opt.isAlreadyApplied; // function

    this.result = {};
    this.result.success = [];
    
    ALL[this.spellId] = this;
  };
  Spell.prototype.cast = function(source, target) { this.targetType.apply(this, source, target); }
  Spell.prototype.applyToTarget = function(caster, target) { this.spellType.apply(this, caster, target); };
  
  // --------------
  // Level 1 Spells
  // --------------
  new Spell({
    base:{name:"CURE", level:1, target:TargetType.Single, type:SpellType.HpRecovery}
   ,stats:{eff:16, acc:0}
   ,allowedClasses:[CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"FOG", level:1, target:TargetType.Single, type:SpellType.StatUp}
   ,stats:{eff:8, acc:0, statChanged:"spellDef"}
   ,allowedClasses:[CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"HARM", level:1, target:TargetType.All, type:SpellType.Damage}
   ,stats:{eff:20, acc:24}
   ,allowedClasses:[CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]
   // TODO: add some way to specofy it only affects Undead
   });
  new Spell({
    base:{name:"RUSE", level:1, target:TargetType.Self, type:SpellType.StatUp}
   ,stats:{eff:80, acc:0, statChanged:"spellEvasion"}
   ,allowedClasses:[CharacterClass.KNIGHT, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"FIRE", level:1, target:TargetType.Single, type:SpellType.Damage}
   ,stats:{eff:10, acc:24, element:Element.Fire}
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"LIT", level:1, target:TargetType.Single, type:SpellType.Damage}
   ,stats:{eff:10, acc:24, element:Element.Lightning}
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"LOCK", level:1, target:TargetType.Single, type:SpellType.StatDown}
   ,stats:{eff:20, acc:64, statChanged:"spellEvasion"}
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"SLEP", level:1, target:TargetType.All, type:SpellType.AddStatus}
   ,stats:{eff:0, acc:24, element:Element.Status, status:Status.Sleep}
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});

  // --------------
  // Level 2 Spells
  // --------------
  new Spell({
    base:{name:"ALIT", level:2, target:TargetType.All, type:SpellType.ResistElement}
   ,stats:{eff:0,acc:0, element:Element.Lightning},allowedClasses:[CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"INVS", level:2, target:TargetType.Single, type:SpellType.StatUp}
   ,stats:{eff:40, acc:0, statChanged:"spellEvasion"}
   ,allowedClasses:[CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"LAMP", level:2, target:TargetType.Single, type:SpellType.RemoveStatus}
   ,stats:{eff:0, acc:0, element:Element.Status, status:Status.Blind}
   ,allowedClasses:[CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"MUTE", level:2, target:TargetType.All, type:SpellType.AddStatus}
   ,stats:{eff:0, acc:64, status:Status.Mute}
   ,allowedClasses:[CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"DARK", level:2, target:TargetType.All, type:SpellType.AddStatus}
   ,stats:{eff:0, acc:24, element:Element.Status, status:Status.Blind}
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"ICE", level:2, target:TargetType.Single, type:SpellType.Damage}
   ,stats:{eff:20, acc:24, element:Element.Ice}
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"SLOW", level:2, target:TargetType.All, type:SpellType.HitMultiplierDown}
   ,stats:{eff:0, acc:64, element:Element.Status, hitMultiplierChange:-1}
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"TMPR", level:2, target:TargetType.Single, type:SpellType.StatUp}
   ,stats:{eff:14, acc:0, statChanged:"spellAttack"}
   ,isAlreadyApplied:function() { return this.spellAttack > 0; }
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});

  // --------------
  // Level 3 Spells
  // --------------
  new Spell({
    base:{name:"AFIR", level:3, target:TargetType.All, type:SpellType.ResistElement}
   ,stats:{eff:0,acc:0, element:Element.Fire}
   ,allowedClasses:[CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"CUR2", level:3, target:TargetType.Single, type:SpellType.HpRecovery}
   ,stats:{eff:33, acc:0}
   ,allowedClasses:[CharacterClass.KNIGHT, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"HEAL", level:3, target:TargetType.All, type:SpellType.HpRecovery}
   ,stats:{eff:12, acc:0}
   ,allowedClasses:[CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"HRM2", level:3, target:TargetType.All, type:SpellType.Damage}
   ,stats:{eff:40, acc:24}
   ,allowedClasses:[CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]
   // TODO: add some way to specify it only affects Undead
   });
  new Spell({
    base:{name:"FIR2", level:3, target:TargetType.All, type:SpellType.Damage}
   ,stats:{eff:30, acc:24, element:Element.Fire}
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"HOLD", level:3, target:TargetType.Single, type:SpellType.AddStatus}
   ,stats:{eff:0, acc:64, element:Element.Status, status:Status.Paralysis}
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"LIT2", level:3, target:TargetType.All, type:SpellType.Damage}
   ,stats:{eff:30, acc:24, element:Element.Lightning}
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"LOK2", level:3, target:TargetType.All, type:SpellType.StatDown}
   ,stats:{eff:20, acc:40, statChanged:"spellEvasion"}
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});

  // --------------
  // Level 4 Spells
  // --------------
  new Spell({
    base:{name:"AICE", level:4, target:TargetType.All, type:SpellType.ResistElement}
   ,stats:{eff:0,acc:0, element:Element.Ice}
   ,allowedClasses:[CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"AMUT", level:4, target:TargetType.Single, type:SpellType.RemoveStatus}
   ,stats:{eff:0, acc:0, status:Status.Mute}
   ,allowedClasses:[CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"FEAR", level:4, target:TargetType.All, type:SpellType.MoraleDown}
   ,stats:{eff:40, acc:24, element:Element.Status}
   ,allowedClasses:[CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"PURE", level:4, target:TargetType.Single, type:SpellType.RemoveStatus}
   ,stats:{eff:0, acc:0, status:Status.Poison}
   ,allowedClasses:[CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"CONF", level:4, target:TargetType.All, type:SpellType.AddStatus}
   ,stats:{eff:0, acc:64, status:Status.Confuse}
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"FAST", level:4, target:TargetType.Single, type:SpellType.HitMultiplierUp}
   ,stats:{eff:0, acc:0, hitMultiplierChange:1}
   ,isAlreadyApplied: function() { return this.hitMultiplier > 1; }
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"ICE2", level:4, target:TargetType.All, type:SpellType.Damage}
   ,stats:{eff:40, acc:24, element:Element.Ice}
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"SLP2", level:4, target:TargetType.Single, type:SpellType.AddStatus}
   ,stats:{eff:0, acc:64, status:Status.Sleep}
   ,allowedClasses:[CharacterClass.NINJA, CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});

  // --------------
  // Level 5 Spells
  // --------------
  new Spell({
    base:{name:"CUR3", level:5, target:TargetType.Single, type:SpellType.HpRecovery}
   ,stats:{eff:66, acc:0}
   ,allowedClasses:[CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"HEL2", level:5, target:TargetType.All, type:SpellType.HpRecovery}
   ,stats:{eff:24, acc:0}
   ,allowedClasses:[CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"HRM3", level:5, target:TargetType.All, type:SpellType.Damage}
   ,stats:{eff:60, acc:24}
   ,allowedClasses:[CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]
   // TODO: add some way to specify it only affects Undead
   });
  new Spell({
    base:{name:"LIFE", level:5, target:TargetType.Single, type:SpellType.NonBattle}
   ,stats:{eff:0, acc:0}
   ,allowedClasses:[CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"BANE", level:5, target:TargetType.All, type:SpellType.AddStatus}
   ,stats:{eff:0, acc:40, element:Element.PoisonStone, status:Status.Dead}
   ,allowedClasses:[CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"FIR3", level:5, target:TargetType.All, type:SpellType.Damage}
   ,stats:{eff:50, acc:24, element:Element.Fire}
   ,allowedClasses:[CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"SLO2", level:5, target:TargetType.Single, type:SpellType.HitMultiplierDown}
   ,stats:{eff:0, acc:64, hitMultiplierChange:-1}
   ,allowedClasses:[CharacterClass.RED_MAGE, CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"WARP", level:5, target:TargetType.Single, type:SpellType.NonBattle}
   ,stats:{eff:0, acc:0}
   ,allowedClasses:[CharacterClass.RED_WIZARD, CharacterClass.BLACK_WIZARD]});

  // --------------
  // Level 6 Spells
  // --------------
  new Spell({
    base:{name:"EXIT", level:6, target:TargetType.Single, type:SpellType.NonBattle}
   ,stats:{eff:0, acc:0}
   ,allowedClasses:[CharacterClass.RED_WIZARD, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"FOG2", level:6, target:TargetType.All, type:SpellType.StatUp}
   ,stats:{eff:12, acc:0, statChanged:"spellDef"}
   ,allowedClasses:[CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"INV2", level:6, target:TargetType.All, type:SpellType.StatUp}
   ,stats:{eff:40, acc:0, statChanged:"spellEvasion"}
   ,allowedClasses:[CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"SOFT", level:6, target:TargetType.Single, type:SpellType.NonBattle}
   ,stats:{eff:0, acc:0}
   ,allowedClasses:[CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({
    base:{name:"LIT3", level:6, target:TargetType.All, type:SpellType.Damage}
   ,stats:{eff:60, acc:24, element:Element.Lightning}
   ,allowedClasses:[CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"QAKE", level:6, target:TargetType.All, type:SpellType.AddStatus}
   ,stats:{eff:0, acc:24, element:Element.Earth, status:Status.Dead}
   ,allowedClasses:[CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"RUB", level:6, target:TargetType.Single, type:SpellType.AddStatus}
   ,stats:{eff:0, acc:24, element:Element.Death, status:Status.Dead}
   ,allowedClasses:[CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({
    base:{name:"STUN", level:6, target:TargetType.Single, type:SpellType.AddStatus300Hp}
   ,stats:{eff:0, acc:0, element:Element.Status, status:Status.Paralysis}
   ,allowedClasses:[CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});

  
  /*
  
  
  new Spell({base:{level:7, name:"ARUB", target:TargetType.All,    SpellType.ResistElement},stats:{eff:0, acc:0, element:[Element.Earth, Element.Status, Element.Death]},allowedClasses:[CharacterClass.RED_WIZARD, CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  new Spell({base:{level:7, name:"CUR4", target:TargetType.Single, type:SpellType.HpRecoveryFull},stats:{eff:0, acc:0},allowedClasses:[CharacterClass.WHITE_WIZARD]});
  new Spell({base:{level:7, name:"HEL3", target:TargetType.All,    SpellType.HpRecovery},stats:{eff:48, acc:0},allowedClasses:[CharacterClass.WHITE_MAGE, CharacterClass.WHITE_WIZARD]});
  // 32 HRM4     80       48       --     A-E   Damage Undead       45000   WW
  
  new Spell({base:{level:7, name:"BLND", target:TargetType.Single, type:SpellType.AddStatus300Hp},stats:{eff:0, acc:0, element:Element.Status, status:Status.Blind},allowedClasses:[CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({base:{level:7, name:"BRAK", target:TargetType.Single, type:SpellType.AddStatus},stats:{eff:0, acc:64, element:Element.PoisonStone, status:Status.Stone},allowedClasses:[CharacterClass.BLACK_WIZARD]});
  new Spell({base:{level:7, name:"ICE3", target:TargetType.All,    SpellType.Damage},stats:{eff:70, acc:24, element:Element.Ice},allowedClasses:[CharacterClass.RED_WIZARD, CharacterClass.BLACK_MAGE, CharacterClass.BLACK_WIZARD]});
  new Spell({base:{level:7, name:"SABR", target:TargetType.Self,   SpellType.StatUpMulti},stats:{eff:16, acc:40, statChanged:{eff:"spellAttack", acc:"spellHit"}},allowedClasses:[CharacterClass.BLACK_WIZARD]});
  
  new Spell({base:{level:8, name:"FADE", target:TargetType.All,    SpellType.Damage},stats:{eff:80, acc:107},allowedClasses:[CharacterClass.WHITE_WIZARD]});
  new Spell({base:{level:8, name:"LIF2", target:TargetType.Single, type:SpellType.NonBattle},stats:{eff:0, acc:0},allowedClasses:[CharacterClass.WHITE_WIZARD]});
  new Spell({base:{level:8, name:"WALL", target:TargetType.Single, type:SpellType.ResistElement},stats:{eff:0, acc:0, element:Element.AllElements},allowedClasses:[CharacterClass.WHITE_WIZARD]});
  new Spell({base:{level:8, name:"XFER", target:TargetType.Single, type:SpellType.WeakToElement},stats:{eff:0, acc:107, element:Element.AllElements},allowedClasses:[CharacterClass.WHITE_WIZARD]});
  
  new Spell({base:{level:8, name:"NUKE", target:TargetType.All,    SpellType.Damage},stats:{eff:100, acc:107},allowedClasses:[CharacterClass.BLACK_WIZARD]});
  new Spell({base:{level:8, name:"STOP", target:TargetType.All,    SpellType.AddStatus},stats:{eff:0, acc:48, element:Element.Time, status:Status.Paralysis},allowedClasses:[CharacterClass.BLACK_WIZARD]});
  new Spell({base:{level:8, name:"XXXX", target:TargetType.Single, type:SpellType.AddStatus},stats:{eff:0, acc:0, element:Element.Death, status:Status.Dead},allowedClasses:[CharacterClass.BLACK_WIZARD]});
  new Spell({base:{level:8, name:"ZAP!", target:TargetType.All,    SpellType.AddStatus},stats:{eff:0, acc:32, element:Element.Time, status:Status.Dead},allowedClasses:[CharacterClass.BLACK_WIZARD]});
  */
  return {
     ALL : ALL
    ,TargetType : TargetType
    ,TargetGroup : TargetGroup
    ,SpellType : SpellType
    
    ,lookup : function(spellId) { return ALL[spellId]; }
  };
})();