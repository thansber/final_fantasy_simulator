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
    
    clear();
    var battle = FFSim.charBuilder.setup(matchup);
    FFSim.initScore(party1, party2);

    var multipleBattles = (numBattles > 1);
    FFSim.Output.isConsole = !multipleBattles;
    FFSim.Output.isRound = !multipleBattles;
    FFSim.Output.isChars = !multipleBattles;
    $("#results").toggle(!multipleBattles);
    
    for (var i = 0; i < numBattles; i++) {
      //console.log("=== Battle " + (i + 1) + " ===");
      battle = FFSim.charBuilder.setup(matchup);
      var round = 1;
      var victory = false;
      while (!victory) {
        $("#chars").empty();
        var decider = new FFSim.Action.DecisionMaker(battle, FFSim.Level25AI.NAME);
        victory = executeSimulation(decider.round, battle, round);
        if (round > 50) {
          break;
        }
        round++;
      }
    }
  });
    
  var executeSimulation = function(round, battle, roundNum) {
    var result = FFSim.simulateRound(round, battle, roundNum);
    jQuery(battle.allChars).each(function() { FFSim.displayChar(this, $("#chars")); });
    if (result.victory) {
      FFSim.incrementScore(result.winner);
      //console.log(result.winner + " wins");
    }
    
    if (FFSim.Output.isRound) {
      $("#ffdSetup").html(FFSim.displayCharNames(battle) + FFSim.displayWeapons(battle));
    }
    return result.victory;
  }
  
  var clear = function() {
    $("textarea").empty();
    $("#chars").empty();
    
    if (typeof console.clear !== "undefined") {
      console.clear();
    } else {
      console.log(new Array(25).join("\n"));
    }
  };
   
  var matchupFromUrl = $.getUrlVar("matchup");
  if (matchupFromUrl) {
    var matchup = matchupFromUrl.split("v");
    $("#matchup .selector:eq(0)").val(matchup[0]).change();
    $("#matchup .selector:eq(1)").val(matchup[1]).change();
  }
  
});