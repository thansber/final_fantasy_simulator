var Monster = (function() {
  
  var ALL = {};
  var Types = {
    Magical : "magical"
   ,Dragon : "dragon"
   ,Giant : "giant"
   ,Undead : "undead"
   ,Were : "were"
   ,Aquatic : "aquatic"
   ,Mage : "mage"
   ,Regenerative : "regen"
  };
  
  function MonsterBase(opt) {
    var types = opt.type || [];
    var stats = opt.stats || {};
    var rewards = opt.rewards || {exp:1, gold:0};
    var specialAttacks = opt.specialAttacks || {};
    var elements = opt.elements || {weakTo:[], resists:[]};
    
    this.name = opt.names.original;
    this.otherNames = {};
    for (var n in opt.names.other) {
      this.otherNames[n] = opt.names.other[n];
    }
    
    this.types = jQuery.merge([], jQuery.isArray(opt.type) ? opt.type : jQuery.makeArray(opt.type));
    this.hp = stats.hp;
    this.attack = stats.atk;
    this.accuracy = stats.acc;
    this.numHits = stats.hits;
    this.criticalRate = stats.crt;
    this.defense = stats.def;
    this.evasion = stats.eva;
    this.magicDef = stats.md;
    this.morale = stats.mor;
    
    this.gold = rewards.gold;
    this.exp = rewards.exp;
    
    this.attackStatus = specialAttacks.status;
    this.attackElement = specialAttacks.element;
    
    this.elementsWeakTo = {}; 
    this.elementsResisted = {}; 
    
    for (var e in elements.weakTo) {
      this.elementsWeakTo[elements.weakTo[e]] = true;
    }
    for (var e in elements.resists) {
      this.elementsResisted[elements.resists[e]] = true;
    }
    
    ALL[this.name] = this;
  };
  
  MonsterBase.prototype.isType = function(type) {
    return (jQuery.inArray(type, this.types) > -1);
  };
  
  MonsterBase.prototype.isProtectedFrom = function(element) { 
    return this.elementsResisted[element]; 
  };
  
  MonsterBase.prototype.isWeakTo = function(element) { 
    return this.elementsWeakTo[element]; 
  };
  
  new MonsterBase({
    names : {original:"IMP", other:{translated:"Goblin"}}
   ,type : Types.Giant
   ,stats : {hp:8,atk:4,acc:2,hits:1,crt:1,def:4,eva:6,md:16,mor:106}
   ,reward : {gold:6,exp:6}});
  new MonsterBase({
    names : {original:"GrIMP", other:{translated:"Goblin Guard"}}
   ,type : Types.Giant
   ,stats : {hp:16,atk:8,acc:4,hits:1,crt:1,def:6,eva:9,md:23,mor:120}
   ,rewards : {gold:18,exp:18}});
  new MonsterBase({
    names : {original:"WOLF", other:{translated:"Wolf"}}
   ,stats : {hp:20,atk:8,acc:5,hits:1,crt:1,def:0,eva:36,md:28,mor:105}
   ,rewards : {gold:6,exp:24}});
  new MonsterBase({
    names : {original:"GrWOLF", other:{translated:"Warg Wolf"}}
   ,stats : {hp:72,atk:14,acc:18,hits:1,crt:1,def:0,eva:54,md:46,mor:108}
   ,rewards : {gold:22,exp:93}});
  new MonsterBase({
    names : {original:"WrWOLF", other:{translated:"Wereolf"}}
   ,type : [Types.Magical, Types.Were, Types.Regenerative]
   ,stats : {hp:68,atk:14,acc:17,hits:1,crt:1,def:6,eva:42,md:45,mor:120}
   ,rewards : {gold:67,exp:135}
   ,specialAttacks: {status:Status.Poison, element:Element.PoisonStone}});
  new MonsterBase({
    names : {original:"FrWOLF", other:{translated:"Winter Wolf"}}
   ,stats : {hp:92,atk:25,acc:23,hits:1,crt:1,def:0,eva:54,md:55,mor:200}
   ,rewards : {gold:200,exp:402}
   ,elements : {weakTo:[Element.Fire], resists:[Element.Ice]}
   // TODO: add skills SKILL: 32/128 - FROST-FROST-FROST-FROST (25%)
   });
  
  return {
    lookup : function(name) { return ALL[name]; }
   ,Types : Types
  };
})();