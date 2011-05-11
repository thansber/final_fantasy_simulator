FFSim.Level25AI = (function() {
  
  var name = "Level 25";
  var ai = {};
  ai[FFSim.KNIGHT] = [
    {type:"A", targetClass:FFSim.BLACK_WIZARD, numDuplicates:1}
   ,{type:"A", targetClass:FFSim.WHITE_WIZARD, numDuplicates:1}
   ,{type:"A", targetClass:FFSim.MASTER}
   ,{type:"A", targetClass:FFSim.KNIGHT}
   ,{type:"A", targetClass:FFSim.RED_WIZARD, numDuplicates:2}
   ,{type:"A", targetClass:FFSim.NINJA, numDuplicates:2}
  ];    
  ai[FFSim.NINJA] = [
    {type:"S", spell:"FAST", targetClass:FFSim.MASTER, numDuplicates:1}
   ,{type:"S", spell:"FAST", targetClass:FFSim.KNIGHT, numDuplicates:1}
   ,{type:"S", spell:"TMPR", targetClass:FFSim.KNIGHT, numDuplicates:1}
   ,{type:"A", targetClass:FFSim.BLACK_WIZARD}
   ,{type:"A", targetClass:FFSim.WHITE_WIZARD}
   ,{type:"A", targetClass:FFSim.MASTER}
   ,{type:"A", targetClass:FFSim.KNIGHT}
   ,{type:"S", spell:"ICE2"}
   ,{type:"A", targetClass:FFSim.RED_WIZARD}
   ,{type:"A", targetClass:FFSim.NINJA}
  ];
  ai[FFSim.MASTER] = [
    {type:"A", targetClass:FFSim.BLACK_WIZARD, numDuplicates:1}
   ,{type:"A", targetClass:FFSim.WHITE_WIZARD, numDuplicates:1}
   ,{type:"A", targetClass:FFSim.MASTER}
   ,{type:"A", targetClass:FFSim.KNIGHT}
   ,{type:"A", targetClass:FFSim.RED_WIZARD, numDuplicates:2}
   ,{type:"A", targetClass:FFSim.NINJA, numDuplicates:2}
  ];
  ai[FFSim.RED_WIZARD] = [
    {type:"S", spell:"FAST", targetClass:FFSim.MASTER, numDuplicates:1}
   ,{type:"S", spell:"FAST", targetClass:FFSim.KNIGHT, numDuplicates:1}
   ,{type:"S", spell:"TMPR", targetClass:FFSim.KNIGHT, numDuplicates:1}
   ,{type:"A", targetClass:FFSim.BLACK_WIZARD}
   ,{type:"S", spell:"LIT3"}
   ,{type:"S", spell:"FIR3"}
   ,{type:"S", spell:"RUSE", when:"EVASION < 215"}
   ,{type:"S", spell:"INV2", when:"EVASION < 240", numDuplicates:1}
   ,{type:"S", spell:"FAST", targetClass:FFSim.RED_WIZARD, numDuplicates:1}
   ,{type:"A", targetClass:FFSim.WHITE_WIZARD}
   ,{type:"A", targetClass:FFSim.MASTER}
   ,{type:"A", targetClass:FFSim.KNIGHT}
   ,{type:"A", targetClass:FFSim.RED_WIZARD}
   ,{type:"A", targetClass:FFSim.NINJA}
  ];
  ai[FFSim.WHITE_WIZARD] = [
    {type:"S", spell:"CUR4", targetClass:FFSim.MASTER, when:"HP < 25%", numDuplicates:1}
   ,{type:"S", spell:"CUR4", targetClass:FFSim.KNIGHT, when:"HP < 25%", numDuplicates:1}
   ,{type:"S", spell:"CUR4", targetClass:FFSim.WHITE_WIZARD, when:"HP < 40%", numDuplicates:1}
   ,{type:"S", spell:"FADE"}
   ,{type:"S", spell:"CUR3", targetClass:FFSim.MASTER, when:"HP < 60%", numDuplicates:2}
   ,{type:"S", spell:"CUR3", targetClass:FFSim.KNIGHT, when:"HP < 60%", numDuplicates:2}
   ,{type:"S", spell:"CUR3", targetClass:FFSim.WHITE_WIZARD, when:"HP < 60%", numDuplicates:1}
   ,{type:"S", spell:"CUR3", targetClass:FFSim.BLACK_WIZARD, when:"HP < 60%", numDuplicates:1}
   ,{type:"S", spell:"CUR3", targetClass:FFSim.NINJA, when:"HP < 60%"}
   ,{type:"S", spell:"CUR3", targetClass:FFSim.RED_WIZARD, when:"HP < 60%"}
   ,{type:"A", targetClass:FFSim.BLACK_WIZARD}
   ,{type:"S", spell:"RUSE", when:"EVASION < 212"}
   ,{type:"S", spell:"INV2", when:"EVASION < 240", numDuplicates:1}
   ,{type:"S", spell:"LIT2"} // try to use the Thor's Hammer
   ,{type:"A", targetClass:FFSim.WHITE_WIZARD}
   ,{type:"A", targetClass:FFSim.MASTER}
   ,{type:"A", targetClass:FFSim.KNIGHT}
   ,{type:"A", targetClass:FFSim.RED_WIZARD}
   ,{type:"A", targetClass:FFSim.NINJA}
  ];
  ai[FFSim.BLACK_WIZARD] = [
    {type:"S", spell:"NUKE"}
   ,{type:"S", spell:"FAST", targetClass:FFSim.MASTER, numDuplicates:1}
   ,{type:"S", spell:"FAST", targetClass:FFSim.KNIGHT, numDuplicates:1}
   ,{type:"S", spell:"ICE3"}
   ,{type:"S", spell:"LIT3"}
   ,{type:"S", spell:"FIR3"}
   ,{type:"A", targetClass:FFSim.BLACK_WIZARD}
   ,{type:"A", targetClass:FFSim.WHITE_WIZARD}
   ,{type:"A", targetClass:FFSim.MASTER}
   ,{type:"A", targetClass:FFSim.KNIGHT}
   ,{type:"A", targetClass:FFSim.RED_WIZARD}
   ,{type:"A", targetClass:FFSim.NINJA}
  ];
  
  FFSim.Action.addAI(name, ai);
  
  var toString = function() {
    var s = "";
    var aCharCode = "a".charCodeAt(0);
    for (var charClass in ai) {
      s += "<b>" + FFSim.fullClassNames[charClass] + "</b>\r\n";
      var i = 0;
      var charAI = ai[charClass];
      
      for (var a in charAI) {
        var rule = charAI[a];
        s += String.fromCharCode(aCharCode + i) + ") ";
        
        switch (rule.type) {
          case "A":
            s += "attacks a " + FFSim.fullClassNames[rule.targetClass];
            break;
          case "S":
            s += "casts " + rule.spell;
            if (rule.targetClass) {
              s += " on a " + FFSim.fullClassNames[rule.targetClass];
            }
            break;
        }
        
        if (rule.when) {
          s += " when " + rule.when;
        }
        
        if (rule.numDuplicates == 1) {
          s += ", exclusively";
        } else if (rule.numDuplicates > 1) {
          s += ", up to " + rule.numDuplicates + " " + FFSim.fullClassNames[charClass] + "s will do this";
        }
        
        s += "\n";
        i++;
      }
      
      s += "\n\n";
    }
    return s;
  };
  
  return {
    NAME : name
   ,toString : toString
  };
})();




