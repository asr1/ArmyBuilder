let app = angular.module('armyBuilder', []);
app.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
}]);
app.controller('builderCtrl', function($scope, $http){
	const CURRENT_FILE_FORMAT_VERSION = 1.0
	
	
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

	$scope.addOnCosts = {};
	$scope.models = {};
	$scope.enabledAddOns = {}
	$scope.chosenPowers = {};
	
	$scope.getGear = function(id) {
		return $scope.gear[id -1];
	}

	$scope.getAbility = function(id) {
		return $scope.abilities[id -1];
	}

	$scope.getPower = function(id) {
		return $scope.powers[id -1];
	}
	
	$scope.getAddon = function(id) {
		return $scope.addons[id -1];
	}
	
	$scope.itemAbilityExists = function(item) {
		return $scope.getGear(item).Ability != "";
	} 

	$scope.unitHasGear = function(unit) {
		return unit.Gear.length > 0;
	}

	$scope.unitAbilityExists = function(unit) {
		return unit.Abilities.length > 0;
	}

	$scope.powerExists = function(unit) {
		return unit.Powers != undefined;
	}

	$scope.unitAddonExists = function(unit) {
		let ret = false;	
		if (unit.AddOns.length === 0) {
			ret = false;
		}
		unit.AddOns.forEach( (id) => {
			const addon = $scope.getAddon(id);
			if(addon.Level === "Unit") {
				ret = true;
			}
		});
		return ret;
	}

	$scope.modelAddonExists = function(unit) {
		let ret = false;
		if (unit.AddOns.length === 0) {
			return false;
		}
		unit.AddOns.forEach( (id) => {
			const addon = $scope.getAddon(id);
			if(addon.Level === "Model") {
				ret = true;
			}
		});
		return ret;
	}
	
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

	$scope.removeFromArmy = function(unit){
		$scope.myArmy.delete(unit);
		$scope.myArmyArray = Array.from($scope.myArmy);
		$scope.models[unit.Name].forEach(model =>
			deregisterAddOnStatus(model.Name));
		
		$scope.models[unit.Name] = [];
		$scope.chosenPowers[unit.Name] = [];
		updateEnabledUnits();
		deregisterAddOnStatus(unit.Name)
	}
	
	$scope.addUnit = function(){
		if (!$scope.selUnit || $scope.selUnit.length == 0) {return;}
		// Add to array if not present in O(selUnit) instead of O(myArmy)
		$scope.selUnit.reduce((set, elem) => set.add(cloneUnit(elem)), $scope.myArmy);
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
		let cost = 0;
		$scope.myArmyArray.forEach((unit) => cost += $scope.calculateUnitCost(unit));
		return cost;
	}

	$scope.setChosenPower = function(isChecked, unit, power, model, powerOptionIndex) {
		initializeChosenPowers(unit, model, powerOptionIndex);
		const amountToAdd = isChecked ? 1 : -1
		$scope.chosenPowers[unit.Name][model.Name][powerOptionIndex] += amountToAdd;
		addPowerToUnit(unit.Name, power, model.Name);
	}

	$scope.ShouldDisablePower = function(unit, power, model, powerOptionIndex, amountAllowed, checked) {
		if(checked) { return false; }
		initializeChosenPowers(unit, model, powerOptionIndex);
		const result = $scope.chosenPowers[unit.Name][model.Name][powerOptionIndex] >= amountAllowed;
		return result;
	}
	
	$scope.shouldDisableUnitAddOn = function(unit, id) {		
		if(!$scope.enabledAddOns[unit.Name]) {return false;}
		const addOn = $scope.getAddon(id);
		if(!addOn.Mutex) {
			return false;
		}
		let shouldDisable = false;
	
		addOn.Mutex.forEach( (conflictId) => {
			if($scope.enabledAddOns[unit.Name][conflictId]) {
				shouldDisable = true;
			}
		});

		return shouldDisable;
	}
	
	$scope.calculateUnitCost = function(unit) {
		return unit.NumberOfModels * unit.Cost + calculateUnitGearCost(unit) + getAddOnCost(unit);
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
				return (unit.Cost + calculateModelGearCost(unit.Gear)) * addOn.Amount;
			break;
		}
	}
	
	$scope.setAddOnCost = function(isChecked, unit, id, model) {
		registerAddOnStatus(id, isChecked, unit.Name, model);
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
					replaceItem(model, addOn.Remove, addOn.Add, unit);
				}                            
				else {                       
					replaceItem(model, addOn.Add, addOn.Remove, unit);
				}
			break;
			case "IncreaseModelNum":
				if(isChecked) {
					increaseNumberOfModels(unit, addOn.Amount);
				}
				else {
					increaseNumberOfModels(unit, -addOn.Amount);
				}
			break;
		}
	}
	
	$scope.addSpaces= function(input){
		const count = 2*($scope.longestUnitNameLength - input.length) + $scope.buffer; 
		let result = "";
		for(let i = 0; i < count; i++){
			result += String.fromCharCode(160);
		}
		return result;
	};
	
	$scope.onUploadFile = function() {
		let file = document.getElementById('UploadArmyInput').files[0];
		let reader = new FileReader();
		reader.readAsText(file);
		reader.onload = () => processUpload(reader.result);
	}
	
	$scope.downloadArmyFile = function() {
		let blob = buildBlob();
		let fileName = "my army.rme";
		let downloadFile = (window.URL || window.webkitURL).createObjectURL( blob );
		
		let a = document.createElement("a");
		a.href = downloadFile;
		a.download = fileName;
		a.click();
		URL.revokeObjectURL(downloadFile) 
	}
	
	//"Private" functions not exposed to HTML
	
	function buildBlob() {
		let parts = [];
		parts = addPartToArray(parts, getHeaderInformation());
		parts = addPartToArray(parts, $scope.selectedGame.Name);
		parts = addPartToArray(parts, "MODELS");
		parts = addPartToArray(parts, $scope.models, true);
		parts = addPartToArray(parts, "ADDONS");
		parts = addPartToArray(parts, $scope.enabledAddOns, true);
		parts = addPartToArray(parts, "END");
		
		return new Blob(parts, {type: 'text/plain'});
	}
	
	function addPartToArray(arr, part, isJson = false) {
		if(isJson) {
			part = [angular.toJson(part, true)]
		}
		part = part + "\n";
		arr.push(part);
		return arr;
	}
	
	function addPowerToUnit(unitName, power, modelName) {
		const model = getModelFromUnit(unitName, modelName);
		if(!model.SelectedPowers) { model.SelectedPowers = []; }
		model.SelectedPowers.push(power);
	}
	
	function getModelFromUnit(unitName, modelName) {
		let ret = undefined;
		$scope.models[unitName].forEach( model => {
			if (model.Name === modelName) { 
				ret = model;
			}
		});
		return ret;
	}
	
	function  getHeaderInformation() {
		return "Army Builder" + "\n" + CURRENT_FILE_FORMAT_VERSION.toFixed(2);
	}
	
	function processUpload(text) {
		console.log(text); //TODO
	}
	
	function increaseNumberOfModels(unit, amount) {
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
	
	function replaceItem(model, oldItem, newItem, unit) {
		$scope.models[unit.Name].forEach((soldier) => {
			if(soldier.Name == model.Name) {// Find the right guy
				let toRemove = -1;
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
	
	 function getAddOnCost(unit) {
		if($scope.addOnCosts[unit] == undefined) {
			$scope.addOnCosts[unit] = 0;
		}
		return $scope.addOnCosts[unit];
	}
	
	function calculateModelGearCost(gearIndexes) {
		let total = 0;
		gearIndexes.forEach((idx) => total += $scope.getGear(idx).Cost);
		return total;
	}
	
	function updateEnabledUnits() {
		$scope.availUnits.forEach((unit) => {
			unit.disabled = $scope.models[unit.Name] != undefined && $scope.models[unit.Name].length > 0;
		});
	}
	
	function calculateUnitGearCost(unit) {
		if($scope.models[unit.Name] == undefined) { return 0; }
		let total = 0;
		$scope.models[unit.Name].forEach( (model) => {
			total += calculateModelGearCost(model.Gear)
		});
		return total;
	}
	
	function cloneUnit(unit) {
		let copy = {};
		copy.Name = unit.Name
		copy.NumberOfModels = unit.NumberOfModels
		copy.Cost = unit.Cost
		copy.SeparateGear = unit.SeparateGear;
		copy.Powers = unit.Powers;
		copy.Abilities = unit.Abilities.slice(0);
		copy.AddOns = unit.AddOns.slice(0);
		copy.Gear = unit.Gear.slice(0);
		return copy;
	}
	
	function initializeChosenPowers(unit, model, powerOptionIndex) {
		if($scope.chosenPowers[unit.Name] == undefined) { $scope.chosenPowers[unit.Name] = []; }
		if($scope.chosenPowers[unit.Name][model.Name] == undefined) { $scope.chosenPowers[unit.Name][model.Name] = []; }
		if($scope.chosenPowers[unit.Name][model.Name][powerOptionIndex] == undefined) { $scope.chosenPowers[unit.Name][model.Name][powerOptionIndex] = 0; }
	}

	function processGear(unit, model) {
		if(!unit.SeparateGear) {
			return;
		}
		let defaultLoadout = [];
		const numProcessed = $scope.models[unit.Name].length
		let processed = false;
		let count = 0;

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

	function registerAddOnStatus(id, isEnabled, unitName, model){
		if(model) {
			if(!$scope.enabledAddOns[model.Name]){
				$scope.enabledAddOns[model.Name] = [];
			}
			$scope.enabledAddOns[model.Name][id] = isEnabled;
		}
		else {
			if(!$scope.enabledAddOns[unitName]){
				$scope.enabledAddOns[unitName] = [];
			}
			$scope.enabledAddOns[unitName][id] = isEnabled;
		}
	}
	
		
	function addModel(unit) {
		let model = cloneUnit(unit);
		model.Name = getModelName(model, unit);
		processGear(unit, model);
		$scope.models[unit.Name].push(model);
	}
	
	function getModelName(model, unit) {
		const numModelsInSquad = $scope.models[unit.Name].length;
		const numSquadNames = unit.SquadNames ? unit.SquadNames.length : 0;
		if (unit.SquadNames == undefined || numSquadNames <= numModelsInSquad) {
			return ret = model.Name + ' ' + ($scope.models[unit.Name].length + 1 - numSquadNames);
		}
		else {
			return ret = unit.SquadNames[numModelsInSquad];
		}
	}
	
	function deregisterAddOnStatus(unitName) {
		if($scope.enabledAddOns[unitName]) {
			$scope.enabledAddOns[unitName] = [];
		}
	}
	
});
