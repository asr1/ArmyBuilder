let app = angular.module('armyBuilder', []);
app.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
}]);
app.controller('builderCtrl', function($scope, $http){
	const CURRENT_FILE_FORMAT_VERSION = 1.0
	const HEADER_FIRST_LINE = "Army Builder";
	
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
	$scope.addOnIndexes = new Set();
	
	$scope.allFacs = new Set();
	
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
					$scope.allFacs.add($scope.selFac[i]);
				}
			}
			$scope.availUnits.forEach((unit) => {
				if(unit.Name.length > $scope.longestUnitNameLength) {
					$scope.longestUnitNameLength = unit.Name.length;
				}
			});
			updateEnabledUnits();
	}
	
	$scope.shouldDisableDownloadButton = function() {
		return $scope.myArmyArray.length <= 0;
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
	
	$scope.addUnits = function(units){
		if (!units || units.length == 0) {return;}
		// Add to array if not present in O(selUnit) instead of O(myArmy)
		units.reduce((set, elem) => set.add(cloneUnit(elem)), $scope.myArmy);
		$scope.myArmyArray = Array.from($scope.myArmy); 
		units.forEach( (unit) => {
			if($scope.models[unit.Name] == undefined) {
				$scope.models[unit.Name] = [];
			}
			if(!unit.StartingNumberOfModels) {
				unit.StartingNumberOfModels = unit.NumberOfModels;
			}
			let numUnits = unit.StartingNumberOfModels;
			for(let i = 0; i < numUnits; i++) {
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

	$scope.setChosenPower = function(isChecked, unitName, power, modelName, powerOptionIndex, checkboxIndex) {
		initializeChosenPowers(unitName, modelName, powerOptionIndex);
		const amountToAdd = isChecked ? 1 : -1
		$scope.chosenPowers[unitName][modelName][powerOptionIndex] += amountToAdd;
		addPowerToUnit(unitName, power, modelName, powerOptionIndex, checkboxIndex);
	}

	$scope.ShouldDisablePower = function(unitName, power, modelName, powerOptionIndex, amountAllowed, checked) {
		if(checked) { return false; }
		initializeChosenPowers(unitName, modelName, powerOptionIndex);
		const result = $scope.chosenPowers[unitName][modelName][powerOptionIndex] >= amountAllowed;
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
	
	$scope.getAddOnId = function(isUnitLevel, name, index) {
		return isUnitLevel ? name + ' unit add on&' + index : name + ' model add on&' + index;
	}
	
	$scope.setAddOnCost = function(isChecked, unit, addOnId, model, idx) {
		registerAddOnStatus(addOnId, isChecked, unit.Name, model, idx);
		const addOn = $scope.getAddon(addOnId);
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
		clearArmy();
		let file = document.getElementById('UploadArmyInput').files[0];
		let reader = new FileReader();
		reader.readAsText(file);
		reader.onload = () => processUpload(reader.result);
	}
	
	$scope.getPowerId = function(modelName, parentIdx, powerIdx){
		return modelName + ' &section#' + parentIdx + ' &checkbox#' + powerIdx;
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
	
	function clearArmy() {
		$scope.myArmyArray.forEach( unit => $scope.removeFromArmy(unit));
	}
	
	function buildBlob() {
		let parts = [];
		parts = addPartToArray(parts, getHeaderInformation());
		parts = addPartToArray(parts, $scope.selectedGame.Name);
		parts = addPartToArray(parts, "FACTIONS");
		parts = addPartToArray(parts,  Array.from($scope.allFacs), true);
		parts = addPartToArray(parts, "UNITS");
		$scope.myArmyArray.forEach( unit => { if(unit.StartingNumberOfModels) { unit.NumberOfModels = unit.StartingNumberOfModels } });
		parts = addPartToArray(parts, $scope.myArmyArray, true);
		parts = addPartToArray(parts, "MODELS");
		parts = addPartToArray(parts, $scope.models, true);
		parts = addPartToArray(parts, "ADDONS");
		parts = addPartToArray(parts, Array.from($scope.addOnIndexes), true);
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
	
	function addPowerToUnit(unitName, power, modelName, parentIdx, powerIdx) {
		const model = getModelFromUnit(unitName, modelName);
		if(!model.SelectedPowers) { model.SelectedPowers = []; }
		var id = $scope.getPowerId(modelName, parentIdx, powerIdx);
		model.SelectedPowers.push(id);
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
		return HEADER_FIRST_LINE + "\n" + CURRENT_FILE_FORMAT_VERSION.toFixed(1);
	}
	
	function processUpload(text) {
		let allText = text.split('\n');
		
		if(!validateRMEFile(allText.shift())){
			showError(errorMessages.InvalidFileFormat);
		}
		const processor = getProcessorFromVersion(allText.shift())
		if(processor) {
			processor.buildArmyFromFile(allText);
		}
	}
	
	function getProcessorFromVersion(version) {
		try {
			version = parseInt(version).toFixed(1) + '';
		}
		catch {
			showError(errorMessages.InvalidVersion);
			return null;
		}
		switch(version) {
			case '1.0':
				return new Warhammer40k8eVersionOneProcessor();
			default:
				showError(errorMessages.InvalidVersion);
				return null;
		}
	}
	
	class Warhammer40k8eVersionOneProcessor {
		buildArmyFromFile(text) {
			let models;
			
			$scope.selectedGame = this.getGameFromName(text.shift());
			if(text) { text = this.processFactions(text); }
			if(text) { text = this.processUnits(text); }
			if(text) { [text, models] = this.processModels(text); }
			
			$scope.$apply(); //Necessary becase the following require DOM interaction
				if(text) { text = this.processAddOns(text, models); } 
				this.processPsyker(models);
			
			$scope.$apply(); // Done, now apply updates
		}
		
		processFactions(text) {
			if(text.shift() !== "FACTIONS") {
				showError(errorMessages.corruptedFile);
				return;
			}
			let json = "";
			let nextLine = text.shift();
			while(nextLine !== "UNITS") {
				json += nextLine;
				nextLine = text.shift();
			}
			text.unshift(nextLine);
			const factions = JSON.parse(json);
			$scope.selFac = factions;
			$scope.processUnits();
			return text;
		}
		
		processUnits(text) {
			if(text.shift() !== "UNITS") {
				showError(errorMessages.corruptedFile);
				return;
			}
			let unitJson = "";
			let nextLine = text.shift();
			while(nextLine !== "MODELS") {
				unitJson += nextLine;
				nextLine = text.shift();
			}
			text.unshift(nextLine);
			const units = JSON.parse(unitJson);
			$scope.addUnits(units);
			return text;
		}
		
		processModels(text) {
			if(text.shift() !== "MODELS") {
				showError(errorMessages.corruptedFile);
				return;
			}
			let modelJsonString = "";
			let nextLine = text.shift();
			while(nextLine !== "ADDONS") {
				modelJsonString += nextLine;
				nextLine = text.shift();
			}
			text.unshift(nextLine);
			const models = JSON.parse(modelJsonString);
			return [text, models];
		}
		
		processPsyker(models) {
			models = Object.values(models);
			models.forEach(unit => {
				unit.forEach( model => {
				if(model.SelectedPowers) {
					this.processPower(model);
				}
			});
			});
		}
		
		processPower(model) {
			model.SelectedPowers.forEach( power => {
				document.getElementById(power).click();
			});
			
		}
		
		processAddOns(text) {
			if(text.shift() !== "ADDONS") {
				showError(errorMessages.corruptedFile);
				return;
			}
			let json = "";
			let nextLine = text.shift();
			while(nextLine !== "END") {
				json += nextLine;
				nextLine = text.shift();
			}
			text.unshift(nextLine);
			const addons = JSON.parse(json);
			addons.forEach( addon => {
				const elem = document.getElementById(addon);
				if(elem) {
					elem.click();
				}
			});
			return text;
		}
		
		
		getGameFromName(name) {
			var ret = undefined;
			$scope.games.forEach( game => {
				if(game.Name === name) {
					ret = game;
				}
			});
			if(!ret) {
				showError(errorMessages.InvalidGameName);
			}
			return ret;
		}
		
	}
	
	const errorMessages = {
		GenericError: "One or More errors occurred",
		InvalidFileFormat: "Invalid file format",
		InvalidVersion: "The file you have uploaded is not a supported version",
		InvalidGameName: "The game you have selected is not supported",
		corruptedFile: "Your file is corrupted."
	};
	
	function showError(err) {
		err = err ? err : errorMessages.GenericError;
		//TOOD display client side error in HTML
		console.log(err);
	}
	
	function validateRMEFile(line) {
		return line === HEADER_FIRST_LINE;
	}
	
	function increaseNumberOfModels(unit, amount) {
		$scope.myArmyArray.forEach((elem) => {
			if(elem.Name == unit.Name) {
				if(!elem.StartingNumberOfModels) {
					elem.StartingNumberOfModels = elem.NumberOfModels;
				}
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
		copy.StartingNumberOfModels = unit.StartingNumberOfModels
		copy.Cost = unit.Cost
		copy.SeparateGear = unit.SeparateGear;
		copy.Powers = unit.Powers;
		copy.Abilities = unit.Abilities.slice(0);
		copy.AddOns = unit.AddOns.slice(0);
		copy.Gear = unit.Gear.slice(0);
		return copy;
	}
	
	function initializeChosenPowers(unitName, modelName, powerOptionIndex) {
		if($scope.chosenPowers[unitName] == undefined) { $scope.chosenPowers[unitName] = []; }
		if($scope.chosenPowers[unitName][modelName] == undefined) { $scope.chosenPowers[unitName][modelName] = []; }
		if($scope.chosenPowers[unitName][modelName][powerOptionIndex] == undefined) { $scope.chosenPowers[unitName][modelName][powerOptionIndex] = 0; }
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

	function registerAddOnStatus(addOnId, isEnabled, unitName, model, idx){
		let checkBoxid;
		if(model) {
			if(!$scope.enabledAddOns[model.Name]){
				$scope.enabledAddOns[model.Name] = [];
			}
			$scope.enabledAddOns[model.Name][addOnId] = isEnabled;
			checkBoxid = $scope.getAddOnId(false, model.Name, idx);
		}
		else {
			if(!$scope.enabledAddOns[unitName]){
				$scope.enabledAddOns[unitName] = [];
			}
			$scope.enabledAddOns[unitName][addOnId] = isEnabled;
			checkBoxid = $scope.getAddOnId(true, unitName, idx);
		}
		if(isEnabled){
			$scope.addOnIndexes.add(checkBoxid);
		}
		else {
			$scope.addOnIndexes.delete(checkBoxid);
		}
	}
	
		
	function addModel(unit) {
		let model = cloneUnit(unit);
		model.Name = getModelName(model, unit);
		processGear(unit, model);
		$scope.models[unit.Name].push(model);
	}
	
	function getModelName(model, unit) {
		model.unitName = unit.Name;
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
