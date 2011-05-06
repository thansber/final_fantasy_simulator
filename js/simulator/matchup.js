var Matchup = (function() {
  
  var classes = {
   "Fi" : {name:"Fi", order:100000}
  ,"Th" : {name:"Th", order:10000}
  ,"BB" : {name:"BB", order:1000}
  ,"RM" : {name:"RM", order:100}
  ,"WM" : {name:"WM", order:10}
  ,"BM" : {name:"BM", order:1}
  };
  
  var classSort = function(a, b) {
    return b.order - a.order;
  };
  
  var partySort = function(partyA, partyB) {
    var partySumA = 0, partySumB = 0;
    for (var p in partyA) {
      partySumA += partyA[p].order;
    }
    for (var p in partyB) {
      partySumB += partyB[p].order;
    }
    return partySumB - partySumA;
  }
  
  var partyFromArray = function(partyArray) {
    var party = [];
    for (var p in partyArray) {
      party.push(classes[partyArray[p]]);
    }
    party.sort(classSort);
    return party;
  };
  
  var partyFromText = function(partyText) {
    return partyFromArray(partyText.split("-"));
  };
  
  var partyAsText = function(party) {
    var text = "";
    for (var p in party) {
      text += party[p].name + "-";
    }
    return text.substr(0, text.length - 1);
  };
  
  var createAllCombinations = function() {
    var everythingWithDuplicates = [];
    jQuery.each(classes, function(i, char1) {
      jQuery.each(classes, function(i, char2) {
        jQuery.each(classes, function(i, char3) {
          jQuery.each(classes, function(i, char4) {
            everythingWithDuplicates.push(partyFromArray([char1.name, char2.name, char3.name, char4.name]));
          });
        });
      });
    });
    
    everythingWithDuplicates.sort(partySort);
    
    var uniqueCombos = {};
    for (var e in everythingWithDuplicates) {
      uniqueCombos[partyAsText(everythingWithDuplicates[e])] = true;
    }

    var combos = [];
    for (var u in uniqueCombos) {
      combos.push(u);
    }
    
    return combos;
  };
  
  var initSelectors = function($selectors) {
    var combos = createAllCombinations();
    $selectors.empty();
    $selectors.append($("<option/>").val("").html(" -- Select a Party -- "));
    for (var c in combos) {
      $selectors.append($("<option/>").val(combos[c]).html(combos[c]));
    }
  };
  
  return {
    createAllCombinations : createAllCombinations
   ,initSelectors : initSelectors
   ,partyAsText : partyAsText
   ,partyFromArray : partyFromArray
   ,partyFromText : partyFromText
  };
})();