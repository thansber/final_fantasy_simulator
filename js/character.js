var Character = (function() {

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
    
  // ----------------------------------
  // SETTER methods - supports chaining 
  // ----------------------------------
  Char.prototype.name = function(n) { 
    this.charName = n; 
    return this; 
  };
  
  Char.prototype.level = function(l) { 
    this.charLevel = l; 
    return this; 
  };
  
  Char.prototype.hp = function(max, h) { 
    this.maxHitPoints = max; 
    this.hitPoints = (h == null ? this.maxHitPoints : h); 
    return this; 
  };
  
  Char.prototype.stats = function(s) { 
    setStats(this, s); 
    return this; 
  };
  
  Char.prototype.spellCharges = function(c) { 
    this.charges = c;
    return this;
  };
  
  Char.prototype.charClass = function(c) { 
    this.currentClass = CharacterClass.lookup(c); 
    return this; 
  };

  Char.prototype.weapon = function(w, equipped) {
    var weapon = Equipment.Weapon.lookup(w);
    if (equipped) {
      if (this.equippedWeapon) {
        alert("A character can only equip at most 1 weapon, change the 2nd parameter for weapon " + w + " to false");
        this.weapons.push(weapon); 
        return this;
      }
      this.equippedWeapon = weapon;
    } else {
      this.weapons.push(weapon); 
    }
    return this; 
  };
  
  Char.prototype.armor = function(a, equipped) {
    var armor = Equipment.Armor.lookup(a);
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
  
  // --------------
  // GETTER methods
  // --------------
  Char.prototype.attack = function() { 
    return this.currentClass.attack(this); 
  };
  
  Char.prototype.defense = function() { 
    return this.currentClass.defense(this); 
  };
  
  Char.prototype.hitPercent = function() { 
    return this.currentClass.hitPercent(this); 
  };
  
  Char.prototype.evasion = function() { 
    return this.currentClass.evasion(this); 
  };
  
  Char.prototype.numHits = function() { 
    return this.currentClass.numHits(this); 
  };
  
  Char.prototype.critical = function() { 
    return this.currentClass.critical(this); 
  };
  
  Char.prototype.armorWeight = function() {
    var totalWeight = 0;
    jQuery(this.equippedArmor).each(function() { 
      totalWeight += this.weight; 
    });
    return totalWeight;
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
  
  Char.prototype.hasStatus = function(status) { 
    return this.currentStatuses[status]; 
  };
  
  Char.prototype.isDead = function() { 
    var d = this.hasStatus(Status.Dead); 
    return (d == null ? false : d); 
  };
  
  Char.prototype.isProtectedFrom = function(element) { 
    return this.resistedElements[element]; 
  };
  
  Char.prototype.elementsProtectedFrom = function() { 
    var protectedFrom = [];
    for (var e in this.resistedElements) {
      if (this.resistedElements[e]) {
        protectedFrom.push(e);
      }
    }
    return protectedFrom;
  };
  
  Char.prototype.isWeakTo = function(element) { 
    return this.weakElements[element]; 
  };
  
  Char.prototype.canCastSpell = function(spell) {
    var hasCharge = this.hasSpellCharge(spell.spellLevel);
    var allowedToCast = (jQuery.inArray(this.currentClass.name, spell.allowedClasses) > -1);
    return hasCharge && allowedToCast; 
  };
  
  Char.prototype.hasSpellCharge = function(spellLevel) { 
    return (this.charges[spellLevel - 1] != null && this.charges[spellLevel - 1] > 0); 
  };
  
  Char.prototype.hasItemForSpell = function(spellId) { 
    return this.getItemForSpell(spellId) != null; 
  };
  
  Char.prototype.getItemForSpell = function(spellId) {
    var charWeapons = jQuery.merge(jQuery.merge([], [this.equippedWeapon]), this.weapons);
    for (var w in charWeapons) {
      var weapon = charWeapons[w];
      if (weapon.hasSpell && weapon.spell == spellId) {
        return weapon;
      }
    }
    var charArmor = jQuery.merge(jQuery.merge([], this.equippedArmor), this.otherArmor);
    for (var a in charArmor) {
      var armor = charArmor[a];
      if (armor.hasSpell && armor.spell == spellId) {
        return armor;
      }
    }
    return null; 
  };
  
  // -----------------------------------------------
  // Methods that change the state of this character
  // -----------------------------------------------
  Char.prototype.applyDamage = function(dmg) {
    this.hitPoints -= dmg;
    if (this.hitPoints <= 0) {
      this.addStatus(Status.Dead);
    } else if (this.hitPoints > this.maxHitPoints) {
      this.hitPoints = this.maxHitPoints;
    }
  };
  
  Char.prototype.addStatus = function(status) { 
    if (status == Status.Dead) {
      this.hitPoints = 0;
      for (var s in this.currentStatuses) {
        this.currentStatuses[s] = false;
      }
    }
    this.currentStatuses[status] = true;
    return this; 
  };

  Char.prototype.removeStatus = function(status) { 
    this.currentStatuses[status] = false; 
  };

  Char.prototype.protectFrom = function(element) { 
    this.resistedElements[element] = true; 
  };
  
  Char.prototype.weakTo = function(element, removeResistance) { 
    this.weakElements[element] = true; 
    if (removeResistance) {
      this.resistedElements[element] = false;
    }
  };
  
  Char.prototype.useSpellCharge = function(spellLevel) {
    if (this.hasSpellCharge(spellLevel)) {
      this.charges[spellLevel - 1]--;
    }
  };
  
  Char.prototype.applyChanges = function(changes) {
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

  // ----------------------------------------
  // Textual representation methods (toString)
  // ----------------------------------------
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
  
  Char.prototype.statusesToString = function() { 
    return (this.getStatuses().length == 0 ? "[none]" : this.getStatuses().join(",")); 
  };

  var create = function() {
    return new Char();
  };
  
  return {
    create : create
  };    
})();