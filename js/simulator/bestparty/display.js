FFSim.simulateRound = function(round, battle, roundNum) {
    var $output = $("#output"), $ffdResults = $("#ffdResults");
    var out = $output.html(), ffd = $ffdResults.html();
    var ffdActionOk = false;
    var victory = false;
    var winnerGroup = "", winnerGroupIndex = -1;
    var group1 = battle.group1;
    var group2 = battle.group2;
    
    if (FFSim.Output.isConsole) {
        console.log("================== ROUND " + (roundNum ? roundNum + " " : "") + "OUTPUT ==================");
    }
    if (roundNum) {
        var roundHeader = "ROUND " + roundNum;
        if (roundNum == 1) {
            roundHeader += " - " + group1.name + " vs " + group2.name;
            out += FFSim.fill("=", roundHeader.length) + "\n";
        }
        
        out += roundHeader;
        out += "\n";
    }
    
    ffd += "    [\n";
    
    FFSim.randomizeRound(round);
    jQuery(round).each(function(i) {
        out += this.toString(); 
        if (this.ffd.length > 0) {
            ffd += "    " + (ffdActionOk ? "," : " ") + this.ffd + "\n";
            ffdActionOk = true;
        }
        if (FFSim.isGroupDead(group1.chars)) {
            victory = true;
            winnerGroup = group2.name;
            winnerGroupIndex = 1;
            return false;
        } else if (FFSim.isGroupDead(group2.chars)) {
            victory = true;    
            winnerGroup = group1.name;
            winnerGroupIndex = 0;
            return false;
        }
    });
    
    if (victory) {
        out += "\n" + winnerGroup + " Wins!\n\n";
        ffd += "    ,new FFDUtil.Victory().group(" + winnerGroupIndex + ").charIsTarget()\n    ]";
    } else {
        out += FFSim.displayGroupAfterRound(group1.chars);
        out += FFSim.displayGroupAfterRound(group2.chars);
        out += "\n\n";
        
        ffd += "    ],";
    }
    ffd += "\n";
    
    if (FFSim.Output.isRound) {
        $output.html(out);
    }
    $ffdResults.html(ffd);
    
    return {victory:victory, winner:winnerGroup};
};

FFSim.displayGroupAfterRound = function(group) {
    var out = "\n";
    for (var c in group) {
        var ch = group[c]; 
        if (!ch.isDead()) {
            out += ch.charName + " - " + ch.hitPoints + "/" + ch.maxHitPoints;
            out += ", remaining spell charges: " + ch.spellChargesToString();
            out += "\n"; 
        }
    }
    return out;
};

FFSim.isGroupDead = function(chars) {
    for (var c in chars) {
        if (!chars[c].isDead()) {
            return false;
        }
    }
    return true;
};

// fisherYates 
FFSim.randomizeRound = function(myArray) {
    var i = myArray.length;
    if ( i == 0 ) return false;
    while ( --i ) {
        var j = Math.floor( Math.random() * ( i + 1 ) );
        var tempi = myArray[i];
        var tempj = myArray[j];
        myArray[i] = tempj;
        myArray[j] = tempi;
    }
};

FFSim.buildScore = function(battle) {
    FFSim.buildScoreForGroup(battle.group1);
    FFSim.buildScoreForGroup(battle.group2);
};

FFSim.buildScoreForGroup = function(group) {
    var $score = $("#score");
    $("<p/>")
        .append($("<label/>").html(group.name + ": "))
        .append($("<span/>").attr("id", group.name).html("0"))
        .appendTo($score);
};

FFSim.incrementScore = function(groupName) {
    var $groupScore = $("#" + groupName);
    var currentScore = parseInt($groupScore.html(), 10);
    $groupScore.html(++currentScore);
};

FFSim.fill = function(ch, num) {
    var s = "";
    for (var i = 0; i < num; i++) {
        s += ch;
    }
    return s;
}

FFSim.displayCharNames = function(battle) {
    var c = "charNames:[";
    c += "[\"" + FFSim.convertCharNamesToFFD(battle.group1).join("\",\"") + "\"],";
    c += "[\"" + FFSim.convertCharNamesToFFD(battle.group2).join("\",\"") + "\"]";
    c += "],\n";
    return c;
};

FFSim.convertCharNamesToFFD = function(group) {
    var ca = [];
    for (var c in group.chars) {
        ca.push(group.chars[c].charName);
    };
    return ca;
};

FFSim.displayWeapons = function(battle) {
    var w = "weapons:[";
    w += "[\"" + FFSim.convertWeaponsToFFD(battle.group1).join("\",\"") + "\"],";
    w += "[\"" + FFSim.convertWeaponsToFFD(battle.group2).join("\",\"") + "\"]";
    w += "],\n";
    return w;
};

FFSim.convertWeaponsToFFD = function(group) {
    var wa = [];
    for (var c in group.chars) {
        var ffdWeapon = "";
        var charWeapon = group.chars[c].equippedWeapon;
        if (!charWeapon) {
            ffdWeapon = "punch";
        } else {
            ffdWeapon = FFSim.findFFDWeapon(charWeapon);
        }
        wa.push(ffdWeapon);
    }
    return wa;
};

FFSim.findFFDWeapon = function(weapon) {
    for (var w in FFDConstants.weapons) {
        if (FFDConstants.weapons[w].ffname == weapon.name) {
            return w;
        }
    }
    return null;
};

FFSim.displayFFDResults = function(result) {
    var r = "";
    r += result.ffdResults.join("\n ,");
    return r;
};

FFSim.displayChar = function(c, $container) {
    if (!FFSim.Output.isChars) {
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