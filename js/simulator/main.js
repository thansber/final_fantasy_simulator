$(document).ready(function() {

  var BATTLE_QUEUE = "battles";
  
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

    var $running = $("#running");
    $running.fadeIn("fast");
    var matchup = party1 + "v" + party2;
    
    clear();
    Simulator.initScore(party1, party2);

    var multipleBattles = (numBattles > 1);
    Output.isConsole = !multipleBattles;
    Output.isRound = !multipleBattles;
    Output.isChars = !multipleBattles;
    $("#results").toggle(!multipleBattles);

    var $queue = $({});
    $queue.delay(500, BATTLE_QUEUE);
    for (var i = 0; i < numBattles; i++) {
      $queue.queue(BATTLE_QUEUE, function(next) {
        executeBattle(matchup);
        next();
      });
      $queue.delay(10, BATTLE_QUEUE);
    }

    $queue.queue(BATTLE_QUEUE, function(next) {
      $running.fadeOut("slow");
      next();
    });
    $queue.dequeue(BATTLE_QUEUE);
  });
    
  var executeBattle = function(matchup) {
    //console.log("=== Battle " + (i + 1) + " ===");
    battle = CharBuilder.setup(matchup);
    var round = 1;
    var victory = false;
    while (!victory) {
      var decider = new DecisionTree.Decider(battle, Level25AI.NAME);
      victory = executeSimulation(decider.round, battle, round);
      if (round > 150) {
        console.log("Battle with matchup " + matchup + " took > 150 rounds, did not finish");
        break;
      }
      round++;
    }
  };
  
  var executeSimulation = function(round, battle, roundNum) {
    var result = Simulator.simulateRound(round, battle, roundNum);
    if (Output.isChars) {
      $("#chars").empty();
      jQuery(battle.allChars).each(function() { 
        Output.displayChar(this, $("#chars")); 
      });
    }
    if (result.victory) {
      Simulator.incrementScore(result.winner);
      //console.log(result.winner + " wins");
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