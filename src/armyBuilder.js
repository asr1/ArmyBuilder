let app = angular.module('armyBuilder', []);
app.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
}]);
app.controller('builderCtrl', function($scope, $http){
	const CURRENT_FILE_FORMAT_VERSION = 1.0
	const HEADER_FIRST_LINE = "Army Builder";
	
	const getGearByModelIdCacheKey = "getGearByModelId"; 
	$scope.factions = []; //An array of factions where the index is the gameId.
	let cache = {}; // Cache for network calls to db
	$scope.buffer = 5; //Padding for addSpaces
	$scope.myArmyV2 = [];
	const AddonTypesEnum = {ReplaceItem:1, IncreaseNumberOfModels:2, Direct: 3, AddItem: 4, ReplaceItemFromSet: 5};
	$scope.AddonTypes = AddonTypesEnum;
	$scope.itemSets = [];

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
			
			// Store all gear locally. When getting each individual gear,
			// Issues arose because Angular tried to refresh before the
			// First async could resolve. Lack of proper mutexes demands
			// This approach.
			const gearResponse = await $http.post('src/php/getAllGear.php');
			$scope.gear = gearResponse.data;
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

	/* changeUnitAddonTimes (unit, addon, timesTaken)
	 * Takes in the unit, the addon, and the  
	 * number of times that unit will taken the
	 * addon. Also applies the addon timesTaken
	 * times, and increases the cost of the unit 
	 * accordingly.
	*/
	$scope.changeUnitAddonTimes = function (unit, addon, timesTaken) {
		if(!$scope.enabledAddOns[unit.name]){
			$scope.enabledAddOns[unit.name] = [];
		}
		if(!$scope.enabledAddOns[unit.name][addon.id]) {
			$scope.enabledAddOns[unit.name][addon.id] = 0;
		}
			
		const curTimes = $scope.enabledAddOns[unit.name][addon.id];
		const diff = timesTaken - curTimes;
		// If we want to take this addon more times than we currently are, enable will be true.
		const shouldEnable = diff > 0; 
		let absDiff = Math.abs(diff);
		
		while(absDiff--) {
			$scope.setAddOnCost(shouldEnable, unit, addon, null);
		}
	}

	/* Takes in a list of units
	 * and sets $scope.longestUnitNameLength
	 * based on the longest unit name.
	*/
	function updateLongestUnit(units) {
		if(!units || units.length === 0) { return; }
		const longestUnit = findUnitWithLongestName(units);
		$scope.longestUnitNameLength = longestUnit.name.length;
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
		let num = $scope.longestUnitNameLength - inputName.length;
		num = Math.abs(num); //TODO KLUDGE find out why it's sometimes negative (like add 2 primaris then remove one).
		return String.fromCharCode(160).repeat(num);
	};
	
	/* Sets $scope.ItemsSets[setId] based on 
	 * a network call. Done this way so the HTML 
	 * will return data. Angular 1 HTML doesn't like async
	 * functions here. It will show {} if we call directly,
	 * Because HTML has no concept of await.
	 */
	$scope.PopulateItemsForSet = async function(setId, replacementItem){
		// Could probably avoid a network call and check the itemSets array directly.
		const cacheKey = generateCacheKey("getItemsBySet", [setId]);
		response = getFromCache(cacheKey);

		if(response === undefined) {
			const webResponse = await $http.post('src/php/getItemsBySet.php?setId='+setId);
			response = webResponse.data;
			storeToCache(cacheKey, response);
		}
		$scope.itemSets[setId] = response;
		replacementItem = response[0];
		return response;
	}
	
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
	 * from the database or cache. 
	*/
	async function getAbilitiesForUnit(unit) {
		const cacheKey = generateCacheKey("getAbilitiesForUnit", [unit.id]);
		response = getFromCache(cacheKey);

		if(response === undefined) {
			const webResponse = await $http.post('src/php/getAbilitiesForUnit.php?unitId='+unit.id);
			response = webResponse.data;
			storeToCache(cacheKey, response);
		}
		return response;
	}

	/* Takes a unit and fetches its addons 
	 * from the database or cache.
	*/
	async function getAddonsForUnit(unit) {
		const cacheKey = generateCacheKey("getAddonsForUnit", [unit.id]);
		response = getFromCache(cacheKey);

		if(response === undefined) {
			const webResponse = await $http.post('src/php/getAddonsForUnit.php?unitId='+unit.id);
			response = webResponse.data;
			storeToCache(cacheKey, response);
		}
		return response;
	}

	/* Takes in a unit and adds missing information
	 * based on the addons. If a unit has an addon x of
	 * type AddModel, then this sets x.model equal to the
	 * model with its gear.
	*/
	async function processUnitAddons(unit) {
		unit.addons.forEach( async (addon) => {
			if(addon.typeid === AddonTypesEnum.IncreaseNumberOfModels) {
				addon.model = await getModelByModelId(addon.modelIdToAdd);
				addon.model.gear = await getGearByModelId(addon.modelIdToAdd);
				addon.model.addons = await getAddonsForModel(addon.model);
				addon.model.unitName = unit.name;
			}
		});
		return unit.addons
	}

	/* Takes a model and fetches its addons 
	 * from the database or cache.
	*/
	async function getAddonsForModel(model) {
		const cacheKey = generateCacheKey("getAddonsForModel", [model.id]);
		response = getFromCache(cacheKey);

		if(response === undefined) {
			const webResponse = await $http.post('src/php/getAddonsForModel.php?modelId='+model.id);
			response = webResponse.data;
			storeToCache(cacheKey, response);
		}
		return response;
	}

	/* Fetches a model
	 * from the database or cache. 
	*/
	async function getModelByModelId(modelId) {
		const cacheKey = generateCacheKey("getModelByModelId", [modelId]);
		response = getFromCache(cacheKey);

		if(response === undefined) {
			const webResponse = await $http.post('src/php/getModelById.php?modelId='+modelId);
			response = webResponse.data;
			storeToCache(cacheKey, response);
		}
		return response;
	}

	/* Takes a unit and fetches its models 
	 * from the database or cache. 
	*/
	async function getModelsForUnit(unit) {
		const cacheKey = generateCacheKey("getModelsForUnit", [unit.id]);
		response = getFromCache(cacheKey);

		if(response === undefined) {
			const webResponse = await $http.post('src/php/getModelsForUnit.php?unitId='+unit.id);
			response = webResponse.data;
			storeToCache(cacheKey, response);
		}
		return response;
	}
	
	/* Takes a unit and fetches its powers 
	 * from the database or cache.
	*/
	async function getKnownPowersForUnit(unit) {
		const cacheKey = generateCacheKey("getPowersForUnit", [unit.id]);
		response = getFromCache(cacheKey);

		if(response === undefined) {
			const webResponse = await $http.post('src/php/getPowersForUnit.php?unitId='+unit.id);
			response = webResponse.data;
			storeToCache(cacheKey, response);
		}
		return response;
	}

	
	/* Takes a unit and fetches its optional powers 
	 * from the database or cache. Returns options
	 * formatted so amount is at top level and 
	 * items are below.
	*/
	async function getOptionalPowersForUnit(unit) {
		const cacheKey = generateCacheKey("getOptionalPowersForUnit", [unit.id]);
		response = getFromCache(cacheKey);

		if(response === undefined) {
			let webResponse = await $http.post('src/php/getOptionsPowersForUnit.php?unitId='+unit.id);
			setArr = webResponse.data;
			
			for(i = 0; i < setArr.length; i++){
				webResponse  = await $http.post('src/php/getOptionalPowersForSet.php?setId='+setArr[i].setId);
				console.log(webResponse);
				console.log("Ding");
				setArr[i].from = webResponse.data; 
			}
			response = setArr;
			storeToCache(cacheKey, response);
		}
		
		return response;
	}

	/* Takes a unit and fetches its gear 
	 * from the database or cache. Returns the
	 * provided unit with all gear as a property
	*/
	async function getGearByModelId(modelId) {
		const cacheKey = generateCacheKey(getGearByModelIdCacheKey, [modelId]);
		response = getFromCache(cacheKey);

		if(response === undefined) {
			const webResponse = await $http.post('src/php/getGearForModel.php?modelId='+modelId);
			response = webResponse.data;
			storeToCache(cacheKey, response);
		}
		return response;
	}

	/* Takes gear id and fetches the associated gear
	 * from the local cache.
	*/
	function getGearById(id) {
		return $scope.gear.filter( item => item.id === id )[0];
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

		units.forEach( async (unit, idx) => {
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
			unit.models = await getModelsForUnit(unit);
			unit.abilities = await getAbilitiesForUnit(unit);
			unit.addons = await getAddonsForUnit(unit);
			unit.addons = await processUnitAddons(unit);
			
			unit.powers = unit.powers ? unit.powers : {};
			unit.powers.known = await getKnownPowersForUnit(unit);
			unit.powers.options = await getOptionalPowersForUnit(unit);
			unit.models.forEach( async (model) => {
				model.unitName = unit.name;
				model.gear = await getGearByModelId(model.id);
				model.addons = await getAddonsForModel(model);
				
				if(!model.startingNumberOfModels) {
					model.startingNumberOfModels = model.modelCount;
				}
				let numUnits = model.startingNumberOfModels;
				for(let i = 0; i < numUnits; i++) {
					addModelV2(model);
				}
				
			});
			
			$scope.myArmyV2.push(cloneUnitV2(unit));
			if(idx === units.length -1) {
				$scope.$apply();
			}
		});
	}
	 
	 /* Calculates the cost of the entire army.
	  * Returns the cost of each unit in the army.
	  */
	 $scope.calculateArmyCostV2 = function() {
		 let cost = 0;
		 $scope.myArmyV2.forEach((unit) => cost += $scope.calculateUnitCostV2(unit, false));
		return cost;
	 }

	/* SetChosenPower. Used to mark a power as taken form a certain options.
	 * Together with ShouldDisablePower determines eligibility for powers to 
	 * be taken. Possibly used to have more functionality re: downloading saved
	 * RME files.
	 */
	$scope.setChosenPower = function(isChecked, unit, power, model, powerOptionIndex, checkboxIndex) {
		initializeChosenPowers(unit.name, model.name, powerOptionIndex);
		const amountToAdd = isChecked ? 1 : -1
		$scope.chosenPowers[unit.name][model.name][powerOptionIndex] += amountToAdd;
		addPowerToUnit(unit, power, model, powerOptionIndex, checkboxIndex); // Necessary? Not in current use, possibly need to revert (7/27/2020)
	}

	/* shouldDisableModelAddon() determines if an
	 * addon should be disabled at the model level.
	 * Based on maxTimesPerUnit.
	 */
	$scope.shouldDisableModelAddon = function(model, addon, checked) {
		if(checked) { return false; }
		let shouldDisable = false;
		if(!addon.maxTimesPerUnit) { return false; }
		if(!$scope.enabledAddOns[model.unitName] || !$scope.enabledAddOns[model.unitName][addon.id]) {
			return false;
		}
		shouldDisable = $scope.enabledAddOns[model.unitName][addon.id] >= addon.maxTimesPerUnit;
		
		return shouldDisable;
	}

	/* Should disable power. Together with setChosen power
	 * determines if a checkbox should be disabled from the
	 * HTML.
	*/
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
	$scope.calculateUnitCostV2 = function(unit, useCache = true) {
		const cacheKey = generateCacheKey("calculateUnitCostV2", [unit.id]);
		let response = getFromCache(cacheKey);
		if(!useCache || response === undefined) { //Don't cache before everything is loaded
			const modelsCost = unit.numberOfModels * unit.costPerModel;
			const unitGearCost = calculateUnitGearCost(unit);
			const unitAddonCost = getAddOnCost(unit);
			response = modelsCost + unitGearCost + unitAddonCost;
			storeToCache(cacheKey, response);
		}
		return response;
	}


	$scope.calculateAddOnCost = function(addOn, unit) {
		if(!addOn || !unit) { return; }
		const cacheKey = generateCacheKey("calculateAddOnCost", [addOn.id, unit.id]);
		let response = getFromCache(cacheKey);
		if(response === undefined) {
			switch(addOn.typeid) {
				case AddonTypesEnum.Direct: 
					response = addOn.cost
				break;
				case AddonTypesEnum.ReplaceItem:
					let addGear = getGearById(addOn.itemIdToAdd);
					let removeGear = getGearById(addOn.itemIdToRemove);
					response = addGear.cost - removeGear.cost;
				break;
				case AddonTypesEnum.IncreaseNumberOfModels:
					response = (unit.costPerModel + calculateModelGearCostV2(addOn.model.gear)) * addOn.amount;
				break;
				case AddonTypesEnum.AddItem:
					response = getGearById(addOn.itemIdToAdd).cost;
				break;
				case AddonTypesEnum.ReplaceItemFromSet:
					// console.log("calculating cost", addOn);
					response = addOn.cost;
				break;
			}
		}
		return response;
	}

	/* Updates the cost of an addon based on selected
	 * items to replcae. This is used for replaceItemFromSet
	 * And assumes that the addon doesn't have a base cost.
	 * This assumption is consistent with the rest of the design.
	 * Also sets addon.itemToAdd to the id of replacementItem
	 * This allows the setAddonCost() function to work as intended.
	*/
	$scope.updateItemCost = function(addon, replacementItem) {
		if(addon.typeid === AddonTypesEnum.ReplaceItemFromSet) {
			const payloadAddOn = {
				'itemIdToAdd'    : replacementItem.id,
				'itemIdToRemove' : addon.itemIdToRemove
			};
			// Add
			if(addon.itemIdToRemove === 0) {
				payloadAddOn['typeid'] = AddonTypesEnum.AddItem;
			}
			// Replace
			else {
				payloadAddOn['typeid'] = AddonTypesEnum.ReplaceItem;
			}
			addon.cost = $scope.calculateAddOnCost(payloadAddOn, {'id': undefined});
			addon.itemIdToAdd = replacementItem.id;
			
		}
		// console.log("");
		// console.log("Addon", addon);
		// console.log("replacement item", replacementItem);
	}
	

	/* Generates the addon id. Used for reference when saving and loading.
	 * Addon id is a combination of the unit or model, its name, and its
	 * position in the army (for units) or among the unit (for models).
	 */
	$scope.getAddOnId = function(isUnitLevel, name, index) {
		return isUnitLevel ? name + ' unit add on&' + index : name + ' model add on&' + index;
	}

	/* Takes an addon for a given model.
	 * Right now only used at the unit level.
	 * Called when an addon is selected or deselected.
	 * If the addon can be taken multiple times, take it
	 * a number of times equal to the times its currently set to
	 * Otherwise, just do it once like normal.
	*/
	$scope.takeAddon = function(isChecked, unit, addon, model) {
		if(addon.times > 1) {
			let times = isChecked ? addon.timesTaken : 0;
			$scope.changeUnitAddonTimes(unit, addon, times) 
		}
		else {
			$scope.setAddOnCost(isChecked, unit, addon, model);
		}
	}

	/* Called when an addon is selected or deselected. 
	 * Modifies the unit to perform the addon in question.
	 */
	$scope.setAddOnCost = function(isChecked, unit, addOn, model) {
		registerAddOnStatus(addOn.id, isChecked, unit.name, model);
		switch(addOn.typeid) {
			case AddonTypesEnum.Direct: 
				isChecked ?
					$scope.addOnCosts[unit] += addOn.cost
					:
					$scope.addOnCosts[unit] -= addOn.cost;
			break;
			case AddonTypesEnum.ReplaceItem: 
			case AddonTypesEnum.AddItem: 
				if(isChecked) {
					replaceItem(model, addOn.itemIdToRemove, addOn.itemIdToAdd, unit);
				}
				else {
					replaceItem(model, addOn.itemIdToAdd, addOn.itemIdToRemove, unit);
				}
			break;
			case AddonTypesEnum.IncreaseNumberOfModels:
				if(isChecked) {
					increaseNumberOfModels(addOn.model, addOn.amount);
				}
				else {
					increaseNumberOfModels(addOn.model, -addOn.amount);
				}
			break;
			case AddonTypesEnum.ReplaceItemFromSet:
				if(isChecked) {
					replaceItem(model, addOn.itemIdToRemove, addOn.itemIdToAdd, unit);
				}
				else {
					replaceItem(model, addOn.itemIdToAdd, addOn.itemIdToRemove, unit);
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

	/* Adds a power to a unit.
	 *
	 */
	function addPowerToUnit(unit, power, model, parentIdx, powerIdx) {
		if(!unit.selectedPowers) { unit.selectedPowers = []; }
		//Possibly todo: remove get power ID here which may be necessary for file upload
		// Seems like maybe selectedPowers is exlcusively used for interacting with javascript
		// and using JQuery to check the boxes.
		unit.selectedPowers.push(power.id);
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
	 * Takes in a model to add and the amount to add.
	 * If amount is negative, removes models instead, pop()ing.
	 */
	function increaseNumberOfModels(model, amount) {
		$scope.myArmyV2.forEach((elem) => {
			if(elem.name == model.unitName) {
				if(!elem.startingNumberOfModels) {
					elem.startingNumberOfModels = elem.numberOfModels;
				}
				elem.numberOfModels += amount;

			}
		});
		if(amount > 0){
			while(amount--)
			{
				addModelV2(model);
			}
		}
		else {
			amount *= -1;
			for(let i = 0; i < amount; i++) {
				$scope.models[model.unitName].pop();
			}
		}
	}

	/* Replaces an item on a given model.
	 * (removes an optional item and adds another).
	 * Takes in model, the model to replace, 
	 * oldITemId, the id of the item to remove 
	 *     or null, in the case of Add Item
	 * newItemId, the id of the item to add
	 * unit, the unit that the model belongs to.
	 * Relies on and modifies global scope ($scope.models).
	 */
	function replaceItem(model, oldItemId, newItemId, unit) {
		$scope.models[unit.name].forEach((soldier) => {
			if(soldier.name == model.name) {// Find the right buckaroo
				let toRemove = -1;
				soldier.gear.forEach((item, idx) => {
					if(item.id === oldItemId) { // ID or gearId?
						toRemove = idx;
					}
				});
				if(toRemove !== -1) {
					soldier.gear.splice(toRemove, 1);
				}
				// Separate splice becuase this is used for both add and remove
				const newItem = getGearById(newItemId);
				if(newItemId) {
					soldier.gear.splice(toRemove, 0, newItem);
				}
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

	/* Calculates the total cost of gear for a unit
	 * Takes in an array of gear
	 * Returns an integer total cost of gear
	 */
	function calculateModelGearCostV2(gearArr) {
		if(!gearArr || gearArr.length === 0) { return; }
		// console.log("")
		// console.log("calculate gear cost", gearArr);
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
	
	//IN PROGRESS TODO
	function cloneModel(model) {
		let copy = {};
		copy.addons = model.addons.slice(0);
		copy.baseName = model.baseName; // Necessary?
		copy.unitName = model.unitName;
		copy.gear = model.gear.slice(0);
		copy.id = model.id;
		copy.name = model.name;
		copy.squadNames = model.squadNames; // Necessary?
		return copy;
	}

	/* Takes a unit and returns a deep copy
	 * of that unit. Unfortunately this is 
	 * done by manually iterating over each
	 * field.
	 * If IsModelLevel is true, filters addons 
	 * such that only model-level addons are 
	 * present. Otherwise, all add-ons exist.
	 */
	 //Deprecate me
	function cloneUnitV2(unit, isModelLevel) {
		let copy = {};
		copy.abilities = unit.abilities.slice(0);
		copy.addons = unit.addons.slice(0);
		copy.baseName = unit.baseName; //Necessary?
		copy.costPerModel = unit.costPerModel;
		copy.id = unit.id;
		copy.name = unit.name;
		copy.numberOfModels = unit.numberOfModels; //Necessary?
		copy.squadNames = unit.squadNames; // Necessary?
		copy.startingNumberOfModels = unit.startingNumberOfModels; //Necessary?
		// copy.separateGear = unit.separateGear;
		copy.powers = unit.powers; //Need to deep copy? May have problems in future
		copy.powers.known = unit.powers.known.slice(0);
		copy.powers.options = unit.powers.options.slice(0);
		
		if(isModelLevel) {
			copy.addons = copy.addons.filter( (addon) => {
				return addon.level === 'model'
			});
		}
		
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

	/* Register if a unit or model has taken a given addon.
	 * At the model level, this is used to limit addons that can only
	 * be taken a set number of times across a unit (such as one model may 
	 * exchange their blaster for a rifle). 
	 * At the unit level, this is used to check for mutexes, e.g. addons that say
	 * A unit may increase their count by 2 models or by 5 models.
	*/
	function registerAddOnStatus(addOnId, isEnabled, unitName, model, idx){
		let checkBoxid;
		if(model) {
			if(!$scope.enabledAddOns[model.unitName]){
				$scope.enabledAddOns[model.unitName] = [];
			}
			if(!$scope.enabledAddOns[model.unitName][addOnId]) {
				$scope.enabledAddOns[model.unitName][addOnId] = 0;
			}
			$scope.enabledAddOns[model.unitName][addOnId] += isEnabled ? 1 : -1;
			checkBoxid = $scope.getAddOnId(false, model.name, idx);
		}
		else {
			if(!$scope.enabledAddOns[unitName]){
				$scope.enabledAddOns[unitName] = [];
			}
			if(!$scope.enabledAddOns[unitName][addOnId]) {
				$scope.enabledAddOns[unitName][addOnId] = 0;
			}
			$scope.enabledAddOns[unitName][addOnId] += isEnabled ? 1 : -1;
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
	 * currently in existence. This allows the 
	 * same unit to be added multiple times while
	 * keeping reasonable names.
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
	
	function addModelV2(model) {
		let newModel = cloneModel(model);
		$scope.models[newModel.unitName].push(newModel);
		newModel.name = getModelName(model);
		if (!$scope.$$phase) { // Anti-pattern. Means $scope.Apply() isn't high enough in call stack.
			$scope.$apply(); // Has to be here for last step in AddUnitsV2 to avoid $digest conflict.
		}
	}

	/* Takes in a model that knows its unit name
	* Returns a name that's the model name plus
	* the number of models in the squad.
	* e.g. Plague Marine -> Plage Marine 1
	* TODO:
	* May be an easier way, as all models know 
	* How many are to be in the sqad. Probably
	* Can make it only call this if modelCount > 1.
	*/
	function getModelName(model) { //TODO handle mixed units better.
		const numModelsInSquad = $scope.models[model.unitName].length;
		return model.name + ' ' + numModelsInSquad;
		
	}

	function deregisterAddOnStatus(unitName) {
		if($scope.enabledAddOns[unitName]) {
			$scope.enabledAddOns[unitName] = [];
		}
	}

});
