class Game { //One game will have a number of armies that fight each other.
	Army = [];
}

//I can combine multiple factions in one army.
class Army {
  factions = [];
}

class Faction {
	units = [];
}

class Unit {
	constructor(unitName, numTroops, unitCost, unitAbility) {
		this.name = unitName;
		this.numberOfTroops = numTroops;
		this.cost = unitCost;
		this.ability = unitAbility;
		this.addOns = [];
		this.gear = [];
		this.setAddOns() = {};
	}
}

// An AddOn is an optional state a unit can take on (like adding an extra piece or starting in orbit)
class AddOn {
	constructor(addOnName, addOnCost, unitCost, addOnAbility) {
		this.name = addOnName;
		this.cost = addOnCost;
		this.text = addOnAbility;
		this.isSelected = false;
	}
}

class Gear {
	constructor(gearCost) {
		this.cost = gearCost;
	}
}