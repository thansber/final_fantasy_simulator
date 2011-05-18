var Action = (function() {
  
  var AUTO_HIT = 1;
  var AUTO_MISS = 201;
  
  var attack = function(source, target) {
    
    var baseChanceToHit = 168;
    var numHits = source.numHits();
    var numConnectedHits = 0;
    var hitSuccess = false;
    var critSuccess = false;
    var anyHitCritical = false;
    var totalDamage = 0;
    
    var baseResult = {type:"A", source:source, target:target};
    
    if (source.isDead()) {
      return null;
    }
    
    if (target.isDead()) {
      return jQuery.extend({}, baseResult, {wasDead:true});
    }

    // TODO: If source is dead/stoned/paralyzed/asleep don't do anything, check for status cure
    
    if (source.hasStatus(Status.Blind)) {
      baseChanceToHit -= 40;
    }

    if (target.hasStatus(Status.Blind)) {
      baseChanceToHit += 40;
    }

    // TODO: If target is weak to an attack BC += 40
    // For weapons targeting certain monster types

    
    // if target is asleep/paralyzed, ignore evasion
    var chanceToHit = baseChanceToHit + source.hitPercent();
    var hitPercentLog = baseChanceToHit + "+" + source.hitPercent();
    if (!target.hasStatus(Status.Asleep) && !target.hasStatus(Status.Paralyzed)) {
      chanceToHit -= target.evasion();
      hitPercentLog += "-" + target.evasion();
    }
    
    for (var i = 0; i < numHits; i++) {
      var attackLog = "";
      var r = RNG.randomUpTo(AUTO_MISS);
      if (r == AUTO_HIT) {
        hitSuccess = true;
        critSuccess = true;
      } else if (r == AUTO_MISS) {
        hitSuccess = false;
        critSuccess = false;
      } else {
        hitSuccess = (r <= chanceToHit);
        critSuccess = (r <= source.critical());
      }
      
      attackLog = source.charName + " attack #" + (i + 1) + " - "
        + (hitSuccess ? (critSuccess ? "CRITICAL " : "") + "HIT" : "MISS")
        + "=[hit%=" + chanceToHit + "(" + hitPercentLog + ")"
        + ",rnd=" + r + "]";
        
      if (hitSuccess) {
        numConnectedHits++;
        
        var sourceAttack = source.attack();
        if (target.hasStatus(Status.Asleep) || target.hasStatus(Status.Paralyzed)) {
          sourceAttack *= 1.25;
        }
        var a = RNG.randomUpTo(2 * sourceAttack, sourceAttack);
        var damage = a - target.defense();

        if (critSuccess) {
          anyHitCritical = true;
          damage += a;
        }
        damage = (damage <= 0 ? 1 : damage);
        totalDamage += damage;
        
        attackLog += " DMG=[" + damage + "(" + a + "-" + target.defense() + "),rnd=" + a + ",dmg range=" + sourceAttack + "-" + (2 * sourceAttack) + ",def=" + target.defense() + "]";
      }
      
      Output.log(attackLog);
    }
    
    totalDamage = Math.floor(totalDamage);
    target.applyDamage(totalDamage);
    return jQuery.extend({}, baseResult, {hits:numConnectedHits, dmg:totalDamage, crit:anyHitCritical, died:target.isDead()});
  };
  
  var castSpell = function(source, spellId, target, opt) {
    
    if (source.isDead()) {
      return null;
    }
    
    opt = opt || {};
    var spell = jQuery.extend({}, Spell.lookup(spellId));
    var usingItem = (opt.item != null);
    
    if (!usingItem && !source.canCastSpell(spell)) {
      return null;
    }
    
    var targets = (!jQuery.isArray(target) ? jQuery.makeArray(target) : jQuery.merge([], target));
    var spellTargets = [];
    jQuery(targets).each(function() { 
      if (!this.isDead()) {
        spellTargets.push(this);
      }
    });
    
    Output.log("Casting " + spellId + (usingItem ? "(using " + opt.item.name + ")" : "") + " on " + targets.length + " target(s), " + spellTargets.length + " of which are valid");
    
    if (!usingItem) {
      source.useSpellCharge(spell.spellLevel);
    }
    // Anything that gets set on the spell.result needs to be reset here, otherwise
    // previous data gets carried over
    spell.result.dmg = [];
    spell.result.died = [];
    spell.result.ineffective = false;
    spell.cast(source, target);
    
    // Spell was cast on a single dead person
    if (spellTargets.length == 0 && target != null) {
      spellTargets.push(target);
      spell.result.ineffective = true;
    }
    
    var spellAction = jQuery.extend({type:"S", source:source, target:spellTargets, spell:spell, dmg:0}, spell.result);
    if (usingItem) {
      spellAction.type = "I";
      spellAction.item = opt.item;
    }
    return spellAction; 
  };
  
  return {
    attack : attack
   ,castSpell : castSpell
   
   ,AUTO_HIT : AUTO_HIT
   ,AUTO_MISS : AUTO_MISS
  };
})();