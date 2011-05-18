var Element = (function() {
  
  var ALL = {
    Fire : "fire"
   ,Ice : "ice"
   ,Lightning : "lit"
   ,Earth : "earth"
   ,Death : "death"
   ,Time : "time"
   ,PoisonStone : "poison/stone"
   ,Status : "status"
  };
  
  return {
    Fire : ALL.Fire
   ,Ice : ALL.Ice
   ,Lightning : ALL.Lightning
   ,Earth : ALL.Earth
   ,Death : ALL.Death
   ,Time : ALL.Time
   ,PoisonStone : ALL.PoisonStone
   ,Status : ALL.Status
   ,AllElements : [ALL.Fire, ALL.Ice, ALL.Lightning, ALL.Earth, ALL.Death, ALL.Time, ALL.PoisonStone, ALL.Status]
  };
})();

var Status = (function() {
  
  var ALL = {
    Dead : "dead"
   ,Petrified : "stone"
   ,Poisoned : "poison"
   ,Blind : "blind"
   ,Paralyzed : "paralyzed"
   ,Asleep : "sleep"
   ,Silenced : "mute"
   ,Confused : "confuse"
  };
  
  return {
    Dead : ALL.Dead
   ,Petrified : ALL.Petrified
   ,Poisoned : ALL.Poisoned
   ,Blind : ALL.Blind
   ,Paralyzed : ALL.Paralyzed 
   ,Asleep : ALL.Asleep 
   ,Silenced : ALL.Silenced
   ,Confused : ALL.Confused
   ,AllStatuses : [ALL.Dead, ALL.Petrified, ALL.Poisoned, ALL.Blind, ALL.Paralyzed, ALL.Asleep, ALL.Silenced, ALL.Confused]
   ,AllExceptDead : [ALL.Petrified, ALL.Poisoned, ALL.Blind, ALL.Paralyzed, ALL.Asleep, ALL.Silenced, ALL.Confused] 
  };
})();