var FFD_RNG = (function() {

    var randomUpTo = function(max, min) {
        if (min == null) {
            min = 1;
        }
        return Math.floor(Math.random() * (max + 1 - min)) + min;
    };
    
    var percent = function(pct) {
        return (randomUpTo(100) <= pct);
    }
    
    return { 
        randomUpTo : randomUpTo
       ,percent : percent
    };
})();


