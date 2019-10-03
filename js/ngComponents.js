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
	$scope.selFac = null;
	$scope.availUnits = null;
	$scope.longestUnitNameLength = 0;
	$scope.buffer = 5; //Padding for addSpaces
	$scope.myArmy = new Set();
	$scope.myArmyArray = [];
	$scope.armyCost = 0; // alternatively could have a calculate ArmyCost function

	$scope.addOnCosts = {};

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
	
	$scope.getAbility = function(id) {
		return $scope.abilities[id -1];
	}
	
	$scope.getAddon = function(id) {
		return $scope.addons[id -1];
	}
	
	$scope.removeFromArmy = function(unit){
		$scope.myArmy.delete(unit);
		$scope.myArmyArray = Array.from($scope.myArmy); 
	}
	
	$scope.calculateArmyCost = function(){
		var cost = 0;
		//TODO 1 below is wrong
		$scope.myArmyArray.forEach((unit) => cost += $scope.calculateUnitCost(1, unit));
		return cost;
	}
	
	$scope.calculateGearCost = function(gearIndexes) {
		var total = 0;
		gearIndexes.forEach((idx) => total += $scope.getGear(idx).Cost);
		return total;
	}
	
	$scope.addUnit = function(){
		// Add to array if not present in O(selUnit) instead of O(myArmy)
		$scope.selUnit.reduce((set, elem) => set.add(elem), $scope.myArmy);
		$scope.myArmyArray = Array.from($scope.myArmy); 
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
				return $scope.calculateUnitCost(1, unit);
			break;
		}
	}
	
	$scope.replaceItem = function(unit, oldItem, newItem) {
		$scope.myArmyArray.forEach((elem) => {
			if(elem.Name == unit.Name) {// Find the right unit
				var toRemove = -1;
				elem.Gear.forEach((item, idx) => {
					if(item === oldItem) {
						toRemove = idx;
					}
				});
				elem.Gear.splice(toRemove, 1);
				elem.Gear.push(newItem);
			}
		});
	}
	
	$scope.increaseNumberOfModels = function(unit, amount) {
		$scope.myArmyArray.forEach((elem) => {
			if(elem.Name == unit.Name) {
				elem.NumberOfModels += amount;
			}
		});
	}
	
	$scope.setAddOnCost = function(isChecked, unit, addOn) {
		switch(addOn.Type) {
			case "Direct": 
				isChecked ?
					$scope.addOnCosts[unit] += addOn.Cost
					:
					$scope.addOnCosts[unit] -= addOn.Cost;
			break;
			case "ReplaceItem":
				if(isChecked) {
					$scope.replaceItem(unit, addOn.Remove, addOn.Add);
				}                            
				else {                       
					$scope.replaceItem(unit, addOn.Add, addOn.Remove);
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
	
	$scope.calculateUnitCost = function(num, unit) {
		return unit.NumberOfModels * num * (unit.Cost + $scope.calculateGearCost(unit.Gear)) + $scope.getAddOnCost(unit);
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
