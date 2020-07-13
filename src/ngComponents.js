let app = angular.module('armyBuilder', []);
app.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
}]);
app.controller('builderCtrl', function($scope, $http){
	const CURRENT_FILE_FORMAT_VERSION = 1.0
	const HEADER_FIRST_LINE = "Army Builder";
	$scope.factions = []; //An array of factions where the index is the gameId.
	let cache = {}; // Cache for network calls to db
	$scope.buffer = 5; //Padding for addSpaces
	$scope.myArmyV2 = [];
	$scope.longestTotalLength = 0;

	/*Initialize default game and factions.
	 * Gets all games from the database,
	 * Then sets selectedGame to the first game
	 * And sets availableFactions based on that game.
	*/
	(function initialize() {
		$http.post('src/php/getGames.php').then(async function successCB(data){
			$scope.games = data.data;
			$scope.selectedGame = $scope.games[0];
			$scope.updateavailableFactions($scope.selectedGame);
		});
	})();

	/* Sets availableFactions equal to all factions associated 
	 * To the provided game.
	 * Side effects: modifies state of $scope.availableFactions based on game
	*/
	$scope.updateavailableFactions = async function (game) {
		$scope.availableFactions = await getFactionsAsync(game);
		$scope.$apply();
	}

	/* Returns a list of units associated with the factions provided
	 * Calls database and modifies $scope.availableUnits with the options.
	 */
	$scope.getUnitsFromFactionsAync = async function(factions) {
		let response;
		const factionIds = factions.map(faction => faction.id);

		const cacheKey = generateCacheKey("getUnitsFromFactionsAync", factionIds);
		response = getFromCache(cacheKey);

		if(response === undefined) {
			const webResponse = await $http.post('src/php/getUnitsForFactions.php?factionIds[]='+factionIds);
			response = webResponse.data;
			storeToCache(cacheKey, response);
		}
		$scope.availableUnits = response;
		updateLongestUnit(response);
		$scope.$apply();
	}

	/* Takes in a list of units
	 * and sets $scope.longestUnitNameLength
	 * based on the longest unit name.
	*/
	function updateLongestUnit(units) {
		if(!units || units.length === 0) { return; }
		const longestUnit = findUnitWithLongestName(units);
		$scope.longestUnitNameLength = longestUnit.name.length;
		$scope.longestTotalLength = $scope.longestUnitNameLength + + longestUnit.cost.toString().length;
	}		

	/* Returns an entry from the cache
	 * if it exists. Returns the cache
	 * data if present, or undefined otherwise.
	*/
	function getFromCache(cacheKey) {
		return cache[cacheKey];
	}

	/* Updates the cache with new data.
	 */
	function storeToCache(cacheKey, data) {
		cache[cacheKey] = data;
	}

	/* Generates a cache key from a function name and arguments.
	 * Cache key will be the name of the function followed
	 * by a hyphen and a hyphen-delimeted list of arguments.
	 * Example: getUnitsFromFactionsAync-1-2.
	 * Takes in a string name and an array of arguments
	*/
	function generateCacheKey(functionName, args) {
		return functionName + '-' + args.join('-');
	}
	
	/* Returns a number of spaces propotional to the difference
	 * between the length of the input name and the longest unit
	 * name available.
	*/
	$scope.addSpaces= function(inputName){
		const count = 2*($scope.longestUnitNameLength - inputName.length) + $scope.buffer; 
		let result = "";
		let num = $scope.longestTotalLength - inputName.length;
		return String.fromCharCode(160).repeat(num);
	};
	
	/* Takes in a list of units. 
	 * Returns the unit with the longest name.
	 * Example: findUnitWithLongestName({name: 'Alex'},
	 * {name: 'Jonathan'}) would return {name: 'Jonathan'}
	*/  
	function findUnitWithLongestName(units) {
		let longestUnit = units[0];
		units.forEach( (unit) => {
			if(unit.name.length > longestUnit.name.length) {
				longestUnit = unit;
			}
		});
		return longestUnit;
	}

	/* Takes a unit and fetches its abilities 
	 * from the database or cache. Returns the
	 * provided unit with all abilities as a property
	*/
	async function getAbilitiesForUnit(unit) {
		const cacheKey = generateCacheKey("getAbilitiesForUnit", [unit.id]);
		response = getFromCache(cacheKey);

		if(response === undefined) {
			const webResponse = await $http.post('src/php/getAbilitiesForUnit.php?unitId='+unit.id);
			response = webResponse.data;
			storeToCache(cacheKey, response);
		}
		unit.abilities = response;
		$scope.$apply();
		return unit;
	}

	/* Gets all factions based on the provided
	 * Game. Modifies $scope.factions. 
	 */
	const getFactionsAsync = async function(game) {
		if(!game) { return; }
		if($scope.factions[game.id] === undefined) {
			const response = await $http.post('src/php/getFactionsForGame.php?gameId='+game.id);
			$scope.factions[game.id] = response.data;
		}
		return $scope.factions[game.id];
	}

	/* Adds all provided units to myArmy
	 * Modifies $scope.myArmyV2 and makes
	 * Calls to database to populate unit 
	 * details.
	 */
	$scope.addUnitsV2 = function(units) {
		$scope.selectedUnits = [];
		if (!units || units.length == 0) {return;}

		units.forEach( (unit) => {
			unit = getAbilitiesForUnit(unit);
		});
		$scope.myArmyV2 = $scope.myArmyV2.concat(units);
	}

	//OLD

	$scope.selFac = null;
	$scope.availUnits = null;
	$scope.longestUnitNameLength = 0;
	
	$scope.myArmy = new Set();
	$scope.myArmyArray = [];

	$scope.addOnCosts = {};
	$scope.models = {};
	$scope.enabledAddOns = {}
	$scope.chosenPowers = {};
	$scope.addOnIndexes = new Set();
	$scope.currentUnitCount = {};

	$scope.allFacs = new Set();

	$scope.shouldDisableDownloadButton = function() {
		return $scope.myArmyArray.length <= 0;
	}

	$scope.removeFromArmy = function(unit){
		$scope.myArmy.delete(unit);
		$scope.myArmyArray = Array.from($scope.myArmy);
		$scope.models[unit.name].forEach(model =>
			deregisterAddOnStatus(model.Name));

		$scope.models[unit.name] = [];
		$scope.chosenPowers[unit.name] = [];
		updateEnabledUnits();
		deregisterAddOnStatus(unit.name)
		$scope.apply;
	}

	//May need this once I add file support? Unclear
	$scope.getOptionsName = function(unit) {
		return unit.baseName ? unit.baseName : unit.name;
	}

	$scope.addUnits = function(units){
		$scope.selectedUnits = [];
		if (!units || units.length == 0) {return;}

		// Add to array if not present in O(selUnit) instead of O(myArmy)
		units.forEach( (unit) => {
			unit.baseName = unit.baseName ? unit.baseName : unit.name;
			addToScopeCurrentCount(unit, 1);
			if($scope.models[unit.name] == undefined) {
				$scope.models[unit.name] = [];
			}

			if($scope.models[unit.name].length) {
				unit.name = getNextName(unit);
				$scope.models[unit.name] = [];
			}

			if(!unit.startingNumberOfModels) {
				unit.startingNumberOfModels = unit.numberOfModels;
			}
			let numUnits = unit.startingNumberOfModels;
			for(let i = 0; i < numUnits; i++) {
				addModel(unit);
			}

		});
		units.reduce((set, elem) => set.add(cloneUnit(elem)), $scope.myArmy);
		$scope.myArmyArray = Array.from($scope.myArmy); 
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
		if(!$scope.enabledAddOns[unit.name]) {return false;}
		const addOn = $scope.getAddon(id);
		if(!addOn.Mutex) {
			return false;
		}
		let shouldDisable = false;

		addOn.Mutex.forEach( (conflictId) => {
			if($scope.enabledAddOns[unit.name][conflictId]) {
				shouldDisable = true;
			}
		});

		return shouldDisable;
	}

	$scope.calculateUnitCost = function(unit) {
		return unit.numberOfModels * unit.cost + calculateUnitGearCost(unit) + getAddOnCost(unit);
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
				return (unit.cost + calculateModelGearCost(unit.gear)) * addOn.Amount;
			break;
			case "AddItem":
				return $scope.getGear(addOn.Add).Cost;
			break;
		}
	}

	$scope.getAddOnId = function(isUnitLevel, name, index) {
		return isUnitLevel ? name + ' unit add on&' + index : name + ' model add on&' + index;
	}

	$scope.setAddOnCost = function(isChecked, unit, addOnId, model, idx) {
		registerAddOnStatus(addOnId, isChecked, unit.name, model, idx);
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
			case "AddItem":
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
		$scope.myArmyArray.forEach( unit => { if(unit.startingNumberOfModels) { unit.numberOfModels = unit.startingNumberOfModels } });
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
			if(elem.Name == unit.name) {
				if(!elem.StartingNumberOfModels) {
					elem.StartingNumberOfModels = elem.NumberOfModels;
				}
				elem.NumberOfModels += amount;

			}
		});
		if(amount > 0){
			while(amount--)
			{
				addModel(unit);
			}
		}
		else {
			amount *= -1;
			for(let i = 0; i < amount; i++) {
				$scope.models[unit.name].pop();
			}
		}
	}

	function replaceItem(model, oldItem, newItem, unit) {
		$scope.models[unit.name].forEach((soldier) => {
			if(soldier.Name == model.Name) {// Find the right guy
				let toRemove = -1;
				soldier.Gear.forEach((item, idx) => {
					if(item === oldItem) {
						toRemove = idx;
					}
				});
				if(toRemove !== -1) {
					soldier.Gear.splice(toRemove, 1);
				}
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
			unit.disabled = $scope.models[unit.name] != undefined && $scope.models[unit.name].length > 0;
		});
	}

	function calculateUnitGearCost(unit) {
		if($scope.models[unit.name] == undefined) { return 0; }
		let total = 0;
		$scope.models[unit.name].forEach( (model) => {
			total += calculateModelGearCost(model.Gear)
		});
		return total;
	}

	function cloneUnit(unit) {
		let copy = {};
		copy.name = unit.name
		copy.baseName = unit.baseName
		copy.numberOfModels = unit.numberOfModels
		copy.startingNumberOfModels = unit.startingNumberOfModels
		copy.cost = unit.cost
		copy.separateGear = unit.separateGear;
		copy.powers = unit.powers;
		copy.abilities = unit.abilities.slice(0);
		copy.addOns = unit.addOns.slice(0);
		copy.gear = unit.gear.slice(0);
		copy.squadNames = unit.squadNames;
		return copy;
	}

	function initializeChosenPowers(unitName, modelName, powerOptionIndex) {
		if($scope.chosenPowers[unitName] == undefined) { $scope.chosenPowers[unitName] = []; }
		if($scope.chosenPowers[unitName][modelName] == undefined) { $scope.chosenPowers[unitName][modelName] = []; }
		if($scope.chosenPowers[unitName][modelName][powerOptionIndex] == undefined) { $scope.chosenPowers[unitName][modelName][powerOptionIndex] = 0; }
	}

	function processGear(unit, model) {
		if(!unit.separateGear) {
			return;
		}
		let defaultLoadout = [];
		const numProcessed = $scope.models[unit.name].length
		let processed = false;
		let count = 0;

		for(let i = 0; i < unit.separateGear.length; i++) {
			count += unit.separateGear[i].Number;
			if(unit.separateGear[i].Default) {

				defaultLoadout = unit.separateGear[i].Loadout;
			}
			if(count <= numProcessed) {
				continue;
			}
			else {
				model.Gear = model.gear.concat(unit.separateGear[i].Loadout);
				processed = true;
				break;
			}
		}

		if(!processed) {
			model.Gear = model.gear.concat(defaultLoadout);
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

	function addToScopeCurrentCount(unit, number) {
		if(!$scope.currentUnitCount[unit.baseName]) {
			$scope.currentUnitCount[unit.baseName] = 0;
		}
		$scope.currentUnitCount[unit.baseName] += number;
	}

	function getNameCount(unit) {
		if(!$scope.currentUnitCount[unit.baseName]) {
			$scope.currentUnitCount[unit.baseName] = 0;
		}
		return $scope.currentUnitCount[unit.baseName];
	}

	function getNextName(unit) {
		return unit.baseName + ' - Squad ' + (getNameCount(unit));
	}

	function addModel(unit) {
		let model = cloneUnit(unit);
		model.Name = getModelName(model, unit);
		processGear(unit, model);
		$scope.models[unit.name].push(model);
	}

	function getModelName(model, unit) {
		model.unitName = unit.name;
		const numModelsInSquad = $scope.models[unit.name].length;
		const numSquadNames = unit.squadNames ? unit.squadNames.length : 0;
		if (unit.squadNames == undefined || numSquadNames <= numModelsInSquad) {
			return ret = model.name + ' ' + ($scope.models[unit.name].length + 1 - numSquadNames);
		}
		else {
			return ret = unit.squadNames[numModelsInSquad];
		}
	}

	function deregisterAddOnStatus(unitName) {
		if($scope.enabledAddOns[unitName]) {
			$scope.enabledAddOns[unitName] = [];
		}
	}

});
