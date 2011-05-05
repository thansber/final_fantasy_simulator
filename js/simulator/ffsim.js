var FFSim = (function() {

    var allClasses = {};
    var allWeapons = {};
    var allArmor = {};
    var allSpells = {};
    
    var FIGHTER = "fighter";
    var KNIGHT = "knight";
    var THIEF = "thief";
    var NINJA = "ninja";
    var BLACKBELT = "blackbelt";
    var MASTER = "master";
    var RED_MAGE = "redmage";
    var RED_WIZARD = "redwizard";
    var WHITE_MAGE = "whitemage";
    var WHITE_WIZARD = "whitewizard";
    var BLACK_MAGE = "blackmage";
    var BLACK_WIZARD = "blackwizard";
    
    var Elements = {
        Fire : "fire"
       ,Ice : "ice"
       ,Lightning : "lit"
       ,Earth : "earth"
       ,Death : "death"
       ,Time : "time"
       ,PoisonStone : "poison/stone"
       ,Status : "status"
    };
    
    var Statuses = {
        Dead : "dead"
       ,Petrified : "stone"
       ,Poisoned : "poison"
       ,Blind : "blind"
       ,Paralyzed : "paralyzed"
       ,Asleep : "sleep"
       ,Silenced : "mute"
       ,Confused : "confuse"
    };
    
    function Char() {
        this.charName = "";
        this.charLevel = 1;
        this.hitPoints = 0;
        this.maxHitPoints = 0;
        this.strength = 0;
        this.agility = 0;
        this.vitality = 0;
        this.intelligence = 0;
        this.luck = 0;
        this.baseHit = 0;
        this.magicDef = 0;
        this.hitMultiplier = 1;  // can be manipulated by SLOW/FAST
        this.spellDef = 0; // can be manipulated by FOG/FOG2
        this.spellAttack = 0; // can be manipulated by TMPR/SABR
        this.spellEvasion = 0; // can be manipulated by RUSE/LOCK/LOK2/INVS/INV2
        this.spellHit = 0; // can be manipulated by SABR
        this.charges = [];
        this.currentClass = null;
        this.equippedWeapon = null;
        this.weapons = [];
        this.equippedArmor = [];
        this.otherArmor = [];
        this.resistedElements = {};
        this.weakElements = {};
        this.currentStatuses = {};
    };
    var setStats = function(currentChar, stats) {
        if (!stats) {
            return;
        }
        currentChar.strength = stats.str;
        currentChar.agility = stats.agi;
        currentChar.vitality = stats.vit;
        currentChar.intelligence = stats.int;
        currentChar.luck = stats.luck;
        currentChar.baseHit = stats.hit;
        currentChar.magicDef = stats.magicDef;
    };
    var equippedToString = function(a) {
        var s = "";
        jQuery(a).each(function(i) { s += (i > 0 ? "," : "") + this.name; });
        return s;
    };
    
    Char.prototype.name = function(n) { this.charName = n; return this; };
    Char.prototype.level = function(l) { this.charLevel = l; return this; };
    Char.prototype.hp = function(max, h) { this.maxHitPoints = max; this.hitPoints = (h == null ? this.maxHitPoints : h); return this; };
    Char.prototype.stats = function(s) { setStats(this, s); return this; };
    Char.prototype.spellCharges = function(c) { this.charges = c; };
    Char.prototype.charClass = function(c) { this.currentClass = allClasses[c]; return this; };
    Char.prototype.weapon = function(w, equipped) {
        if (equipped) {
            if (this.equippedWeapon) {
                alert("A character can only equip at most 1 weapon, change the 2nd parameter for weapon " + w + " to false");
                this.weapons.push(allWeapons[w]); 
                return this;
            }
            this.equippedWeapon = allWeapons[w];
        } else {
            this.weapons.push(allWeapons[w]); 
        }
        return this; 
    };
    Char.prototype.armor = function(a, equipped) {
        var armor = allArmor[a];
        if (equipped) { 
            this.equippedArmor.push(armor);
            for (var e in armor.element) {
                this.resistedElements[armor.element[e]] = true;
            }
        } else {
            this.otherArmor.push(armor);  
        }
        return this;
    };
    Char.prototype.attack = function() { return this.currentClass.attack(this); };
    Char.prototype.defense = function() { return this.currentClass.defense(this); };
    Char.prototype.hitPercent = function() { return this.currentClass.hitPercent(this); };
    Char.prototype.evasion = function() { return this.currentClass.evasion(this); };
    Char.prototype.numHits = function() { return this.currentClass.numHits(this); };
    Char.prototype.critical = function() { return this.currentClass.critical(this); };
    Char.prototype.armorWeight = function() {
        var totalWeight = 0;
        jQuery(this.equippedArmor).each(function() { totalWeight += this.weight; });
        return totalWeight;
    };
    Char.prototype.applyDamage = function(dmg) {
        this.hitPoints -= dmg;
        if (this.hitPoints <= 0) {
            this.addStatus(FFSim.Dead);
        } else if (this.hitPoints > this.maxHitPoints) {
            this.hitPoints = this.maxHitPoints;
        }
    };
    Char.prototype.addStatus = function(status) { 
        if (status == Statuses.Dead) {
            this.hitPoints = 0;
            for (var s in this.currentStatuses) {
                this.currentStatuses[s] = false;
            }
        }
        this.currentStatuses[status] = true;
        return this; 
    };
    Char.prototype.getStatuses = function() {
        var allStatuses = [];
        for (var s in this.currentStatuses) {
            if (this.currentStatuses[s]) {
                allStatuses.push(s);
            }
        }
        return allStatuses;
    };
    Char.prototype.statusesToString = function() { return (this.getStatuses().length == 0 ? "[none]" : this.getStatuses().join(",")); };
    Char.prototype.hasStatus = function(status) { return this.currentStatuses[status]; };
    Char.prototype.isDead = function() { var d = this.hasStatus(Statuses.Dead); return (d == null ? false : d); };
    Char.prototype.removeStatus = function(status) { this.currentStatuses[status] = false; };
    Char.prototype.protectFrom = function(element) { this.resistedElements[element] = true; };
    Char.prototype.isProtectedFrom = function(element) { return this.resistedElements[element]; };
    Char.prototype.elementsProtectedFrom = function() { 
        var protectedFrom = [];
        for (var e in this.resistedElements) {
            if (this.resistedElements[e]) {
                protectedFrom.push(e);
            }
        }
        return protectedFrom;
    };
    Char.prototype.weakTo = function(element, removeResistance) { 
        this.weakElements[element] = true; 
        if (removeResistance) {
            this.resistedElements[element] = false;
        }
    };
    Char.prototype.isWeakTo = function(element) { return this.weakElements[element]; };
    Char.prototype.useSpellCharge = function(spellLevel) {
        if (this.hasSpellCharge(spellLevel)) {
            this.charges[spellLevel - 1]--;
        }
    };
    Char.prototype.hasSpellCharge = function(spellLevel) { return (this.charges[spellLevel - 1] && this.charges[spellLevel - 1] > 0); };
    Char.prototype.applyChangesFromPrevRound = function(changes) {
        this.hitPoints = changes.hp;
        this.hitMultiplier = changes.hitMultiplier;
        this.spellDef = changes.spellDef; 
        this.spellAttack = changes.spellAttack; 
        this.spellEvasion = changes.spellEvasion;
        this.spellHit = changes.spellHit;
        this.spellCharges(changes.spellCharges);
        
        for (var s in changes.statuses) {
            this.currentStatuses[changes.statuses[s]] = true;
        }
        for (var e in changes.elementsProtectedFrom) {
            this.resistedElements[changes.elementsProtectedFrom[e]] = true;
        }
    };
    Char.prototype.toString = function() {
        var s = "";
        s += this.charName + " - " + this.currentClass.name + ", ";
        s += this.hitPoints + "/" + this.maxHitPoints + " HP\n";
        s += "Str:" + this.strength + ",";
        s += "Agi:" + this.agility + ",";
        s += "Vit:" + this.vitality + ",";
        s += "Int:" + this.intelligence + ",";
        s += "Luck:" + this.luck + ",";
        s += "Hit%:" + this.baseHit + ",";
        s += "MagicDef:" + this.magicDef + "\n";
        s += "Spell Charges:" + this.spellChargesToString() + "\n";
        s += "Equipped weapon: " + (this.equippedWeapon ? this.equippedWeapon.name : "none") + "\n";
        s += "Equipped armor: " + (this.equippedArmor.length > 0 ? equippedToString(this.equippedArmor) : "none") + "\n";
        s += "Other weapons: " + (this.weapons.length > 0 ? equippedToString(this.weapons) : "none") + ", ";
        s += "Other armor: " + (this.otherArmor.length > 0 ? equippedToString(this.otherArmor) : "none") + "\n";
        s += "Elements protected from: " + this.elementsProtectedFrom().join(", ") + "\n"
        s += "Attack:" + this.attack() + ", ";
        s += "Defense:" + this.defense() + ", ";
        s += "Hit%:" + this.hitPercent() + ", ";
        s += "Evasion:" + this.evasion() + ", ";
        s += "# hits:" + this.numHits() + ", ";
        s += "Critical%:" + this.critical();
        return s;
    };
    Char.prototype.spellChargesToString = function() {
        var c = "";
        if (this.charges.length == 0) { return "None"; }
        jQuery(this.charges).each(function(i) { c += (i > 0 ? "/" : "") + this; });
        return c;
    };

    // ==============================================================
    // CHARACTER CLASS ----------------------------------------------
    // ==============================================================
    function CharClass(name) { this.name = name; allClasses[this.name] = this; };
    CharClass.prototype.attack = function(char) { return Math.floor(char.spellAttack + (char.equippedWeapon ? char.equippedWeapon.attack : 0) + (char.strength / 2)); };
    CharClass.prototype.defense = function(char) { 
        var d = char.spellDef;
        jQuery(char.equippedArmor).each(function() { d += this.defense; }); 
        return d;
    };
    CharClass.prototype.hitPercent = function(char) { return (char.baseHit + char.spellHit + (char.equippedWeapon == null ? 0 : char.equippedWeapon.hitPercent)); };
    CharClass.prototype.evasion = function(char) { 
        var e = char.spellEvasion + (48 + char.agility - char.armorWeight()); 
        return (e < 0 ? 0 : e); };
    CharClass.prototype.numHits = function(char) { 
        var h = Math.floor((char.currentClass.hitPercent(char) - char.spellHit) / 32);
        h += 1;
        h *= char.hitMultiplier;
        return (h <= 0 ? 1 : h);
    };
    CharClass.prototype.critical = function(char) { return (char.equippedWeapon == null ? 0 : char.equippedWeapon.criticalPercent); };
    
    function FighterClass() {}; FighterClass.prototype = new CharClass(FIGHTER);
    function KnightClass() {}; KnightClass.prototype = new CharClass(KNIGHT);
    function BlackBeltClass() {}; BlackBeltClass.prototype = new CharClass(BLACKBELT);
    BlackBeltClass.prototype.attack = function(char) { return Math.floor(char.spellAttack + (char.equippedWeapon ? char.equippedWeapon.attack + (char.strength / 2) + 1 : (char.charLevel * 2))); };
    BlackBeltClass.prototype.defense = function(char) { 
        if (char.equippedArmor.length == 0) {
            return char.charLevel + char.spellDef;
        }
        var d = char.spellDef;
        jQuery(char.equippedArmor).each(function() { d += this.defense; }); 
        return d;
    };
    BlackBeltClass.prototype.numHits = function(char) { 
        var h = Math.floor(char.currentClass.hitPercent(char) / 32);
        h += 1;
        h *= char.hitMultiplier;
        h *= 2;
        return (h <= 0 ? 1 : h);
    };
    BlackBeltClass.prototype.critical = function(char) { return (char.equippedWeapon == null ? char.charLevel * 2 : char.equippedWeapon.criticalPercent); };

    function MasterClass() { this.name = MASTER; allClasses[this.name] = this; }; MasterClass.prototype = new BlackBeltClass();
    function ThiefClass() {}; ThiefClass.prototype = new CharClass(THIEF);
    function NinjaClass() {}; NinjaClass.prototype = new CharClass(NINJA);
    function RedMageClass() {}; RedMageClass.prototype = new CharClass(RED_MAGE);
    function RedWizardClass() {}; RedWizardClass.prototype = new CharClass(RED_WIZARD);
    function WhiteMageClass() {}; WhiteMageClass.prototype = new CharClass(WHITE_MAGE);
    function WhiteWizardClass() {}; WhiteWizardClass.prototype = new CharClass(WHITE_WIZARD);
    function BlackMageClass() {}; BlackMageClass.prototype = new CharClass(BLACK_MAGE);
    BlackMageClass.prototype.attack = function(char) { return Math.floor(char.spellAttack + (char.equippedWeapon ? char.equippedWeapon.attack : 0) + (char.strength / 2) + 1); };    
    function BlackWizardClass() { this.name = BLACK_WIZARD; allClasses[this.name] = this; }; BlackWizardClass.prototype = new BlackMageClass();
    
    new FighterClass();
    new KnightClass();
    new BlackBeltClass();
    new MasterClass();
    new ThiefClass();
    new NinjaClass();
    new RedMageClass();
    new RedWizardClass();
    new WhiteMageClass();
    new WhiteWizardClass();
    new BlackMageClass();
    new BlackWizardClass();
    
    var getCharClass = function(id) { return allClasses[id]; };
    
    // ==============================================================
    // WEAPON -------------------------------------------------------
    // ==============================================================
    function Weapon(name,stats,special) {
        this.name = name;
        this.attack = stats.attack;
        this.hitPercent = stats.hit;
        this.criticalPercent = stats.crit;
        this.weaponIndex = stats.index;
        if (special) {
            this.spell = special.spell;
        }
        this.hasSpell = (this.spell != null);
        allWeapons[name] = this;
    };
    
    var getWeapon = function(weaponId) { return allWeapons[weaponId]; };
    
    // ==============================================================
    // ARMOR --------------------------------------------------------
    // ==============================================================
    function Armor(name,stats,extra) {
        this.name = name;
        this.defense = stats.def;
        this.weight = stats.weight;
        this.element = [];
        if (extra) {
            if (jQuery.isArray(extra.element)) {
                jQuery.merge(this.element, extra.element);
            } else {
                this.element.push(extra.element);
            }
        }
        allArmor[name] = this;
    };
    
    var getArmor = function(armorId) { return allArmor[armorId]; };
    
    // ==============================================================
    // SPELL --------------------------------------------------------
    // ==============================================================
    function Spell(level, spellId, targetType, type, stats) {
        if (!targetType) { alert("Invalid target type for spell [" + spellId + "]"); }
        if (!type) { alert("Invalid type for spell [" + spellId + "]"); }
        this.spellLevel = level;
        this.spellId = spellId.toUpperCase();
        this.effectivity = stats.eff;
        this.accuracy = stats.acc;
        this.statChanged = stats.statChanged;
        this.element = stats.element;
        this.status = stats.status;
        this.isAlreadyApplied = stats.isAlreadyApplied; // function
        this.spellType = type;
        this.targetType = targetType;
        this.hitMultiplierChange = stats.hitMultiplierChange;
        this.result = {};
        this.result.success = [];
        allSpells[this.spellId] = this;
    };
    
    var getSpell = function(spellId) { return allSpells[spellId]; };
    
    return {
        Char : Char
       ,Weapon : Weapon
       ,Armor : Armor
       ,Spell : Spell
       
       ,automaticHit : 1
       ,automaticMiss : 201
       
       ,FIGHTER : FIGHTER
       ,KNIGHT : KNIGHT
       ,THIEF : THIEF
       ,NINJA : NINJA
       ,BLACKBELT : BLACKBELT
       ,MASTER : MASTER
       ,RED_MAGE : RED_MAGE 
       ,RED_WIZARD : RED_WIZARD 
       ,WHITE_MAGE : WHITE_MAGE 
       ,WHITE_WIZARD : WHITE_WIZARD 
       ,BLACK_MAGE : BLACK_MAGE 
       ,BLACK_WIZARD : BLACK_WIZARD
       
       ,Fire : Elements.Fire
       ,Ice : Elements.Ice
       ,Lightning : Elements.Lightning
       ,Earth : Elements.Earth
       ,Death : Elements.Death
       ,Time : Elements.Time
       ,PoisonStone : Elements.PoisonStone
       ,Status : Elements.Status
       ,AllElements : [Elements.Fire, Elements.Ice, Elements.Lightning, Elements.Earth, Elements.Death, Elements.Time, Elements.PoisonStone, Elements.Status]
                       
       ,Dead : Statuses.Dead
       ,Petrified : Statuses.Petrified
       ,Poisoned : Statuses.Poisoned
       ,Blind : Statuses.Blind
       ,Paralyzed : Statuses.Paralyzed 
       ,Asleep : Statuses.Asleep 
       ,Silenced : Statuses.Silenced
       ,Confused : Statuses.Confused
       ,AllStatuses : [Statuses.Dead, Statuses.Petrified, Statuses.Poisoned, Statuses.Blind, Statuses.Paralyzed, Statuses.Asleep, Statuses.Silenced, Statuses.Confused]
                       
       ,getCharClass : getCharClass 
       ,getSpell : getSpell
       ,getWeapon : getWeapon
       ,getArmor : getArmor
       
       ,allWeapons : allWeapons
       
       ,RNG : FFD_RNG
    };
    
})();