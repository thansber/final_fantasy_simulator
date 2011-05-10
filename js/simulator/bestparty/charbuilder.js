FFSim.charBuilder = (function() {
    
    var equipmentLimits = {
        "Ice[S]" : 2
       ,"Katana" : 2
       ,"Xcalber" : 1
       ,"Sun[S]" : 1
       ,"Defense" : 1
       ,"Thor[H]" : 1
       ,"Vorpal" : 1
       ,"Light[A]" : 2
       ,"Flame[S]" : 1
       ,"Bane[S]" : 1
       ,"Giant[S]" : 1
       ,"Dragon[S]" : 1
       ,"Were[S]" : 1
       ,"Coral[S]" : 1
       ,"Rune[S]" : 1
       ,"Wizard[R]" : 1
       ,"Mage[R]" : 1
       ,"Power[R]" : 1
       ,"Heal[R]" : 1
       
       ,"Ribbon" : 3
       ,"Opal[S]" : 2
       ,"ProCape" : 2
       ,"Heal[H]" : 2
       ,"Dragon[A]" : 1
       ,"Opal[A]" : 1
       ,"Opal[B]" : 1
       ,"Ice[A]" : 1
       ,"Flame[A]" : 1
       ,"White[R]" : 1
       ,"Black[R]" : 1
       ,"Aegis[S]" : 1
       ,"Ice[S]" : 1
       ,"Flame[S]" : 1
       ,"Opal[H]" : 1
       ,"Power[G]" : 1
       ,"Opal[G]" : 2
       ,"Zeus[G]" : 1
    };
    
    var charClassMapping = {
       Fi : FFSim.KNIGHT
      ,Th : FFSim.NINJA 
      ,BB : FFSim.MASTER 
      ,RM : FFSim.RED_WIZARD 
      ,WM : FFSim.WHITE_WIZARD 
      ,BM : FFSim.BLACK_WIZARD 
    };
    
    var charClassSettings = {};
    charClassSettings[FFSim.KNIGHT] = {
        name : "Knight"
       ,stats : {str:44,agi:27,int:13,vit:28,luck:23,hit:82,magicDef:87}
       ,level : 25
       ,hp : 557
       ,charges : [4,4,4,0,0,0,0,0]
       ,weaponPrefs : ["Xcalber", "Vorpal", "Sun[S]", "Defense", "Ice[S]"]
       ,armorPrefs : ["Dragon[A]", "Opal[A]", "Ice[A]", "Flame[A]"]
       ,shieldPrefs : ["Aegis[S]", "Opal[S]", "Flame[S]", "Ice[S]"]
       ,helmetPrefs : ["Opal[H]", "Ribbon"]
    };
    charClassSettings[FFSim.NINJA] = {
        name : "Ninja"
       ,stats : {str:25,agi:26,int:17,vit:17,luck:39,hit:53,magicDef:63}
       ,level : 25
       ,hp : 371
       ,charges : [4,4,4,4,0,0,0,0]
       ,weaponPrefs : ["Vorpal", "Katana", "Sun[S]", "Defense", "Ice[S]"]
       ,armorPrefs : ["Ice[A]", "Flame[A]", "Opal[B]", "Gold[B]"]
       ,shieldPrefs : ["Flame[S]", "Ice[S]", "Silver[S]"]
       ,helmetPrefs : ["Heal[H]", "Ribbon"]
    };
    charClassSettings[FFSim.MASTER] = {
        name : "Master"
       ,stats : {str:20,agi:20,int:20,vit:44,luck:23,hit:77,magicDef:76}
       ,level : 25
       ,hp : 457
       ,charges : []
       ,weaponPrefs : []
       ,armorPrefs : ["Opal[B]", "Gold[B]"]
       ,shieldPrefs : []
       ,helmetPrefs : ["Ribbon", "Cap"]
    };
    charClassSettings[FFSim.RED_WIZARD] = {
        name : "RedWiz"
       ,stats : {str:25,agi:22,int:25,vit:20,luck:20,hit:55,magicDef:68}
       ,level : 25
       ,hp : 343
       ,charges : [9,7,6,6,5,3,0,0]
       ,weaponPrefs : ["Vorpal", "Sun[S]", "Defense", "Ice[S]"]
       ,armorPrefs : ["Opal[B]", "White[R]", "Black[R]", "Gold[B]"]
       ,shieldPrefs : ["ProCape", "Buckler"]
       ,helmetPrefs : ["Ribbon", "Cap"]
    };
    charClassSettings[FFSim.WHITE_WIZARD] = {
        name : "WhiteWiz"
       ,stats : {str:18,agi:17,int:38,vit:24,luck:19,hit:29,magicDef:68}
       ,level : 25
       ,hp : 363
       ,charges : [9,7,6,6,5,5,3,1]
       ,weaponPrefs : ["Thor[H]", "Silver[H]"]
       ,armorPrefs : ["Opal[B]", "Gold[B]"]
       ,shieldPrefs : ["ProCape"]
       ,helmetPrefs : ["Ribbon", "Cap"]
       ,extraPrefs : [{armor:["Black[R]"]}]
    };
    charClassSettings[FFSim.BLACK_WIZARD] = {
        name : "BlackWiz"
       ,stats : {str:13,agi:22,int:44,vit:13,luck:21,hit:29,magicDef:68}
       ,level : 25
       ,hp : 255
       ,charges : [9,7,6,6,5,5,3,1]
       ,weaponPrefs : ["CatClaw"]
       ,armorPrefs : ["Opal[B]", "Gold[B]"]
       ,shieldPrefs : ["ProCape"]
       ,helmetPrefs : ["Ribbon", "Cap"]
    };

    var assignCharsToGroups = function(battle) {
        battle.group1.chars = [battle.allChars[0],battle.allChars[1],battle.allChars[2],battle.allChars[3]];
        battle.group2.chars = [battle.allChars[4],battle.allChars[5],battle.allChars[6],battle.allChars[7]];
    };
    
    var setup = function(partyText) {
        var groups = partyText.split("v");
        
        var allChars = [];
        jQuery.merge(allChars, setupGroup(groups[0].split("-"), 0));
        jQuery.merge(allChars, setupGroup(groups[1].split("-"), 1));
        
        var battle = {};
        battle.group1 = {name:groups[0]};
        battle.group2 = {name:groups[1]};
        battle.allChars = allChars;
        assignCharsToGroups(battle);
        
        return battle;
    };
    
    var setupGroup = function(charClasses, groupNum) {
        var i = 1 + (charClasses.length * groupNum);
        var availEquipment = jQuery.extend({}, equipmentLimits);
        var chars = [];
        for (var c in charClasses) {
            var charClass = charClassMapping[charClasses[c]];
            var charSettings = charClassSettings[charClass];
            var name = charSettings.name + i;
            var stats = charSettings.stats;
            var level = charSettings.level;
            var hp = charSettings.hp;
            var spellCharges = charSettings.charges; 
            var weaponId = chooseEquipment(availEquipment, charSettings["weaponPrefs"]);
            var armorId = chooseEquipment(availEquipment, charSettings["armorPrefs"]);
            var shieldId = chooseEquipment(availEquipment, charSettings["shieldPrefs"]);
            var helmetId = chooseEquipment(availEquipment, charSettings["helmetPrefs"]);
            
            var ffChar = new FFSim.Char().name(name).charClass(charClass);
            ffChar.stats(stats).level(level).hp(hp).spellCharges(jQuery.merge([], spellCharges));
            ffChar.weapon(weaponId, true);
            if (armorId != null) {
                ffChar.armor(armorId, true);
            }
            if (shieldId != null) {
                ffChar.armor(shieldId, true);
            }
            if (helmetId != null) {
                ffChar.armor(helmetId, true);
            }
            ffChar.armor("ProRing", true);
            
            if (ffChar.equippedArmor.length < 4 && charSettings.extraPrefs) {
              for (var e in charSettings.extraPrefs) {
                var extraArmor = charSettings.extraPrefs[e]["armor"];
                for (var a in extraArmor) {
                  var itemId = allocateEquipment(availEquipment, extraArmor[a]);
                  if (itemId != null) {
                    ffChar.armor(itemId, false);
                  }
                }
              }
            }
            
            chars.push(ffChar);
            i++;
        }
        return chars;
    };
        
    
    var chooseEquipment = function(limits, equipmentPrefs) {
      for (var e in equipmentPrefs) {
        var item = allocateEquipment(limits, equipmentPrefs[e]);
        if (item != null) {
          return item;
        }
      }
      return null;
    };
    
    var allocateEquipment = function(limits, item) {
      if (limits[item] == null) {
        return item;
      } else if (limits[item] > 0) {
        limits[item]--;
        return item;
      }
      return null;
    };
    
    return {
        setup : setup
       ,assignCharsToGroups : assignCharsToGroups
    };
    
    
    
})();