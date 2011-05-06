$(document).ready(function() {

    Matchup.initSelectors($("#matchup .selector"));
    
    $("#matchup .selector").change(function() {
      var $this = $(this);
      var $images = $this.closest(".party").find(".char");
      $images.attr("class", "").addClass("char"); // clears out previous class-specific CSS
      
      if ($this.val().length == 0) {
        return;
      }
      var party = Matchup.partyFromText($this.val());
      for (var i = 0; i < party.length; i++) {
        $images.eq(i).addClass(party[i].name);
      }
    });
    
    $("#start").click(function() {
      var party1 = $("#matchup .party:eq(0) .selector").val();
      var party2 = $("#matchup .party:eq(1) .selector").val();
      
      if (party1.length == 0 || party2.length == 0) {
        alert("Please select 2 parties to simulate");
        return false;
      }

      var numBattles = parseInt($("#numBattles").val(), 10);
      if (isNaN(numBattles)) {
        alert("Enter a number for the number of battles to run");
        return false;
      }

      var matchup = party1 + "v" + party2;
      console.log(matchup);
      
      clear();
      var battle = FFSim.charBuilder.setup(matchup);
      FFSim.initScore(party1, party2);

      var multipleBattles = (numBattles > 1);
      FFSim.Output.isConsole = !multipleBattles;
      FFSim.Output.isRound = !multipleBattles;
      FFSim.Output.isChars = !multipleBattles;
      $("#results").toggle(!multipleBattles);
      
      for (var i = 0; i < numBattles; i++) {
        console.log("=== Battle " + (i + 1) + " ===");
        battle = FFSim.charBuilder.setup(matchup);
        var round = 1;
        var victory = false;
        while (!victory) {
          $("#chars").empty();
          var decider = new FFSim.Action.DecisionMaker(battle, FFSim.Action.Level25Choices);
          victory = executeSimulation(decider.round, battle, round);
          if (round > 50) {
            break;
          }
          round++;
        }
      }
    });
    
    
    
    
    
    
    $("#manual").click(function() {
        clear();
        var battle = FFSim.charBuilder.setup(matchup);
        // ------------------- INSERT CHANGES FROM PREV ROUND HERE ---------------------------
        /*
battle.allChars[0].applyChangesFromPrevRound({hp:55,hitMultiplier:1,spellDef:0,spellAttack:0,spellEvasion:0,spellCharges:[4,4,4,3,0,0,0,0],statuses:[""],elementsProtectedFrom:["fire","ice","death"]});
battle.allChars[1].applyChangesFromPrevRound({hp:153,hitMultiplier:2,spellDef:0,spellAttack:0,spellEvasion:0,spellCharges:[],statuses:[""],elementsProtectedFrom:["fire","ice","lit","earth","death","time","poison/stone","status"]});
battle.allChars[2].applyChangesFromPrevRound({hp:0,hitMultiplier:1,spellDef:0,spellAttack:0,spellEvasion:0,spellCharges:[9,7,6,6,5,5,3,0],statuses:["dead"],elementsProtectedFrom:["fire","ice","lit","earth","death","time","poison/stone","status"]});
battle.allChars[3].applyChangesFromPrevRound({hp:0,hitMultiplier:1,spellDef:0,spellAttack:0,spellEvasion:0,spellCharges:[9,7,6,6,5,5,3,0],statuses:["dead"],elementsProtectedFrom:["fire","ice","lit","earth","death","time","poison/stone","status"]});
battle.allChars[4].applyChangesFromPrevRound({hp:339,hitMultiplier:1,spellDef:0,spellAttack:0,spellEvasion:0,spellCharges:[4,4,4,0,0,0,0,0],statuses:[""],elementsProtectedFrom:["fire","ice","lit","poison/stone","death"]});
battle.allChars[5].applyChangesFromPrevRound({hp:213,hitMultiplier:2,spellDef:0,spellAttack:0,spellEvasion:0,spellCharges:[],statuses:[""],elementsProtectedFrom:["fire","ice","lit","earth","death","time","poison/stone","status"]});
battle.allChars[6].applyChangesFromPrevRound({hp:37,hitMultiplier:1,spellDef:0,spellAttack:0,spellEvasion:0,spellCharges:[9,7,6,5,5,3,0,0],statuses:[""],elementsProtectedFrom:["fire","ice","lit","earth","death","time","poison/stone","status"]});
battle.allChars[7].applyChangesFromPrevRound({hp:0,hitMultiplier:1,spellDef:0,spellAttack:0,spellEvasion:0,spellCharges:[9,7,6,6,5,5,3,0],statuses:["dead"],elementsProtectedFrom:["fire","ice","lit","earth","death","time","poison/stone","status"]});
*/
        // ------------------- INSERT CHANGES FROM PREV ROUND HERE ---------------------------
        var group1 = battle.group1.chars;
        var group2 = battle.group2.chars;
        var chars = battle.allChars;
        
        FFSim.buildScore(battle);
        
        var round = [
          new FFSim.Output.Result(function() { return FFSim.attack(chars[1], chars[5]); })
         ,new FFSim.Output.Result(function() { return FFSim.castSpell(chars[3], "FAST", chars[0]); })
         ,new FFSim.Output.Result(function() { return FFSim.castSpell(chars[2], "FAST", chars[1]); })
         ,new FFSim.Output.Result(function() { return FFSim.attack(chars[5], chars[1]); })
         ,new FFSim.Output.Result(function() { return FFSim.castSpell(chars[6], "FAST", chars[5]); })
         ,new FFSim.Output.Result(function() { return FFSim.attack(chars[0], chars[5]); })
         ,new FFSim.Output.Result(function() { return FFSim.castSpell(chars[7], "FAST", chars[4]); })
         ,new FFSim.Output.Result(function() { return FFSim.attack(chars[4], chars[1]); })
        ];

        var victory = executeSimulation(round, battle, 1);
        
        if (!victory) {
            // Save the current status of all chars from the previous round
            $("#currentRoundStatus").html(FFSim.BetweenRounds.charsToJson(battle));
        }
    });
    
    $("#auto").click(function() {
        clear();
        var battle = FFSim.charBuilder.setup(matchup);
        
        FFSim.buildScore(battle);
        
        FFSim.Output.isConsole = true;
        FFSim.Output.isRound = true;
        FFSim.Output.isChars = true;
        
        var round = 1;
        var victory = false;
        while (!victory) {
            $("#chars").empty();
            var decider = new FFSim.Action.DecisionMaker(battle, FFSim.Action.Level25Choices);
            victory = executeSimulation(decider.round, battle, round);
            if (round > 50) {
                break;
            }
            round++;
        }
    });
    
    $("#autoMultiple").click(function() {
        clear();
        var battle = FFSim.charBuilder.setup(matchup);
        FFSim.buildScore(battle);

        var numBattles = parseInt($("#numBattles").val(), 10);
        if (isNaN(numBattles)) {
            alert("Enter a number dumbass");
            return false;
        }

        FFSim.Output.isConsole = false;
        FFSim.Output.isRound = false;
        FFSim.Output.isChars = false;
        
        for (var i = 0; i < numBattles; i++) {
            console.log("=== Battle " + (i + 1) + " ===");
            battle = FFSim.charBuilder.setup(matchup);
            var round = 1;
            var victory = false;
            while (!victory) {
                var decider = new FFSim.Action.DecisionMaker(battle, FFSim.Action.Level25Choices);
                victory = executeSimulation(decider.round, battle, round);
                if (round > 50) {
                    break;
                }
                round++;
            }
        }
    });
    
    $("#clear").click(function() { clear(); });
    
    var executeSimulation = function(round, battle, roundNum) {
        var result = FFSim.simulateRound(round, battle, roundNum);
        jQuery(battle.allChars).each(function() { FFSim.displayChar(this, $("#chars")); });
        if (result.victory) {
            FFSim.incrementScore(result.winner);
            console.log(result.winner + " wins");
        }
        
        if (FFSim.Output.isRound) {
          $("#ffdSetup").html(FFSim.displayCharNames(battle) + FFSim.displayWeapons(battle));
        }
        return result.victory;
    }
    
    var clear = function() {
        $("textarea").empty();
        $("#chars").empty();
        
        var consoleAPI;
        if (typeof console.clear !== "undefined") {
          console.clear();
        } else {
          console.log(new Array(25).join("\n"));
        }
    };
    
});