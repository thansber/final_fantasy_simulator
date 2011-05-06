FFSim.attack = function(source, target) {
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
    
    if (source.hasStatus(FFSim.Blind)) {
        baseChanceToHit -= 40;
    }

    if (target.hasStatus(FFSim.Blind)) {
        baseChanceToHit += 40;
    }

    // TODO: If target is weak to an attack BC += 40
    // For weapons targeting certain monster types

    
    // if target is asleep/paralyzed, ignore evasion
    var chanceToHit = baseChanceToHit + source.hitPercent();
    var hitPercentLog = baseChanceToHit + "+" + source.hitPercent();
    if (!target.hasStatus(FFSim.Asleep) && !target.hasStatus(FFSim.Paralyzed)) {
        chanceToHit -= target.evasion();
        hitPercentLog += "-" + target.evasion();
    }
    
    for (var i = 0; i < numHits; i++) {
        var r = FFSim.RNG.randomUpTo(FFSim.automaticMiss);
        if (r == FFSim.automaticHit) {
            hitSuccess = true;
            critSuccess = true;
        } else if (r == FFSim.automaticMiss) {
            hitSuccess = false;
            critSuccess = false;
        } else {
            hitSuccess = (r <= chanceToHit);
            critSuccess = (r <= source.critical());
        }
        
        if (FFSim.Output.isConsole) {
            console.log(
                "Hit attempt #" + (i + 1) + " - "
                + "rnd=" + r 
                + ",hit%=" + chanceToHit + "(" + hitPercentLog + ")"
                + ",success=" + hitSuccess
                + ",crit=" + critSuccess
            );
        }
        
        if (hitSuccess) {
            numConnectedHits++;
            
            var sourceAttack = source.attack();
            if (target.hasStatus(FFSim.Asleep) || target.hasStatus(FFSim.Paralyzed)) {
                sourceAttack *= 1.25;
            }
            var a = FFSim.RNG.randomUpTo(2 * sourceAttack, sourceAttack);
            var damage = a - target.defense();

            if (critSuccess) {
                anyHitCritical = true;
                damage += a;
            }
            damage = (damage <= 0 ? 1 : damage);
            totalDamage += damage;
            if (FFSim.Output.isConsole) {
                console.log("    dmg=" + damage + ",rnd=" + a + ",attack range=" + sourceAttack + "-" + (2 * sourceAttack) + ",defense=" + target.defense());
            }
        }
    }
    
    totalDamage = Math.floor(totalDamage);
    target.applyDamage(totalDamage);
    return jQuery.extend({}, baseResult, {hits:numConnectedHits, dmg:totalDamage, crit:anyHitCritical, died:target.isDead()});
};

FFSim.castSpell = function(source, spellId, target, opt) {
    
    if (source.isDead()) {
        return null;
    }
    
    opt = opt || {};
    var spell = jQuery.extend({}, FFSim.getSpell(spellId));
    var usingItem = (opt.item != null);
    
    if (!usingItem && !source.hasSpellCharge(spell.spellLevel)) {
        return null;
    }
    
    var targets = (!jQuery.isArray(target) ? jQuery.makeArray(target) : jQuery.merge([], target));
    var spellTargets = [];
    jQuery(targets).each(function() { 
        if (!this.isDead()) {
            spellTargets.push(this);
        }
    });
    FFSim.Output.log("Casting " + spellId + (usingItem ? "(using " + opt.item.name + ")" : "") + " on " + targets.length + " target(s), " + spellTargets.length " of which are valid");
    
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