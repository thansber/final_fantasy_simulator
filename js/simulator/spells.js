(function() {
    
    FFSim.SpellGroup = {
        Same : {}
       ,Other : {}
       ,None : {}
    };
    
    FFSim.SpellType = {
        HpRecovery : {targetGroup:FFSim.SpellGroup.Same}
       ,HpRecoveryFull : {targetGroup:FFSim.SpellGroup.Same}
       ,Damage : {targetGroup:FFSim.SpellGroup.Other}
       ,StatUp : {targetGroup:FFSim.SpellGroup.Same}
       ,StatDown : {targetGroup:FFSim.SpellGroup.Other}
       ,StatUpMulti : {targetGroup:FFSim.SpellGroup.Same}
       ,AddStatus : {targetGroup:FFSim.SpellGroup.Other}
       ,RemoveStatus : {targetGroup:FFSim.SpellGroup.Same}
       ,ResistElement : {targetGroup:FFSim.SpellGroup.Same}
       ,WeakToElement : {targetGroup:FFSim.SpellGroup.Other}
       ,HitMultiplierUp : {targetGroup:FFSim.SpellGroup.Same}
       ,HitMultiplierDown : {targetGroup:FFSim.SpellGroup.Other}
       ,MoraleDown : {targetGroup:FFSim.SpellGroup.Other}
       ,NonBattle : {targetGroup:FFSim.SpellGroup.None}
       ,AddStatus300Hp : {targetGroup:FFSim.SpellGroup.Other}
    };

    // The spell targets will handle applying the spell to all appropriate targets
    FFSim.SpellTarget = {
        Single : {}
       ,All : {}
       ,Self : {}
    };

    
    var spellSuccess = function(spell, target) {
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
        var r = FFSim.RNG.randomUpTo(FFSim.automaticMiss);
        var logMsg = "Cast " + spell.spellId + " - rnd=" + r + ",base=" + baseChance + ",acc=" + spell.accuracy + ",magDef=" + target.magicDef;
        
        if (r == FFSim.automaticHit) {
            logMsg += ",hit=true (auto)";
            success = true;
        } else if (r == FFSim.automaticMiss) {
            logMsg += ",hit=false (auto)";
            success = false;
        } else {
            success = (r <= baseChance + spell.accuracy - target.magicDef);
            logMsg += ",hit=" + success;
        }
        if (FFSim.Output.isConsole) {
            console.log(logMsg);
        }
        return success;
    };
    
    // How the spell is initially applied
    FFSim.Spell.prototype.cast = function(source, target) {
        this.targetType.apply(this, source, target);
    };
    
    // To do something to an individual target, let the spell type handle that
    FFSim.Spell.prototype.applyToTarget = function(caster, target) {
        this.spellType.apply(this, caster, target);
    };
    
    // ======================
    // SPELL TYPE DEFINITIONS
    // ======================
    FFSim.SpellType.HpRecovery.apply = function(spell, caster, target) {
        var hpUp = FFSim.RNG.randomUpTo(2 * spell.effectivity, spell.effectivity);
        hpUp = (hpUp > 255 ? 255 : hpUp);

        spell.result.dmg = hpUp;
        target.applyDamage(hpUp * -1);
    };

    FFSim.SpellType.HpRecoveryFull.apply = function(spell, caster, target) {
        target.hitPoints = target.maxHitPoints;
        for (var s in FFSim.AllStatuses) {
            target.removeStatus(FFSim.AllStatuses[s]);
        }
    };
    
    FFSim.SpellType.Damage.apply = function(spell, caster, target) {
        var dmg = FFSim.RNG.randomUpTo(2 * spell.effectivity, spell.effectivity);
        var resisted = false;
        if (!spellSuccess(spell, target)) {
          dmg = Math.floor(dmg * 0.5);
          resisted = true;
        }
        var dmgLog = "    dmg=" + dmg + (resisted ? " (resisted)" : "") + " out of " + spell.effectivity + "-" + (spell.effectivity * 2);

        if (FFSim.Output.isConsole) {
            console.log(dmgLog);
        }
        
        spell.result.dmg.push(dmg);
        target.applyDamage(dmg);
        spell.result.died.push(target.isDead());
    };
    
    FFSim.SpellType.StatUp.apply = function(spell, caster, target) {
        target[spell.statChanged] += spell.effectivity;
    };
    
    FFSim.SpellType.StatUpMulti.apply = function(spell, caster, target) {
        target[spell.statChanged.eff] += spell.effectivity;
        target[spell.statChanged.acc] += spell.accuracy;
    };
    
    FFSim.SpellType.StatDown.apply = function(spell, caster, target) {
        var statChangeSuccess = spellSuccess(spell, target);
        if (statChangeSuccess) {
            target[spell.statChanged] -= spell.effectivity;
        }
        spell.result.success.push(statChangeSuccess);
    };
    
    FFSim.SpellType.AddStatus.apply = function(spell, caster, target) {
        var statusSuccess = spellSuccess(spell, target);
        if (statusSuccess) {
            target.addStatus(spell.status);
        }
        spell.result.success.push(statusSuccess);
    };
    
    FFSim.SpellType.RemoveStatus.apply = function(spell, caster, target) {
        var statusSuccess = target.hasStatus(spell.status);
        target.removeStatus(spell.status);
        spell.result.success.push(statusSuccess);
    };
    
    FFSim.SpellType.ResistElement.apply = function(spell, caster, target) {
        var elementsResisted = [];
        if (jQuery.isArray(spell.element)) {
            jQuery.merge(elementsResisted, spell.element);
        } else {
            elementsResisted.push(spell.element);
        }
        
        jQuery(elementsResisted).each(function() { target.protectFrom(this); });
    };
    
    FFSim.SpellType.WeakToElement.apply = function(spell, caster, target) {
        var elementsWeakTo = [];
        if (jQuery.isArray(spell.element)) {
            jQuery.merge(elementsWeakTo, spell.element);
        } else {
            elementsWeakTo.push(spell.element);
        }
        
        jQuery(elementsWeakTo).each(function() { target.weakTo(this, true); });
    };
    
    FFSim.SpellType.HitMultiplierUp.apply = function(spell, caster, target) {
        target.hitMultiplier += parseInt(spell.hitMultiplierChange, 10);
        if (target.hitMultiplier > 2) {
            target.hitMultiplier = 2;
        }
    };
    
    FFSim.SpellType.HitMultiplierDown.apply = function(spell, caster, target) {
        var success = spellSuccess(spell, target);
        if (success) {
            target.hitMultiplier += parseInt(spell.hitMultiplierChange, 10);
            if (target.hitMultiplier < 0) {
                target.hitMultiplier = 0;
            }
        }
        spell.result.success.push(success);
    };
    
    FFSim.SpellType.AddStatus300Hp.apply = function(spell, caster, target) {
        var statusSuccess = false;
        if (target.hitPoints <= 300 && !target.isProtectedFrom(spell.element)) {
            target.addStatus(spell.status);
            statusSuccess = true;
        }
        spell.result.success.push(statusSuccess);
    };
    
    FFSim.SpellType.MoraleDown.apply = function(spell, caster, target) {
        alert("This spell does not work yet [" + spell.spellId + "]");
    };
    
    FFSim.SpellType.NonBattle.apply = function(spell, caster, target) {
        alert("This spell cannot be cast in battle [" + spell.spellId + "]");
    };
    
    // ========================
    // SPELL TARGET DEFINITIONS
    // ========================
    FFSim.SpellTarget.Single.apply = function(spell, caster, target) {
        spell.applyToTarget(caster, target);
    };
    FFSim.SpellTarget.All.apply = function(spell, caster, targets) {
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
    };
    FFSim.SpellTarget.Self.apply = function(spell, caster) {
        spell.applyToTarget(caster, caster);
    };

    new FFSim.Spell(1, "CURE", FFSim.SpellTarget.Single, FFSim.SpellType.HpRecovery, {eff:16, acc:0});
    // 02 HARM     20       24       --     A-E   Damage Undead         100   WM
    new FFSim.Spell(1, "FOG" , FFSim.SpellTarget.Single, FFSim.SpellType.StatUp, {eff:8, acc:0, statChanged:"spellDef"});
    new FFSim.Spell(1, "RUSE", FFSim.SpellTarget.Self,   FFSim.SpellType.StatUp, {eff:80, acc:0, statChanged:"spellEvasion"});
    new FFSim.Spell(1, "FIRE", FFSim.SpellTarget.Single, FFSim.SpellType.Damage, {eff:10, acc:24, element:FFSim.Fire});
    new FFSim.Spell(1, "SLEP", FFSim.SpellTarget.All,    FFSim.SpellType.AddStatus, {eff:0, acc:24, element:FFSim.Status, status:FFSim.Asleep});
    new FFSim.Spell(1, "LOCK", FFSim.SpellTarget.Single, FFSim.SpellType.StatDown, {eff:20, acc:64, statChanged:"spellEvasion"});
    new FFSim.Spell(1, "LIT" , FFSim.SpellTarget.Single, FFSim.SpellType.Damage, {eff:10, acc:24, element:FFSim.Lightning});
    new FFSim.Spell(2, "LAMP", FFSim.SpellTarget.Single, FFSim.SpellType.RemoveStatus, {eff:0, acc:0, element:FFSim.Status, status:FFSim.Blind});
    new FFSim.Spell(2, "MUTE", FFSim.SpellTarget.All,    FFSim.SpellType.AddStatus, {eff:0, acc:64, status:FFSim.Silenced});
    new FFSim.Spell(2, "ALIT", FFSim.SpellTarget.All,    FFSim.SpellType.ResistElement, {eff:0,acc:0, element:FFSim.Lightning});
    new FFSim.Spell(2, "INVS", FFSim.SpellTarget.Single, FFSim.SpellType.StatUp, {eff:40, acc:0, statChanged:"spellEvasion"});
    new FFSim.Spell(2, "ICE" , FFSim.SpellTarget.Single, FFSim.SpellType.Damage, {eff:20, acc:24, element:FFSim.Ice});
    new FFSim.Spell(2, "DARK", FFSim.SpellTarget.All,    FFSim.SpellType.AddStatus, {eff:0, acc:24, element:FFSim.Status, status:FFSim.Blind});
    new FFSim.Spell(2, "TMPR", FFSim.SpellTarget.Single, FFSim.SpellType.StatUp, {eff:14, acc:0, statChanged:"spellAttack", isAlreadyApplied:function() { return this.spellAttack > 0; }});
    new FFSim.Spell(2, "SLOW", FFSim.SpellTarget.All,    FFSim.SpellType.HitMultiplierDown, {eff:0, acc:64, element:FFSim.Status, hitMultiplierChange:-1});
    new FFSim.Spell(3, "CUR2", FFSim.SpellTarget.Single, FFSim.SpellType.HpRecovery, {eff:33, acc:0});
    // 12 HRM2     40       24       --     A-E   Damage Undead        1500   WM
    new FFSim.Spell(3, "AFIR", FFSim.SpellTarget.All,    FFSim.SpellType.ResistElement, {eff:0,acc:0, element:FFSim.Fire});
    new FFSim.Spell(3, "HEAL", FFSim.SpellTarget.All,    FFSim.SpellType.HpRecovery, {eff:12, acc:0});
    new FFSim.Spell(3, "FIR2", FFSim.SpellTarget.All,    FFSim.SpellType.Damage, {eff:30, acc:24, element:FFSim.Fire});
    new FFSim.Spell(3, "HOLD", FFSim.SpellTarget.Single, FFSim.SpellType.AddStatus, {eff:0, acc:64, element:FFSim.Status, status:FFSim.Paralyzed});
    new FFSim.Spell(3, "LIT2", FFSim.SpellTarget.All,    FFSim.SpellType.Damage, {eff:30, acc:24, element:FFSim.Lightning});
    new FFSim.Spell(3, "LOK2", FFSim.SpellTarget.All,    FFSim.SpellType.StatDown, {eff:20, acc:40, statChanged:"spellEvasion"});
    new FFSim.Spell(4, "PURE", FFSim.SpellTarget.Single, FFSim.SpellType.RemoveStatus, {eff:0, acc:0, status:FFSim.Poisoned});
    new FFSim.Spell(4, "FEAR", FFSim.SpellTarget.All,    FFSim.SpellType.MoraleDown, {eff:40, acc:24, element:FFSim.Status});
    new FFSim.Spell(4, "AICE", FFSim.SpellTarget.All,    FFSim.SpellType.ResistElement, {eff:0,acc:0, element:FFSim.Ice});
    new FFSim.Spell(4, "AMUT", FFSim.SpellTarget.Single, FFSim.SpellType.RemoveStatus, {eff:0, acc:0, status:FFSim.Silenced});
    new FFSim.Spell(4, "SLP2", FFSim.SpellTarget.Single, FFSim.SpellType.AddStatus, {eff:0, acc:64, status:FFSim.Asleep});
    new FFSim.Spell(4, "FAST", FFSim.SpellTarget.Single, FFSim.SpellType.HitMultiplierUp, {eff:0, acc:0, hitMultiplierChange:1, isAlreadyApplied: function() { return this.hitMultiplier > 1; }});
    new FFSim.Spell(4, "CONF", FFSim.SpellTarget.All,    FFSim.SpellType.AddStatus, {eff:0, acc:64, status:FFSim.Confused});
    new FFSim.Spell(4, "ICE2", FFSim.SpellTarget.All,    FFSim.SpellType.Damage, {eff:40, acc:24, element:FFSim.Ice});
    new FFSim.Spell(5, "CUR3", FFSim.SpellTarget.Single, FFSim.SpellType.HpRecovery, {eff:66, acc:0});
    new FFSim.Spell(5, "LIFE", FFSim.SpellTarget.Single, FFSim.SpellType.NonBattle, {eff:0, acc:0});
    // 23 HRM3     60       24       --     A-E   Damage Undead        8000   WM
    new FFSim.Spell(5, "HEL2", FFSim.SpellTarget.All,    FFSim.SpellType.HpRecovery, {eff:24, acc:0});
    new FFSim.Spell(5, "FIR3", FFSim.SpellTarget.All,    FFSim.SpellType.Damage, {eff:50, acc:24, element:FFSim.Fire});
    new FFSim.Spell(5, "BANE", FFSim.SpellTarget.All,    FFSim.SpellType.AddStatus, {eff:0, acc:40, element:FFSim.PoisonStone, status:FFSim.Dead});
    new FFSim.Spell(5, "WARP", FFSim.SpellTarget.Single, FFSim.SpellType.NonBattle, {eff:0, acc:0});
    new FFSim.Spell(5, "SLO2", FFSim.SpellTarget.Single, FFSim.SpellType.HitMultiplierDown, {eff:0, acc:64, hitMultiplierChange:-1});
    new FFSim.Spell(6, "SOFT", FFSim.SpellTarget.Single, FFSim.SpellType.NonBattle, {eff:0, acc:0});
    new FFSim.Spell(6, "EXIT", FFSim.SpellTarget.Single, FFSim.SpellType.NonBattle, {eff:0, acc:0});
    new FFSim.Spell(6, "FOG2", FFSim.SpellTarget.All,    FFSim.SpellType.StatUp, {eff:12, acc:0, statChanged:"spellDef"});
    new FFSim.Spell(6, "INV2", FFSim.SpellTarget.All,    FFSim.SpellType.StatUp, {eff:40, acc:0, statChanged:"spellEvasion"});
    new FFSim.Spell(6, "LIT3", FFSim.SpellTarget.All,    FFSim.SpellType.Damage, {eff:60, acc:24, element:FFSim.Lightning});
    new FFSim.Spell(6, "RUB" , FFSim.SpellTarget.Single, FFSim.SpellType.AddStatus, {eff:0, acc:24, element:FFSim.Death, status:FFSim.Dead});
    new FFSim.Spell(6, "QAKE", FFSim.SpellTarget.All,    FFSim.SpellType.AddStatus, {eff:0, acc:24, element:FFSim.Earth, status:FFSim.Dead});
    new FFSim.Spell(6, "STUN", FFSim.SpellTarget.Single, FFSim.SpellType.AddStatus300Hp, {eff:0, acc:0, element:FFSim.Status, status:FFSim.Paralyzed});
    new FFSim.Spell(7, "CUR4", FFSim.SpellTarget.Single, FFSim.SpellType.HpRecoveryFull, {eff:0, acc:0});
    // 32 HRM4     80       48       --     A-E   Damage Undead       45000   WW
    new FFSim.Spell(7, "ARUB", FFSim.SpellTarget.All,    FFSim.SpellType.ResistElement, {eff:0, acc:0, element:[FFSim.Earth, FFSim.Status, FFSim.Death]});
    new FFSim.Spell(7, "HEL3", FFSim.SpellTarget.All,    FFSim.SpellType.HpRecovery, {eff:48, acc:0});
    new FFSim.Spell(7, "ICE3", FFSim.SpellTarget.All,    FFSim.SpellType.Damage, {eff:70, acc:24, element:FFSim.Ice});
    new FFSim.Spell(7, "BRAK", FFSim.SpellTarget.Single, FFSim.SpellType.AddStatus, {eff:0, acc:64, element:FFSim.PoisonStone, status:FFSim.Petrified});
    new FFSim.Spell(7, "SABR", FFSim.SpellTarget.Self,   FFSim.SpellType.StatUpMulti, {eff:16, acc:40, statChanged:{eff:"spellAttack", acc:"spellHit"}});
    new FFSim.Spell(7, "BLND", FFSim.SpellTarget.Single, FFSim.SpellType.AddStatus300Hp, {eff:0, acc:0, element:FFSim.Status, status:FFSim.Blind});
    new FFSim.Spell(8, "LIF2", FFSim.SpellTarget.Single, FFSim.SpellType.NonBattle, {eff:0, acc:0});
    new FFSim.Spell(8, "FADE", FFSim.SpellTarget.All,    FFSim.SpellType.Damage, {eff:80, acc:107});
    new FFSim.Spell(8, "WALL", FFSim.SpellTarget.Single, FFSim.SpellType.ResistElement, {eff:0, acc:0, element:FFSim.AllElements});
    new FFSim.Spell(8, "XFER", FFSim.SpellTarget.Single, FFSim.SpellType.WeakToElement, {eff:0, acc:107, element:FFSim.AllElements});
    new FFSim.Spell(8, "NUKE", FFSim.SpellTarget.All,    FFSim.SpellType.Damage, {eff:100, acc:107});
    new FFSim.Spell(8, "STOP", FFSim.SpellTarget.All,    FFSim.SpellType.AddStatus, {eff:0, acc:48, element:FFSim.Time, status:FFSim.Paralyzed});
    new FFSim.Spell(8, "ZAP!", FFSim.SpellTarget.All,    FFSim.SpellType.AddStatus, {eff:0, acc:32, element:FFSim.Time, status:FFSim.Dead});
    new FFSim.Spell(8, "XXXX", FFSim.SpellTarget.Single, FFSim.SpellType.AddStatus, {eff:0, acc:0, element:FFSim.Death, status:FFSim.Dead});
})();