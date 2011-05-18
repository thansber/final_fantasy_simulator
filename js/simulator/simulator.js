var Simulator = (function() {
  
  var NEWLINE = "\r\n";
  
  var simulateRound = function(round, battle, roundNum) {
    var $output = $("#output");
    var out = $output.text();
    var victory = false;
    var winnerGroup = "", winnerGroupIndex = -1;
    var group1 = battle.group1;
    var group2 = battle.group2;
    
    Output.log("================== ROUND " + (roundNum ? roundNum + " " : "") + "OUTPUT ==================");
    if (roundNum) {
      var roundHeader = "ROUND " + roundNum;
      if (roundNum == 1) {
        roundHeader += " - " + group1.name + " vs " + group2.name;
        out += fill("=", roundHeader.length) + NEWLINE;
      }
      
      out += roundHeader + NEWLINE;
    }
    
    randomizeRound(round);
    jQuery(round).each(function(i) {
      out += this.toString(); 
      if (isGroupDead(group1.chars)) {
        victory = true;
        winnerGroup = group2.name;
        winnerGroupIndex = 1;
        return false;
      } else if (isGroupDead(group2.chars)) {
        victory = true;    
        winnerGroup = group1.name;
        winnerGroupIndex = 0;
        return false;
      }
    });
    
    if (victory) {
      out += NEWLINE + winnerGroup + " Wins!" + NEWLINE + NEWLINE;
    } else {
      out += displayGroupAfterRound(group1.chars);
      out += displayGroupAfterRound(group2.chars);
      out += NEWLINE;
    }
    
    if (Output.isRound) {
        $output.text(out);
    }
    
    return {victory:victory, winner:winnerGroup};
  };
  
  var initScore = function(party1, party2) {
    $("#matchup .party:eq(0)").addClass(party1).find(".score").html("0");
    $("#matchup .party:eq(1)").addClass(party2).find(".score").html("0");
  };

  var incrementScore = function(groupName) {
    var $score = $("#matchup .party." + groupName + " .score");
    var currentScore = parseInt($score.html(), 10);
    $score.html(++currentScore);
  };
  
  var displayGroupAfterRound = function(group) {
    var out = NEWLINE;
    for (var c in group) {
      var ch = group[c]; 
      if (!ch.isDead()) {
        out += ch.charName + " - " + ch.hitPoints + "/" + ch.maxHitPoints;
        out += ", remaining spell charges: " + ch.spellChargesToString();
        out += NEWLINE; 
      }
    }
    return out;
  };
  
  var fill = function(ch, num) {
    var s = "";
    for (var i = 0; i < num; i++) {
        s += ch;
    }
    return s;
  };
  
  var isGroupDead = function(chars) {
    for (var c in chars) {
      if (!chars[c].isDead()) {
        return false;
      }
    }
    return true;
  };
  
  //fisherYates 
  var randomizeRound = function(myArray) {
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
  
  return {
    simulateRound : simulateRound
   ,initScore : initScore
   ,incrementScore : incrementScore
  };
})();