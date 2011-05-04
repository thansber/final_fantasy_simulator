FFSim.BetweenRounds = (function() {
    
    var charsToJson = function(battle) {
        var json = "";
        var allCharJson = [];
        for (var i in battle.allChars) {
            var c = battle.allChars[i];
            
            //var ffChar = new FFSim.Char().name(name).charClass(charClass);
            //ffChar.stats(stats).level(level).hp(hp).spellCharges(spellCharges);
            
            var charJson = "battle.allChars[" + i + "].applyChangesFromPrevRound({";
            charJson += "hp:" + c.hitPoints;
            charJson += ",hitMultiplier:" + c.hitMultiplier;
            charJson += ",spellDef:" + c.spellDef;
            charJson += ",spellAttack:" + c.spellAttack;
            charJson += ",spellEvasion:" + c.spellEvasion;
            charJson += ",spellHit:" + c.spellHit
            charJson += ",spellCharges:[" + c.charges.join(",") + "]";
            charJson += ",statuses:[\"" + c.getStatuses().join("\",\"") + "\"]";
            charJson += ",elementsProtectedFrom:[\"" + c.elementsProtectedFrom().join("\",\"") + "\"]";
            charJson += "});";
            allCharJson.push(charJson);
        }
        json += allCharJson.join("\n") + "\n";

        return json;
    };
    
    return {
        charsToJson : charsToJson
    };
})();