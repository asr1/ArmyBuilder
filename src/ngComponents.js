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
	const AddonTypesEnum = {ReplaceItem:1, IncreaseNumberOfModels:2, Direct: 3, AddItem: 4};

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
		num = Math.abs(num); //TODO KLUDGE find out why it's sometimes negative (like add 2 primaris then remove one).
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
			let name = unit.baseName ? unit.baseName : unit.name;
			if(name > longestUnit.name.length) {
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
		return unit;
	}

	/* Takes a unit and fetches its addons 
	 * from the database or cache. Returns the
	 * provided unit with all addons as a property
	*/
	async function getAddonsForUnit(unit) {
		const cacheKey = generateCacheKey("getAddonsForUnit", [unit.id]);
		response = getFromCache(cacheKey);

		if(response === undefined) {
			const webResponse = await $http.post('src/php/getAddonsForUnit.php?unitId='+unit.id);
			response = webResponse.data;
			storeToCache(cacheKey, response);
		}
		unit.addons = response;
		return unit;
	}

	/* Takes a unit and fetches its gear 
	 * from the database or cache. Returns the
	 * provided unit with all gear as a property
	*/
	async function getGearForUnit(unit) {
		const cacheKey = generateCacheKey("getGearForUnit", [unit.id]);
		response = getFromCache(cacheKey);

		if(response === undefined) {
			const webResponse = await $http.post('src/php/getGearForUnit.php?unitId='+unit.id);
			response = webResponse.data;
			storeToCache(cacheKey, response);
		}
		unit.gear = response;
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

	/* Remove from Army
	 * Removes a provided unit from army.
	 * Also removes all models and resets
	 * state of addons and powers.
	 * Many side effects, including modifying
	 * $scope.myArmyV2
	*/
	$scope.removeFromArmyV2 = function(unitToRemove){
		// Get index
		let idxToRemove = -1;
		$scope.myArmyV2.forEach( (unit, idx) => {
			if(unit.name === unitToRemove.name) {
				idxToRemove = idx;
			}
		});
		
		// Remove from army
		if(idxToRemove >= 0) {
			$scope.myArmyV2.splice(idxToRemove, 1);
		}
		
		// Deregister
		$scope.models[unitToRemove.name].forEach(model =>
			deregisterAddOnStatus(model.Name));

		$scope.models[unitToRemove.name] = [];
		$scope.chosenPowers[unitToRemove.name] = [];
		deregisterAddOnStatus(unitToRemove.name)
	}

	/* Returns a unit's base name if it exists, 
	 * or the units name otherwise. Necessary for
	 * Adding and removing units, so we don't add 
	 * "space marines squad 4 squad 2" or similar.
	 */
	$scope.getUnitBaseName = function(unit) {
		return unit.baseName ? unit.baseName : unit.name;
	}

	/* Adds all provided units to myArmy
	 * Modifies $scope.myArmyV2 and makes
	 * Calls to database to populate unit 
	 * details.
	 */
	$scope.addUnitsV2 = function(units) {
		$scope.selectedUnits = [];
		if (!units || units.length == 0) {return;}

		units.forEach( async (unit) => {
			//Set basename. Needed for save/load
			unit.baseName = unit.baseName ? unit.baseName : unit.name;
			addToScopeCurrentCount(unit, 1);
			
			// Initialize models
			if($scope.models[unit.name] == undefined) {
				$scope.models[unit.name] = [];
			}
			if($scope.models[unit.name].length) {
				unit.name = getNextName(unit);
				$scope.models[unit.name] = [];
			}
			
			//V2 work. Update model details.
			unit = await getAbilitiesForUnit(unit);
			unit = await getAddonsForUnit(unit);
			unit = await getGearForUnit(unit);
			
			if(!unit.startingNumberOfModels) {
				unit.startingNumberOfModels = unit.numberOfModels;
			}
			let numUnits = unit.startingNumberOfModels;
			for(let i = 0; i < numUnits; i++) {
				addModelV2(unit);
			}
			$scope.myArmyV2.push(cloneUnitV2(unit));
			console.log("My army v2", $scope.myArmyV2);
			$scope.$apply();
		});
	}

	//Deprecated
	$scope.addUnits = function(units) {
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
		///???? Next three lines.
		units.reduce((set, elem) => set.add(cloneUnit(elem)), $scope.myArmy);
		$scope.myArmyArray = Array.from($scope.myArmy); 
		updateEnabledUnits();
	}
	 
	 /* Calculates the cost of the entire army.
	  * Returns the cost of each unit in the army.
	  */
	 $scope.calculateArmyCostV2 = function() {
		 let cost = 0;
		 $scope.myArmyV2.forEach((unit) => cost += $scope.calculateUnitCostV2(unit));
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

	$scope.shouldDisableUnitAddOn = function(unit, addon) {		
		if(!$scope.enabledAddOns[unit.name]) {return false;}
		if(!addon.Mutex) {
			return false;
		}
		let shouldDisable = false;

		addon.Mutex.forEach( (conflictId) => {
			if($scope.enabledAddOns[unit.name][conflictId]) {
				shouldDisable = true;
			}
		});

		return shouldDisable;
	}

	/* Calculates the cost of a given unit.
	 * Returns a number that represents the cost 
	 * For one unit, including gear and addOns.
	 */
	$scope.calculateUnitCostV2 = function(unit) {
		return unit.numberOfModels * unit.cost + calculateUnitGearCost(unit) + getAddOnCost(unit);
	}

	$scope.calculateAddOnCost = function(addOn, unit) {
		if(!addOn || !unit) { return; }
		// console.log("addon", addOn);
		switch(addOn.typeid) {
			case AddonTypesEnum.Direct: 
				return addOn.cost
			break;
			//TODO
			case AddonTypesEnum.ReplaceItem:
				//return $scope.getGear(addOn.Add).cost - $scope.getGear(addOn.Remove).Cost;
			break;
			case AddonTypesEnum.IncreaseNumberOfModels:
				return (unit.cost + calculateModelGearCostV2(unit.gear)) * addOn.amount;
			break;
			//TODO
			case AddonTypesEnum.AddItem:
			//	return $scope.getGear(addOn.Add).Cost;
			break;
		}
	}

	/* Generates the addon id. Used for reference when saving and loading.
	 * Addon id is a combination of the unit or model, its name, and its
	 * position in the army (for units) or among the unit (for models).
	 */
	$scope.getAddOnId = function(isUnitLevel, name, index) {
		return isUnitLevel ? name + ' unit add on&' + index : name + ' model add on&' + index;
	}

	/* Called when an addon is selected or deselected. 
	 * Modifies the unit to perform the addon in question.
	 */
	$scope.setAddOnCost = function(isChecked, unit, addOn, model, idx) {
		registerAddOnStatus(addOn.id, isChecked, unit.name, model, idx);
		switch(addOn.typeid) {
			case AddonTypesEnum.Direct: 
				isChecked ?
					$scope.addOnCosts[unit] += addOn.cost
					:
					$scope.addOnCosts[unit] -= addOn.cost;
			break;
			case AddonTypesEnum.ReplaceItem: 
			//TODO
				if(isChecked) {
					replaceItem(model, addOn.Remove, addOn.Add, unit);
				}                            
				else {                       
					replaceItem(model, addOn.Add, addOn.Remove, unit);
				}
			break;
			//TODO
			case AddonTypesEnum.AddItem: 
				if(isChecked) {
					replaceItem(model, addOn.Remove, addOn.Add, unit);
				}                            
				else {                       
					replaceItem(model, addOn.Add, addOn.Remove, unit);
				}
			break;
			//TODO
			case AddonTypesEnum.IncreaseNumberOfModels:
				if(isChecked) {
					increaseNumberOfModels(unit, addOn.amount);
				}
				else {
					increaseNumberOfModels(unit, -addOn.amount);
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

	/* Increase number of models.
	 * Used for add-ons that add additional models
	 * MOdifies global state including $scope.myArmyV2
	 * Takes in a unit to add models of and the amount to add.
	 * If amount is negative, removes models instead, pop()ing.
	 */
	function increaseNumberOfModels(unit, amount) {
		console.log("increase unit", unit);
		$scope.myArmyV2.forEach((elem) => {
			if(elem.name == unit.name) {
				if(!elem.startingNumberOfModels) {
					elem.startingNumberOfModels = elem.numberOfModels;
				}
				elem.numberOfModels += amount;

			}
		});
		if(amount > 0){
			while(amount--)
			{
				addModelV2(unit);
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

	/* Returns all addon costs for 
	 * a provided unit. Relies on 
	 * global $scope.addOnCosts.
	 */
	 function getAddOnCost(unit) {
		if($scope.addOnCosts[unit] == undefined) {
			$scope.addOnCosts[unit] = 0;
		}
		return $scope.addOnCosts[unit];
	}

	// Deprecated
	function calculateModelGearCost(gearIndexes) {
		let total = 0;
		//gearIndexes.forEach((idx) => total += $scope.getGear(idx).Cost);
		return total;
	}
	
	/* Calculates the total cost of gear for a unit
	 * Takes in an array of gear
	 * Returns an integer total cost of gear
	 */
	function calculateModelGearCostV2(gearArr) {
		if(!gearArr || gearArr.length === 0) { return; }
		return gearArr.reduce( (currentValue, gear) => currentValue + gear.cost, 0);
	}

	function testCalculateModelGearCostV2() {
		let arr1 = [
			{ 'cost' : 15 },
			{ 'cost' : 10 }
		];
		let arr2 = [
			{ 'cost' : 15 },
			{ 'cost' : 11 },
			{ 'cost' : 0 }
		];
		console.assert(calculateModelGearCostV2(arr1) === 25, "arr1 should equal 25, was %d", calculateModelGearCostV2(arr1));
		console.assert(calculateModelGearCostV2(arr2) === 26, "arr2 should equal 26, was %d", calculateModelGearCostV2(arr2));
	}

	//Deprecated
	function updateEnabledUnits() {
		$scope.availUnits.forEach((unit) => {
			unit.disabled = $scope.models[unit.name] != undefined && $scope.models[unit.name].length > 0;
		});
	}

	/* Calculate unit gear cost
	 * Takes in a unit, returns the total cost of
	 * all gear for all models that are part of that
	 * unit.
	 */
	function calculateUnitGearCost(unit) {
		if($scope.models[unit.name] == undefined) { return 0; }
		let total = 0;
		$scope.models[unit.name].forEach( (model) => {
			total += calculateModelGearCostV2(model.gear)
		});
		return total;
	}

	/* Takes a unit and returns a deep copy
	 * of that unit. Unfortunately this is 
	 * done by manually iterating over each
	 * field.
	 */
	function cloneUnitV2(unit) {
		let copy = {};
		console.log("clone", unit);
		console.log("abilities", unit.abilities);
		copy.abilities = unit.abilities.slice(0);
		copy.addons = unit.addons.slice(0);
		copy.baseName = unit.baseName;
		copy.gear = unit.gear.slice(0);
		copy.cost = unit.cost;
		copy.id = unit.id;
		copy.name = unit.name;
		copy.numberOfModels = unit.numberOfModels;
		copy.squadNames = unit.squadNames; // Used for units with mixed models
		copy.startingNumberOfModels = unit.startingNumberOfModels;
		// copy.separateGear = unit.separateGear;
		// copy.powers = unit.powers;
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

	/* Updates the number of each unit that is
	 * currently in existence. Not entirely sure
	 * why this is necessary, but porting over for
	 * now. I believe this an attempt to allowing
	 * The same unit to be added multiple times.
	 */
	function addToScopeCurrentCount(unit, number) {
		if(!$scope.currentUnitCount[unit.baseName]) {
			$scope.currentUnitCount[unit.baseName] = 0;
		}
		$scope.currentUnitCount[unit.baseName] += number;
	}

	/* Returns the current count for each unit.
	 */
	function getNameCount(unit) {
		if(!$scope.currentUnitCount[unit.baseName]) {
			$scope.currentUnitCount[unit.baseName] = 0;
		}
		return $scope.currentUnitCount[unit.baseName];
	}

	/* Given a unit, returns the next name sequentially.
	 * This was originally added to support adding the
	 * same unit multiple times.
	 */
	function getNextName(unit) {
		return unit.baseName + ' - Squad ' + (getNameCount(unit));
	}
	
	function addModelV2(unit) {
		let model = cloneUnitV2(unit);
		model.name = getModelName(model, unit);
		$scope.models[unit.name].push(model);
		if (!$scope.$$phase) { // Anti-pattern. Means $scope.Apply() isn't high enough in call stack.
			$scope.$apply(); // Has to be here for last step in AddUnitsV2 to avoid $digest conflict.
		}
	}

	//Deprecated, can remove
	function addModel(unit) {
		let model = cloneUnit(unit);
		model.Name = getModelName(model, unit);
		processGear(unit, model);
		$scope.models[unit.name].push(model);
	}

	function getModelName(model, unit) {
		model.unitName = unit.name;
		const numModelsInSquad = $scope.models[unit.name].length;
		
		//Handle mixed units, where there is (for example) one captain and 3 lieutenants
		//First the normal case.... (Flame Squad 1...n)
		const numSquadNames = unit.squadNames ? unit.squadNames.length : 0;
		if (unit.squadNames == undefined || numSquadNames <= numModelsInSquad) {
			return ret = model.name + ' ' + ($scope.models[unit.name].length + 1 - numSquadNames);
		}
		else {//TODO this will have to be handled differently going forward. DB changes will also be necessary
			return ret = unit.squadNames[numModelsInSquad];
		}
	}

	function deregisterAddOnStatus(unitName) {
		if($scope.enabledAddOns[unitName]) {
			$scope.enabledAddOns[unitName] = [];
		}
	}

});
