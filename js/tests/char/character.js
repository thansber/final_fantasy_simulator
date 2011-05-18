$(document).ready(function() {
  module("Character functions");

  test("has an item for a spell", function() {
    var battle = CharBuilder.setup("Fi-Th-Th-BMvRM-RM-RM-RM");
    var redWizardWithWhiteShirt = battle.group2.chars[1];
    ok(redWizardWithWhiteShirt.hasItemForSpell("INV2"));
  });
  
  test("has a White[R] for INV2", function() {
    var battle = CharBuilder.setup("Fi-Th-Th-BMvRM-RM-RM-RM");
    var redWizardWithWhiteShirt = battle.group2.chars[1];
    deepEqual(redWizardWithWhiteShirt.getItemForSpell("INV2"), Equipment.Armor.lookup("White[R]"), "Red Wizard should have a White[R] to cast INV2");
  });
  
});