var FFDConstants = (function() {
    
    var enemies = {
        getEnemyName :  function(enemyId) {
            var enemy = this.all[enemyId]; 
            if (!enemy) {
                return enemyId;
            }
            
            var selectedEnemyNameType = $("div#menu input:checked").val(); 
            if (selectedEnemyNameType == "gba") {
                return enemy.gba_desc ? enemy.gba_desc : enemyId;
            }
            
            return enemy.desc ? enemy.desc : enemyId.toUpperCase(); 
        },     
        all: {
            Agama:{hp:296,exp:2472,gp:1200,size:"M",gba_desc:"Fire Lizard"},
            Air:{hp:358,exp:1614,gp:807,size:"S",gba_desc:"Air Elemental"},
            Albatross:{hp:-1,exp:-1,gp:-1,size:"S"},
            Ankylo:{hp:352,exp:2610,gp:1,size:"L",gba_desc:"Desert Baretta"},
            Arachnid:{hp:64,exp:141,gp:50,size:"S",gba_desc:"Tarantula"},
            Armor:{hp:-1,exp:-1,gp:-1,size:"S"},
            Asp:{hp:56,exp:123,gp:50,size:"S",gba_desc:"Cobra"},
            Astos:{hp:168,exp:2250,gp:2000,size:"S"},
            BadMan:{hp:260,exp:1263,gp:1800,size:"S",gba_desc:"Black Knight"},
            BigEye:{hp:304,exp:3591,gp:3591,size:"L",desc:"BigEYE",gba_desc:"Deepeyes"},
            Bikke:{hp:-1,exp:-1,gp:-1,size:"S"},
            BloodGolem:{hp:-1,exp:-1,gp:-1,size:"L",desc:"BloodGOL",gba_desc:"Blood Golem"},
            BlueDragon:{hp:454,exp:3274,gp:2000,size:"L",desc:"Blue D"},
            Bone:{hp:10,exp:9,gp:3,size:"S",gba_desc:"Skeleton"},
            Bull:{hp:164,exp:489,gp:489,size:"L",gba_desc:"Minotaur"},
            Caribe:{hp:92,exp:240,gp:20,size:"S",gba_desc:"Piranha"},
            CatMan:{hp:160,exp:780,gp:780,size:"S",gba_desc:"Weretiger"},
            Cedric:{hp:-1,exp:-1,gp:-1,size:"L"},
            Cerebus:{hp:192,exp:1182,gp:600,size:"L",gba_desc:"Hellhound"},
            Chaos:{hp:2000,exp:0,gp:0,size:"XXL"},
            Chimera:{hp:300,exp:2064,gp:2500,size:"L"},
            Cobra:{hp:80,exp:165,gp:50,size:"S",gba_desc:"Anaconda"},
            Coctrice:{hp:50,exp:186,gp:200,size:"S",gba_desc:"Cockatrice"},
            Crawl:{hp:84,exp:186,gp:200,size:"S",gba_desc:"Crawler"},
            Creep:{hp:56,exp:63,gp:15,size:"S",gba_desc:"Gigas Worm"},
            DeadCedric:{hp:-1,exp:-1,gp:-1,size:"L",desc:"CEDRIC"},
            Earth:{hp:288,exp:1536,gp:768,size:"L",gba_desc:"Earth Elemental"},
            Ent:{hp:-1,exp:-1,gp:-1,size:"L"},
            EvilMan:{hp:190,exp:2700,gp:3000,size:"S",gba_desc:"Death Knight"},
            Eye:{hp:162,exp:3225,gp:3225,size:"L"},
            Fighter:{hp:200,exp:3420,gp:3420,size:"S",gba_desc:"Dark Fighter"},
            Fire:{hp:276,exp:1620,gp:800,size:"L",gba_desc:"Fire Elemental"},
            FrostDragon:{hp:200,exp:1701,gp:2000,size:"L",desc:"Frost D",gba_desc:"White Dragon"},
            FrostGator:{hp:142,exp:1890,gp:2000,size:"L",desc:"FrGATOR",gba_desc:"White Croc"},
            FrostGiant:{hp:336,exp:1752,gp:1752,size:"L",desc:"FrGIANT",gba_desc:"Frost Gigas"},
            FrostWolf:{hp:93,exp:402,gp:200,size:"S",desc:"FrWOLF",gba_desc:"Winter Wolf"},
            Gargoyle:{hp:80,exp:132,gp:80,size:"S"},
            Garland:{hp:106,exp:130,gp:250,size:"S"},
            GasDragon:{hp:352,exp:4068,gp:5000,size:"L",desc:"Gas D",gba_desc:"Green Dragon"},
            Gator:{hp:184,exp:816,gp:900,size:"S",gba_desc:"Crocodile"},
            Geist:{hp:56,exp:117,gp:117,size:"S",gba_desc:"Ghast"},
            Ghost:{hp:180,exp:990,gp:990,size:"S"},
            Ghoul:{hp:48,exp:93,gp:50,size:"S"},
            Giant:{hp:240,exp:879,gp:879,size:"L",gba_desc:"Hill Gigas"},
            Goldman:{hp:-1,exp:-1,gp:-1,size:"L"},
            GreatPede:{hp:320,exp:2244,gp:1000,size:"L",desc:"GrPEDE",gba_desc:"Remorazz"},
            GreenMedusa:{hp:68,exp:1218,gp:1218,size:"S",desc:"GrMEDUSA",gba_desc:"Earth Medusa"},
            GreenOgre:{hp:132,exp:282,gp:300,size:"L",desc:"GrOGRE",gba_desc:"Ogre Chief"},
            GreyImp:{hp:16,exp:18,gp:18,size:"S",desc:"GrIMP",gba_desc:"Goblin Guard"},
            GreyNaga:{hp:420,exp:3489,gp:4000,size:"L",desc:"GrNAGA",gba_desc:"Spirit Naga"},
            GreyShark:{hp:344,exp:2361,gp:600,size:"L",desc:"GrSHARK",gba_desc:"White Shark"},
            GreyWolf:{hp:72,exp:93,gp:22,size:"S",desc:"GrWOLF",gba_desc:"Warg Wolf"},
            GreyWorm:{hp:280,exp:1671,gp:400,size:"L",desc:"Grey W",gba_desc:"Lava Worm"},
            Guard:{hp:200,exp:1224,gp:400,size:"S",gba_desc:"Guardian"},
            Harpy:{hp:-1,exp:-1,gp:-1,size:"S"},
            Hydra:{hp:212,exp:915,gp:150,size:"L"},
            Hyena:{hp:120,exp:288,gp:72,size:"L",gba_desc:"Hyenadon"},
            Iguana:{hp:92,exp:153,gp:90,size:"M",gba_desc:"Lizard"},
            Image:{hp:86,exp:231,gp:231,size:"S",gba_desc:"Wraith"},
            Imp:{hp:8,exp:6,gp:6,size:"S",gba_desc:"Goblin"},
            IronGol:{hp:304,exp:6717,gp:3000,size:"L",desc:"IronGOL",gba_desc:"Iron Golem"},
            Jimera:{hp:350,exp:4584,gp:5000,size:"L",gba_desc:"Rhyos"},
            Kary:{hp:600,exp:2475,gp:3000,size:"XL"},
            Kraken:{hp:800,exp:4245,gp:5000,size:"XL"},
            Kyzoku:{hp:50,exp:60,gp:120,size:"S",gba_desc:"Buccaneer"},
            Lich:{hp:400,exp:2200,gp:3000,size:"XL"},
            Lobster:{hp:148,exp:639,gp:300,size:"S",gba_desc:"Sea Scorpion"},
            MadPony:{hp:64,exp:63,gp:15,size:"L",gba_desc:"Crazy Horse"},
            Mage:{hp:105,exp:1095,gp:1095,size:"S",gba_desc:"Dark Wizard"},
            Mamut:{hp:-1,exp:-1,gp:-1,size:"S"},
            ManCat:{hp:110,exp:603,gp:800,size:"S",gba_desc:"Rakshasa"},
            Manticor:{hp:164,exp:1317,gp:650,size:"S",gba_desc:"Manticore"},
            Medusa:{hp:68,exp:699,gp:699,size:"S"},
            Muck:{hp:76,exp:255,gp:70,size:"S",gba_desc:"Gray Ooze"},
            MudGol:{hp:176,exp:1257,gp:800,size:"L",desc:"MudGOL",gba_desc:"Clay Golem"},
            Mummy:{hp:80,exp:300,gp:300,size:"S"},
            Naga:{hp:356,exp:2355,gp:2355,size:"L",gba_desc:"Water Naga"},
            Naocho:{hp:344,exp:3189,gp:500,size:"L",gba_desc:"Neochu"},
            NinjaPirate:{hp:-1,exp:-1,gp:-1,size:"S",desc:"NjPIRATE",gba_desc:"Ninja Pirate"},
            Nitemare:{hp:200,exp:1272,gp:700,size:"L",gba_desc:"Nightmare"},
            Ocho:{hp:208,exp:1224,gp:102,size:"L",gba_desc:"Ochu"},
            OddEye:{hp:10,exp:42,gp:10,size:"L",desc:"OddEYE",gba_desc:"Bigeyes"},
            Ogre:{hp:100,exp:195,gp:195,size:"L"},
            OldWoman:{hp:-1,exp:-1,gp:-1,size:"S"},
            Ooze:{hp:76,exp:252,gp:70,size:"S",gba_desc:"Ochre Jelly"},
            Owzer:{hp:-1,exp:-1,gp:-1,size:"S"},
            Pede:{hp:222,exp:1194,gp:300,size:"L",gba_desc:"Ankheg"},
            Perilisk:{hp:44,exp:423,gp:500,size:"S",gba_desc:"Pyrolisk"},
            Phantom:{hp:360,exp:1,gp:1,size:"L"},
            Pirate:{hp:6,exp:40,gp:40,size:"S"},
            RedAnkylo:{hp:256,exp:1428,gp:300,size:"L",desc:"R.ANKYLO",gba_desc:"Baretta"},
            RedBone:{hp:144,exp:378,gp:378,size:"S",desc:"R.BONE",gba_desc:"Bloodbones"},
            RedCaribe:{hp:172,exp:546,gp:46,size:"S",desc:"R.CARIBE",gba_desc:"Red Piranha"},
            RedDragon:{hp:248,exp:2904,gp:4000,size:"L",desc:"Red D"},
            RedGargoyle:{hp:94,exp:387,gp:387,size:"S",desc:"R.GOYLE",gba_desc:"Horned Devil"},
            RedGiant:{hp:300,exp:1506,gp:1506,size:"L",desc:"R.GIANT",gba_desc:"Fire Gigas"},
            RedHydra:{hp:182,exp:1215,gp:400,size:"L",desc:"R.HYDRA",gba_desc:"Fire Hydra"},
            RedSahag:{hp:64,exp:105,gp:105,size:"S",desc:"R.SAHAG",gba_desc:"Sahagin Chief"},
            RockGol:{hp:200,exp:2385,gp:1000,size:"L",desc:"RockGOL",gba_desc:"Stone Golem"},
            SaberToothTiger:{hp:200,exp:843,gp:500,size:"L",desc:"Saber T",gba_desc:"Sabertooth"},
            Sahag:{hp:28,exp:30,gp:30,size:"S",gba_desc:"Sahagin"},
            SandWorm:{hp:200,exp:2683,gp:900,size:"L",desc:"Sand W"},
            Sauria:{hp:196,exp:1977,gp:658,size:"M",gba_desc:"Basilisk"},
            Scorpion:{hp:84,exp:225,gp:70,size:"S"},
            Scum:{hp:24,exp:84,gp:20,size:"S",gba_desc:"Green Slime"},
            SeaSnake:{hp:224,exp:957,gp:600,size:"S",desc:"SeaSNAKE"},
            SeaTroll:{hp:216,exp:852,gp:852,size:"L",desc:"SeaTROLL"},
            Sentry:{hp:400,exp:4000,gp:2000,size:"S",gba_desc:"Soldier"},
            Shadow:{hp:50,exp:90,gp:45,size:"S"},
            Shade:{hp:-1,exp:-1,gp:-1,size:"S"},
            Shark:{hp:120,exp:267,gp:66,size:"L"},
            Slime:{hp:156,exp:1101,gp:900,size:"S",gba_desc:"Black Flan"},
            Sorcerer:{hp:112,exp:822,gp:999,size:"S",gba_desc:"Mindflayer"},
            Specter:{hp:52,exp:150,gp:150,size:"S",gba_desc:"Wight"},
            Sphinx:{hp:228,exp:1160,gp:1160,size:"L"},
            Spider:{hp:28,exp:30,gp:8,size:"S",gba_desc:"Black Widow"},
            Tiamat:{hp:1000,exp:5496,gp:6000,size:"XL"},
            Tiger:{hp:132,exp:438,gp:108,size:"L",gba_desc:"Lesser Tiger"},
            Titan:{hp:-1,exp:-1,gp:-1,size:"L"},
            Tonberry:{hp:-1,exp:-1,gp:-1,size:"S"},
            Treant:{hp:-1,exp:-1,gp:-1,size:"S"},
            TRex:{hp:600,exp:7200,gp:600,size:"L",desc:"T REX",gba_desc:"Tyrannosaur"},
            Troll:{hp:184,exp:621,gp:621,size:"L"},
            Tyro:{hp:408,exp:3387,gp:502,size:"L",gba_desc:"Allosaurus"},
            Vampire:{hp:156,exp:1200,gp:2000,size:"S"},
            Virulent:{hp:-1,exp:-1,gp:-1,size:"XL"},
            WarMech:{hp:1000,exp:32000,gp:32000,size:"L",desc:"WarMECH",gba_desc:"Death Machine"},
            Water:{hp:300,exp:1962,gp:800,size:"S",gba_desc:"Water Elemental"},
            Werewolf:{hp:68,exp:135,gp:67,size:"S",desc:"WrWOLF"},
            Wizard:{hp:84,exp:276,gp:300,size:"S",gba_desc:"Piscodemon"},
            WizardImp:{hp:-1,exp:-1,gp:-1,size:"S",desc:"WzIMP",gba_desc:"Wizard Imp"},
            WizardMummy:{hp:188,exp:984,gp:1000,size:"S",desc:"WzMUMMY",gba_desc:"King Mummy"},
            WizardOgre:{hp:144,exp:723,gp:723,size:"L",desc:"WzOGRE",gba_desc:"Ogre Mage"},
            WizardSahag:{hp:204,exp:882,gp:882,size:"S",desc:"WzSAHAG",gba_desc:"Sahagin Prince"},
            WizardVampire:{hp:300,exp:2385,gp:3000,size:"S",desc:"WzVAMP",gba_desc:"Vampire Lord"},
            Wolf:{hp:20,exp:24,gp:6,size:"S"},
            Worm:{hp:448,exp:4344,gp:1000,size:"L",gba_desc:"Purple Worm"},
            Wraith:{hp:114,exp:432,gp:432,size:"S",gba_desc:"Specter"},
            Wyrm:{hp:260,exp:1218,gp:502,size:"L"},
            Wyvern:{hp:212,exp:1173,gp:50,size:"L"},
            Zombie:{hp:20,exp:24,gp:12,size:"S"},
            ZomBull:{hp:224,exp:1050,gp:1050,size:"L",desc:"ZomBULL",gba_desc:"Minotaur Zombie"},
            ZombieDragon:{hp:268,exp:2331,gp:999,size:"L",desc:"ZombieD",gba_desc:"Dragon Zombie"}        
        }
    };
    
    var charClasses = {
        fighter:{name:"fighter"},
        thief:{name:"thief"},
        blackbelt:{name:"blackbelt"},
        redmage:{name:"redmage",usesMagic:true},
        whitemage:{name:"whitemage",usesMagic:true},
        blackmage:{name:"blackmage",usesMagic:true},
        
        knight:{name:"knight",usesMagic:true},
        ninja:{name:"ninja",usesMagic:true},
        master:{name:"master",usesMagic:false},
        redwizard:{name:"redwizard",usesMagic:true},
        whitewizard:{name:"whitewizard",usesMagic:true},
        blackwizard:{name:"blackwizard",usesMagic:true}
    };
    
    
    var characters = {
        buildChar : function (name, hp, maxHp, status) {
            return jQuery.extend({}, this.all[name], {hp:hp,maxHp:maxHp,status:status ? status : "ok"});
        },
        buildCharCustom : function (name, overrides) {
            return jQuery.extend({}, this.all[name], overrides);
        },
        getCustomCharName : function (char) {
            return char.name.toLowerCase().replace(" ", "")
        },
        all : {
            "Arithon":{name:"Arithon", charClass:"blackmage", weapon:"silver_knife", status:"ok"},
            "Astarte":{name:"Astarte", charClass:"blackmage", weapon:"iron_staff", status:"ok"},
            "Bender":{name:"Bender", charClass:"thief", weapon:"rapier", status:"ok"},
            "Dano":{name:"Dano", charClass:"redmage", weapon:"silver_sword", status:"ok"},
            "Dave Mlinko":{name:"Dave Mlinko", charClass:"blackbelt", weapon:"punch", status:"ok"},
            "DragonAtma":{name:"DragonAtma", charClass:"redmage", weapon:"silver_sword", status:"ok"},
            "Gareth":{name:"Gareth", charClass:"fighter", weapon:"long_sword", status:"ok"},
            "Guy":{name:"Guy", charClass:"whitemage", weapon:"silver_hammer", status:"ok"},
            "Jack":{name:"Jack", charClass:"redmage", weapon:"rapier", status:"ok"},
            "Keeo":{name:"Keeo", charClass:"fighter", weapon:"rune_sword", status:"ok"},
            "Mack":{name:"Mack", charClass:"fighter", weapon:"long_sword", status:"ok"},
            "Magus":{name:"Magus", charClass:"redmage", weapon:"rune_sword", status:"ok"},
            "Max":{name:"Max", charClass:"fighter", weapon:"silver_axe", status:"ok"},
            "Mipe":{name:"Mipe", charClass:"blackbelt", weapon:"iron_nunchucks", status:"ok"},
            "Obsidian":{name:"Obsidian", charClass:"blackmage", weapon:"silver_knife", status:"ok"},
            "Pie":{name:"Pie", charClass:"blackbelt", weapon:"punch", status:"ok"},
            "Rdy":{name:"Rdy", charClass:"thief", weapon:"sabre", status:"ok"},
            "Renquist":{name:"Renquist", charClass:"redmage", weapon:"silver_sword", status:"ok"},
            "Rex":{name:"Rex", charClass:"redmage", weapon:"silver_sword", status:"ok"},
            "Rocco":{name:"Rocco", charClass:"fighter", weapon:"were_sword", status:"ok"},
            "Selene":{name:"Selene", charClass:"whitemage", weapon:"iron_hammer", status:"ok"},
            "Spiralex":{name:"Spiralex", charClass:"whitemage", weapon:"power_staff", status:"ok"},
            "Shaft":{name:"Shaft", charClass:"redmage", weapon:"silver_sword", status:"ok"},
            "Undine":{name:"Undine", charClass:"redmage", weapon:"silver_sword", status:"ok"},
            "X":{name:"X", charClass:"blackmage", weapon:"large_dagger", status:"ok"},
            "Xscorpion":{name:"Xscorpion", charClass:"thief", weapon:"dragon_sword", status:"ok"}
        }
    };
    
    var spells = {
        getSpell : function(spellId) {
            return (this.white_magic[spellId] 
                      ? this.white_magic[spellId] 
                      : this.black_magic[spellId] 
                        ? this.black_magic[spellId] 
                        : this.enemy_magic[spellId]);
        },
        getSpellName : function (spellId) {
            var spell = (typeof spellId === "string" ? this.getSpell(spellId) : spellId); 
            return (spell && spell.desc ? spell.desc : spellId.toUpperCase());
        },
        
        white_magic : {
            cure:{target:"char", backgroundColor:"#80D010", result:"HP up!", effect:"healing"},
            ruse:{target:"self", backgroundColor:"#5C94FC", result:"Easy to dodge", effect:"protective"},
            fog:{target:"char", backgroundColor:"#80D010", result:"Armor up", effect:"protective"},
            harm:{target:"enemies", backgroundColor:"#0070EC", splash:"blue_white", effect:"beam"},
            
            lamp:{target:"char", backgroundColor:"#FC9838", result:"Sight recovered", effect:"poof"},
            invs:{target:"char", backgroundColor:"#4088FC", result:"Easy to dodge", effect:"protective"},
            alit:{target:"chars", backgroundColor:"#F0BC3C", result:"Defend Lightning", effect:"protective"},
            mute:{target:"enemies", backgroundColor:"#00E8D8", splash:"turquoise_white", result:"Silenced", effect:"status"},
            
            cur2:{target:"char", backgroundColor:"#58F898", result:"HP up!", effect:"healing"},
            heal:{target:"chars", backgroundColor:"#F0BC3C", result:"HP up!", effect:"healing"},
            afir:{target:"chars", backgroundColor:"#FC7460", result:"Defend Fire", effect:"protective"},
            hrm2:{target:"enemies", backgroundColor:"#4088FC", splash:"purple_white", effect:"beam"},

            pure:{target:"char", backgroundColor:"#4CDC48", effect:"poof", status:"ok", result:"Cured!"},
            fear:{target:"enemy", backgroundColor:"#FC74B4", splash:"pink_white", result:"Became terrified", effect:"status"},
            aice:{target:"chars", backgroundColor:"#3CBCFC", result:"Defend Cold", effect:"protective"},
            amut:{target:"char", backgroundColor:"#00E8D8", result:"Defend Mute", effect:"poof"},

            cur3:{target:"char", backgroundColor:"#00E8D8", result:"HP up!", effect:"healing"},
            hel2:{target:"chars", backgroundColor:"#FC9838", result:"HP up!", effect:"healing"},
            life:{target:"char"},
            hrm3:{target:"enemies", backgroundColor:"#FC74B4", splash:"pink_white", effect:"beam"},

            fog2:{target:"chars", backgroundColor:"#4CDC48", result:"Armor up", effect:"protective"},
            inv2:{target:"chars", backgroundColor:"#F478FC", result:"Easy to dodge", effect:"protective"},
            soft:{target:"char"},
            exit:{target:"chars"},
            
            cur4:{target:"char", backgroundColor:"#3CBCFC", result:"HP max!", effect:"healing"},
            hel3:{target:"chars", backgroundColor:"#FC74B4", result:"HP up!", effect:"healing"},
            arub:{target:"chars", backgroundColor:"#FC74B4", result:"Defend Magic", effect:"protective"},
            hrm4:{target:"enemies", backgroundColor:"#00E8D8", splash:"turquoise_white", effect:"beam"},

            wall:{target:"chars", backgroundColor:"#BCBCBC", result:"Defend All", effect:"protective"},
            xfer:{target:"enemy", backgroundColor:"#BCBCBC", splash:"grey_white", result:"Defenseless", effect:"star"},
            lif2:{target:"char"},
            fade:{target:"enemies", backgroundColor:"#F478FC", splash:"magenta_white", effect:"beam"}
        },
        black_magic : {
            fire:{target:"enemy", backgroundColor:"#FC7460", splash:"red_white", effect:"flame"},
            slep:{target:"enemies", backgroundColor:"#58F898", splash:"green_sea_white", result:"Asleep", effect:"status"},
            lock:{target:"enemy", backgroundColor:"#F0BC3C", splash:"gold_white", result:"Easy to hit", effect:"star"},
            lit:{target:"enemy", backgroundColor:"#F0BC3C", splash:"gold_white", effect:"beam"},
            
            ice:{target:"enemy", backgroundColor:"#3CBCFC", splash:"blue_white", effect:"flame"},
            dark:{target:"enemies", backgroundColor:"#4088FC", splash:"purple_white", result:"Darkness", effect:"status"},
            tmpr:{target:"char", backgroundColor:"#58F898", result:"Weapons stronger", effect:"star"},
            slow:{target:"enemies", backgroundColor:"#4CDC48", splash:"green_light_white", result:"Lost intelligence", effect:"status"},
            
            fir2:{target:"enemies", backgroundColor:"#FC9838", splash:"orange_white", effect:"flame"},
            hold:{target:"enemy", backgroundColor:"#FC9838", splash:"orange_white", result:"Attack halted", effect:"status"},
            lit2:{target:"enemies", backgroundColor:"#FC9838", splash:"orange_white", effect:"beam"},
            lok2:{target:"enemies", backgroundColor:"#FC9838", splash:"orange_white", result:"Easy to hit", effect:"star"},

            slp2:{target:"enemy", backgroundColor:"#3CBCFC", splash:"blue_white", result:"Asleep", effect:"status"},
            fast:{target:"char", backgroundColor:"#4CDC48", result:"Quick shot", effect:"star"},
            conf:{target:"enemies", backgroundColor:"#FC7460", splash:"red_white", result:"Confused", effect:"status"},
            ice2:{target:"enemies", backgroundColor:"#5C94FC", splash:"blue_white", effect:"flame"},

            fir3:{target:"enemies", backgroundColor:"#FC74B4", splash:"pink_white", effect:"flame"},
            bane:{target:"enemies", backgroundColor:"#5C94FC", splash:"blue_white", result:"Poison Smoke", death:true, effect:"status"},
            warp:{target:"chars"},
            slo2:{target:"enemy", backgroundColor:"#80D010", splash:"green_white", result:"Lost intelligence", effect:"status"},

            lit3:{target:"enemies", backgroundColor:"#5C94FC", splash:"blue_white", effect:"beam"},
            rub:{target:"enemy", backgroundColor:"#BCBCBC", splash:"grey_white", result:"Erased", death:true, effect:"death"},
            qake:{target:"enemies", backgroundColor:"#FC7460", splash:"red_white", result:"Fell into crack", death:true, effect:"star"},
            stun:{target:"enemy", backgroundColor:"#F0BC3C", splash:"gold_white", result:"Paralyzed", effect:"status"},

            ice3:{target:"enemies", backgroundColor:"#58F898", splash:"green_sea_white", effect:"flame"},
            brak:{target:"enemy", backgroundColor:"#BCBCBC", splash:"grey_white", result:"Broken into pieces", death:true, effect:"beam"},
            sabr:{target:"self", backgroundColor:"#BCBCBC", result:"Weapon became enchanted", effect:"protective"},
            blnd:{target:"enemy", backgroundColor:"#F478FC", splash:"magenta_white", result:"Darkness", effect:"status"},

            nuke:{target:"enemies", backgroundColor:"#F0BC3C", splash:"gold_white", effect:"flame"},
            stop:{target:"enemies", backgroundColor:"#BCBCBC", splash:"grey_white", result:["Time stopped","Paralyzed"], effect:"status"},
            zap:{target:"enemies", backgroundColor:"#58F898", splash:"green_sea_white", desc:"ZAP!", result:"Exile to 4th dimension", death:true, effect:"death"},
            xxxx:{target:"enemy", backgroundColor:"#F0BC3C", splash:"gold_white", result:"Erased", death:true, effect:"death"}
            
           ,rage:{target:"enemies", backgroundColor:"#BCBCBC", splash:"grey_white", effect:""}
        },
        enemy_magic : {
            gaze:{target:"char", result:"Attack halted"}
           ,grudge:{target:"char"}
           ,dazzle:{target:"chars", result:"Paralyzed", status:"stun"}
        }
    };
    
    var spellEffects = ["beam", "death", "flame", "healing", "poof", "protective", "star", "status"];
    
    var magicItems = {
        "HealPotion" : {spell:"cure", message:"Heal%", dmg:-30, desc:"Heal Potion"}
       ,"PurePotion" : {spell:"pure", message:"Pure%", desc:"Pure Potion"}
    
       ,"BlackShirt" : {spell:"ice2", message:"Black+", desc:"Black Shirt"}
       ,"HealHelmet" : {spell:"heal", message:"Heal*", desc:"Heal Helmet"}
       ,"PowerGauntlet" : {spell:"sabr", message:"Power&", desc:"Power Gauntlet"} 
       ,"WhiteShirt" : {spell:"inv2", message:"White+", desc:"White Shirt"}
       ,"ZeusGauntlet" : {spell:"lit2", message:"Zues&", desc:"Zeus Gauntlet"}
        
       ,"BaneSword" : {spell:"bane", message:"Bane^", desc:"Bane Sword"}
       ,"Defense" : {spell:"ruse", message:"Defense", desc:"Defense"}
       ,"HealStaff" : {spell:"heal", message:"Heal$", desc:"Heal Staff"}
       ,"LightAxe" : {spell:"hrm2", message:"Light@", desc:"Light Axe"}
       ,"MageStaff" : {spell:"fir2", message:"Mage$", desc:"Mage Staff"}
       ,"ThorHammer" : {spell:"lit2", message:"Thor#", desc:"Thor's Hammer"}
       ,"WizardStaff" : {spell:"conf", message:"Wizard$", desc:"Wizard Staff"}
       
       ,"ScorchRing" : {spell:"fir2", message:"Scorch(", desc:"Scorch Ring"}
    };
    
    var statuses = {
        "ok":{type:"ok", message:"HP", normal:true}
       ,"stun":{type:"stun", message:"Stun", result:"Paralyzed", normal:false, battleOnly:true}
       ,"poison":{type:"poison", message:"Poison", result:"Poisoned", normal:false}
       ,"encase":{type:"encase", message:"Encase", result:"Encased", normal:false, stone:true, battleOnly:true}
       ,"dark":{type:"dark", message:"Dark", result:"Darkness", normal:true, battleOnly:true}
       ,"stone":{type:"stone", message:"Stone", result:"Petrified", normal:false, stone:true}
       ,"possessed":{type:"possessed", message:"Turned", result:"Possessed", normal:true, battleOnly:true}
       ,"sleep":{type:"sleep", message:"Asleep", result:"Asleep", normal:false, battleOnly:true}
       ,"doom":{type:"doom", message:"Doom", result:"Destined to die", normal:false, battleOnly:true}
       ,"drain":{type:"drain", message:"HP", result:"Drained", normal:true, battleOnly:true}
    };
    
    var weapons = {
        bane_sword:{ffname:"Bane[S]", splash:"blue_royal", desc:"Bane Sword"},
        catclaw:{ffname:"CatClaw", splash:"turquoise", desc:"CatClaw"},  
        coral_sword:{ffname:"Coral[S]", splash:"pink", desc:"Coral Sword"}, 
        defense:{ffname:"Defense", splash:"orange", desc:"Defense"}, 
        dragon_sword:{ffname:"Dragon[S]", splash:"green_sea", desc:"Dragon Sword"}, 
        falchion:{ffname:"Falchon", splash:"grey", desc:"Falchion"}, 
        flame_sword:{ffname:"Flame[S]", splash:"red", desc:"Flame Sword"},  
        giant_sword:{ffname:"Giant[S]", splash:"royal_blue", desc:"Giant Sword"}, 
        great_axe:{ffname:"Great[A]", splash:"pink", desc:"Great Axe"}, 
        hand_axe:{ffname:"Hand[A]", splash:"grey", desc:"Hand Axe"}, 
        heal_staff:{ffname:"Heal[R]", splash:"blue_white", desc:"Heal Staff"},  
        ice_sword:{ffname:"Ice[S]", splash:"blue", desc:"Ice Sword"},  
        iron_hammer:{ffname:"Iron[H]", splash:"orange", desc:"Iron Hammer"}, 
        iron_nunchucks:{ffname:"Iron[N]", splash:"grey", customCssClass:"nunchucks", desc:"Iron Nunchucks"}, 
        iron_staff:{ffname:"Iron[S]", splash:"grey", desc:"Iron Staff"}, 
        katana:{ffname:"Katana", splash:"orange", desc:"Katana"}, 
        large_dagger:{ffname:"Large[K]", splash:"grey", desc:"Large Dagger"}, 
        light_axe:{ffname:"Light[A]", splash:"purple", desc:"Light Axe"}, 
        long_sword:{ffname:"Long[S]", splash:"grey", desc:"Long Sword"},  
        mage_staff:{ffname:"Mage[R]", splash:"pink", desc:"Mage Staff"},
        masamune:{ffname:"Masmune", splash:"grey", desc:"Masamune"},
        power_staff:{ffname:"Power[R]", splash:"green_light", desc:"Power Staff"}, 
        punch:{ffname:"Punch", splash:"gold", customCssClass:"punch", desc:"Punch"},
        rapier:{ffname:"Rapier", splash:"grey", desc:"Rapier"}, 
        rune_sword:{ffname:"Rune[S]", splash:"purple", desc:"Rune Sword"}, 
        sabre:{ffname:"Sabre", splash:"grey", desc:"Saber"}, 
        scimitar:{ffname:"Scimtar", splash:"green_sea", desc:"Scimitar"},  
        short_sword:{ffname:"Short[S]", splash:"grey", desc:"Short Sword"}, 
        silver_axe:{ffname:"Silver[A]", splash:"turquoise", desc:"Silver Axe"}, 
        silver_hammer:{ffname:"Silver[H]", splash:"turquoise", desc:"Silver Hammer"}, 
        silver_knife:{ffname:"Silver[K]", splash:"turquoise", desc:"Silver Knife"},
        silver_sword:{ffname:"Silver[S]", splash:"turquoise", desc:"Silver Sword"}, 
        small_dagger:{ffname:"Small[K]", splash:"grey", desc:"Small Dagger"},
        sun_sword:{ffname:"Sun[S]", splash:"orange", desc:"Sun Sword"}, 
        thors_hammer:{ffname:"Thor[H]", splash:"magenta", desc:"Thor's Hammer"},
        vorpal:{ffname:"Vorpal", splash:"blue", desc:"Vorpal"},   
        were_sword:{ffname:"Were[S]", splash:"magenta", desc:"Were Sword"}, 
        wizard_staff:{ffname:"Wizard[R]", splash:"turquoise", desc:"Wizard Staff"}, 
        wooden_nunchucks:{ffname:"Wooden[N]", splash:"orange", customCssClass:"nunchucks", desc:"Wooden Nunchucks"}, 
        wooden_staff:{ffname:"Wooden[R]", splash:"orange", desc:"Wooden Staff"},
        xcaliber:{ffname:"Xcalber", splash:"gold", desc:"Xcaliber"} 
    };
    
    return {
        enemies : enemies,
        characters : characters,
        charClasses : charClasses,
        spells : spells,
        spellEffects : spellEffects,
        magicItems : magicItems,
        statuses : statuses,
        weapons : weapons,
        buildChar : function(name, hp, maxHp, status) { return characters.buildChar(name, hp, maxHp, status); },
        getEnemyName : function(enemyId) { return enemies.getEnemyName(enemyId); },
        getSpell : function(spellId) { return spells.getSpell(spellId); },
        getSpellName : function(spellId) { return spells.getSpellName(spellId); },
        getStatus : function(status) { return statuses[status]; }
    };
    
})();