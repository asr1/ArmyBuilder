var app = angular.module('armyBuilder', []);

app.controller('builderCtrl', function($scope, $http){
	$http.get('data/squads.json').then(function(res){
		$scope.games = res.data[Object.keys(res.data)[0]];
		$scope.selectedGame = $scope.games[0];
	});
	$http.get('data/items.json').then(function(res){
		$scope.gear = res.data[Object.keys(res.data)[0]];
	});
	$http.get('data/abilities.json').then(function(res){
		$scope.abilities = res.data[Object.keys(res.data)[0]];
	});
	$http.get('data/addons.json').then(function(res){
		$scope.addons = res.data[Object.keys(res.data)[0]];
	});
	$http.get('data/powers.json').then(function(res){
		$scope.powers = res.data[Object.keys(res.data)[0]];
	});
	$scope.selFac = null;
	$scope.availUnits = null;
	$scope.longestUnitNameLength = 0;
	$scope.buffer = 5; //Padding for addSpaces
	$scope.myArmy = new Set();
	$scope.myArmyArray = [];
	$scope.armyCost = 0; // alternatively could have a calculate ArmyCost function

	$scope.addOnCosts = {};
	$scope.models = {};
	$scope.enabledAddOns = {}

	$scope.processUnits = function() {
			$scope.availUnits = [];
			if(Array.isArray($scope.selFac)) {
				for(let i = 0; i < $scope.selFac.length; i++) {
					$scope.availUnits = $scope.availUnits.concat($scope.selFac[i].Units);
				}
			}
			$scope.availUnits.forEach((unit) => {
				if(unit.Name.length > $scope.longestUnitNameLength) {
					$scope.longestUnitNameLength = unit.Name.length;
				}
			});
	}
	
	$scope.getGear = function(id) {
		return $scope.gear[id -1];
	}

	$scope.getPowers = function(discipline) { //TODO redo this

		if($scope.powers){
			$scope.powers.forEach( (power) => {
				if(power.Discipline === discipline) {
					return power.Powers;
				}
			});
		}
	}
	
	$scope.itemAbilityExists = function(item) {
		return $scope.getGear(item).Ability != "";
	} 

	$scope.unitAbilityExists = function(unit) {
		return unit.Abilities.length > 0;
	}

	$scope.unitAddonExists = function(unit) {
		return unit.AddOns.length > 0;
	}
	
	$scope.getAbility = function(id) {
		return $scope.abilities[id -1];
	}
	
	$scope.getAddon = function(id) {
		return $scope.addons[id -1];
	}
	
	$scope.removeFromArmy = function(unit){
		$scope.myArmy.delete(unit);
		$scope.myArmyArray = Array.from($scope.myArmy); 
		$scope.models[unit.Name] = [];
		updateEnabledUnits();
	}
	
	$scope.addUnit = function(){
		// Add to array if not present in O(selUnit) instead of O(myArmy)
		$scope.selUnit.reduce((set, elem) => set.add(elem), $scope.myArmy);
		$scope.myArmyArray = Array.from($scope.myArmy); 
		
		$scope.selUnit.forEach( (unit) => {
			if($scope.models[unit.Name] == undefined) {
				$scope.models[unit.Name] = [];
			}
			for(let i = 0; i < unit.NumberOfModels; i++) {
				addModel(unit);
			}
		});
		
		updateEnabledUnits();
	}
	
	$scope.calculateArmyCost = function(){
		var cost = 0;
		$scope.myArmyArray.forEach((unit) => cost += $scope.calculateUnitCost(unit));
		return cost;
	}
	
	$scope.calculateModelGearCost = function(gearIndexes) {
		var total = 0;
		gearIndexes.forEach((idx) => total += $scope.getGear(idx).Cost);
		return total;
	}
	
	function updateEnabledUnits() {
		$scope.availUnits.forEach((unit) => {
			unit.disabled = $scope.models[unit.Name] != undefined && $scope.models[unit.Name].length > 0;
		});
	}
	
	function cloneUnit(unit) {
		var copy = {};
		copy.Name = unit.Name
		copy.NumberOfModels = unit.NumberOfModels
		copy.Cost = unit.Cost
		copy.Abilities = unit.Abilities.slice(0);
		copy.AddOns = unit.AddOns.slice(0);
		copy.Gear = unit.Gear.slice(0);
		return copy;
	}

	$scope.getAddOnCost =function(unit){
		if($scope.addOnCosts[unit] == undefined) {
			$scope.addOnCosts[unit] = 0;
		}
		return $scope.addOnCosts[unit];
	}
	
	$scope.calculateAddOnCost = function(addOn, unit) {
		switch(addOn.Type) {
			case "Direct": 
				return addOn.Cost
			break;
			case "ReplaceItem":
				return $scope.getGear(addOn.Add).Cost - $scope.getGear(addOn.Remove).Cost;
			break;
			case "IncreaseModelNum":
				return (unit.Cost + $scope.calculateModelGearCost(unit.Gear)) * addOn.Amount;
			break;
		}
	}
	
	$scope.replaceItem = function(model, oldItem, newItem, unit) {
		$scope.models[unit.Name].forEach((soldier) => {
			if(soldier.Name == model.Name) {// Find the right guy
				var toRemove = -1;
				soldier.Gear.forEach((item, idx) => {
					if(item === oldItem) {
						toRemove = idx;
					}
				});
				soldier.Gear.splice(toRemove, 1);
				soldier.Gear.push(newItem);
			}
		});
	}
	
	$scope.shouldDisableUnitAddOn = function(unit, id) {		
		if(!$scope.enabledAddOns[unit.Name]) {return false;}
		const addOn = $scope.getAddon(id);
		if(!addOn.Mutex) {
			return false;
		}
		var shouldDisable = false;
	
		addOn.Mutex.forEach( (conflictId) => {
			if($scope.enabledAddOns[unit.Name][conflictId]) {
				shouldDisable = true;
			}
		});

		return shouldDisable;
	}

	function addModel(unit) {
		var model = cloneUnit(unit);
		model.Name += ' ' + ($scope.models[unit.Name].length + 1);
		processGear(unit, model);
		$scope.models[unit.Name].push(model);
	}
	
	function processGear(unit, model) {
		if(!unit.SeparateGear) {
			return;
		}
		let defaultLoadout = [];
		var numProcessed = $scope.models[unit.Name].length
		var processed = false;
		var count = 0;

		for(let i = 0; i < unit.SeparateGear.length; i++) {
			count += unit.SeparateGear[i].Number;
			if(unit.SeparateGear[i].Default) {
				
				defaultLoadout = unit.SeparateGear[i].Loadout;
			}
			if(count <= numProcessed) {
				continue;
			}
			else {
				model.Gear = model.Gear.concat(unit.SeparateGear[i].Loadout);
				processed = true;
				break;
			}
		}
		
		if(!processed) {
			model.Gear = model.Gear.concat(defaultLoadout);
		}
		return model;
	}

	$scope.increaseNumberOfModels = function(unit, amount) {
		$scope.myArmyArray.forEach((elem) => {
			if(elem.Name == unit.Name) {
				elem.NumberOfModels += amount;
			}
		});
		if(amount > 0){
			addModel(unit);
		}
		else {
			amount *= -1;
			for(let i = 0; i < amount; i++);
			$scope.models[unit.Name].pop();
		}
	}

	function registerAddOnStatus(id, isEnabled, unitName){
		if(!$scope.enabledAddOns[unitName]){
			$scope.enabledAddOns[unitName] = [];
		}
		$scope.enabledAddOns[unitName][id] = isEnabled;
	}
	
	$scope.setAddOnCost = function(isChecked, unit, id, model) {
		registerAddOnStatus(id, isChecked, unit.Name);
		const addOn = $scope.getAddon(id);
		switch(addOn.Type) {
			case "Direct": 
				isChecked ?
					$scope.addOnCosts[unit] += addOn.Cost
					:
					$scope.addOnCosts[unit] -= addOn.Cost;
			break;
			case "ReplaceItem":
				if(isChecked) {
					$scope.replaceItem(model, addOn.Remove, addOn.Add, unit);
				}                            
				else {                       
					$scope.replaceItem(model, addOn.Add, addOn.Remove, unit);
				}
			break;
			case "IncreaseModelNum":
				if(isChecked) {
					$scope.increaseNumberOfModels(unit, addOn.Amount);
				}
				else {
					$scope.increaseNumberOfModels(unit, -addOn.Amount);
				}
			break;
		}
	}
	
	$scope.calculateUnitCost = function(unit) {
		return unit.NumberOfModels * unit.Cost + $scope.calculateUnitGearCost(unit) + $scope.getAddOnCost(unit);
	}
	
	$scope.calculateUnitGearCost = function(unit) {
		if($scope.models[unit.Name] == undefined) { return 0; }
		var total = 0;
		$scope.models[unit.Name].forEach( (model) => {
			total += $scope.calculateModelGearCost(model.Gear)
		});
		return total;
	}
	
	$scope.addSpaces= function(input){
		var count = 2*($scope.longestUnitNameLength - input.length) + $scope.buffer; 
		var result = "";
		for(var i = 0; i < count; i++){
			result += String.fromCharCode(160);
		}
		return result;
	};
});
