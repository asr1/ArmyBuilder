let app = angular.module('armyBuilder', ['armyDataAccessController']);
app.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
}]);

app.controller('builderCtrl', function($scope, $http, dataAccess){
	$scope.allGamesV2 = [];
	$scope.currentFactions = [];
	$scope.allAbilitiesV2 = [];
	$scope.allGearV2 = [];
	$scope.allGearRanges = [];
	$scope.allGearAbilities = [];
	$scope.allAddonsV2 = [];
	$scope.allAddonTypes = [];
	$scope.allPowersV2 = [];
	$scope.allPowerSetsV2 = [];
	$scope.allModels = [];
	$scope.allItemSets = [];
	$scope.addonRequirementTypes = [];
	$scope.AddonTypesEnum = {ReplaceItem:1, IncreaseNumberOfModels:2, Direct: 3, AddItem: 4, ReplaceItemFromSet: 5};
	$scope.AddonRequireTypesEnum = {ModelRequiresAddon:1, UnitRequiresAddon:2, NumberOfModelsInUnit: 3};


	/* Immediately invoked function
	 * Initializes games and factions
	 */
	(async function initialize()
	{
		await updateGamesAsync();
		await updateAbilitiesAsync();
		await updateGearAsync();
		await updateGearRangesAsync();
		await updateAddonTypesAsync();
		await updateAddonsAsync();
		await updatePowersAsync();
		await updatePowerSetsAsync();
		await updateModelsAsync();
		await updateGearAbilitiesAsync();
		await updateItemSetsAsync();
		await updateAddonRequirementTypes();
	})();

	/* UpdategamesAsync 
	 * Gets all games from database
	 * And modifies $scope to contain updates.
	*/
	async function updateGamesAsync() {
		$scope.allGamesV2 = await dataAccess.getGamesAsync();
		$scope.$apply();
	}

	/* UpdateFactionsAsync 
	 * Gets all games from database
	 * And modifies $scope to contain updates.
	*/
	$scope.updateFactionsForGameAsync = async function(gameId) {
		$scope.currentFactions = await dataAccess.getFactionsForGame(gameId);
		$scope.$apply();
	}

	/* addNewGame. Takes in the name of 
	 * the game to add. Adds it to the
	 * database if there isn't already a 
	 * game with that name. 
	*/
	$scope.addNewGame = async function(name) {
		if(!name) { return; }
		if($scope.allGamesV2.findIndex( (game) => game.name === name) !== -1) { return; } // Game already exists
		$scope.allGamesV2.push( {'name' : name} );
		await $http.post('php/write/addGame.php?name='+name);
		await updateGamesAsync();
	}

	/* addNewFaction. Takes in the id of 
	 * the game  and the name of the faction 
	 * to add. Adds it to the database if
	 * there isn't already a faction with that name. 
	*/
	$scope.addNewFaction = async function(gameId, factionName) {
		if(!factionName || !gameId) { return; }
		await $scope.updateFactionsForGameAsync(gameId);
		if($scope.currentFactions.findIndex( (faction) => faction.name === factionName) !== -1) { return; } // Faction already exists
		$scope.currentFactions.push( {'name' : factionName} );
		await $http.post('php/write/addFaction.php?gameId='+gameId+'&name='+factionName);
		await $scope.updateFactionsForGameAsync(gameId);
	}

	/* updateAbilitiesAsync 
	 * Gets all abilities from database
	 * And modifies $scope to contain the data.
	*/
	async function updateAbilitiesAsync() {
		$scope.allAbilitiesV2 = await dataAccess.getAbilitiesAsync();
		$scope.$apply();
	}

	/* updateAddonRequirementTypes 
	 * Gets all addon requirement types from database
	 * And modifies $scope to contain the data.
	*/
	async function updateAddonRequirementTypes() {
		$scope.addonRequirementTypes = await dataAccess.getAddonRequirementTypes();
		$scope.$apply();
	}

	/* addNewAbility. Takes in the name of 
	 * the ability  and the text of the ability 
	 * to add. Adds it to the database if
	 * there isn't already an ability with that name. 
	*/
	$scope.addNewAbility = async function(name, text) {
		if(!name || !text) { return; }
		if($scope.allAbilitiesV2.findIndex( (ability) => ability.name === name) !== -1) { return; } // Ability already exists
		$scope.allAbilitiesV2.push( {'name' : name} );
		await $http.post('php/write/addAbility.php?name='+name+'&text='+text);
		await updateAbilitiesAsync();
	}

	/* addNewGearAbility. Takes in the text of 
	 * the ability. Adds it to the database if
	 * there isn't already a gear ability with that name. 
	*/
	$scope.addNewGearAbility = async function(text) {
		if(!text) { return; }
		if($scope.allGearAbilities.findIndex( (ability) => ability.text === text) !== -1) { return; } // Ability already exists
		$scope.allGearAbilities.push( {'text' : name} );
		await $http.post('php/write/addGearAbility.php?text='+text);
		await updateGearAbilitiesAsync();
	}

	/* mapGearToAbility. Takes in the id of the gear and 
	 * the id of the ability. Maps it in the DB
	*/
	$scope.mapGearToAbility = async function(gearid, abilityid) {
		if(!gearid || !abilityid) { return; }
		await $http.post('php/write/mapAbilityToGear.php?gearid='+gearid+'abilityid='+abilityid);
	}

	/* updateGearAsync 
	 * Gets all gear from database
	 * And modifies $scope to contain the data.
	 * THen sorts the same
	 */
	async function updateGearAsync() {
		$scope.allGearV2 = await dataAccess.getGearAsync();
		$scope.allGearV2.sort((a,b) => a.name <= b.name ? -1 : 1);
		$scope.$apply();
	}

	/* updateGearRangesAsync 
	 * Gets all gear ranges from database
	 * And modifies $scope to contain the data.
	*/
	async function updateGearRangesAsync() {
		$scope.allGearRanges = await dataAccess.getGearRangesAsync();
		$scope.$apply();
	}

	/* updateGearAbilitiesAsync 
	 * Gets all gear abilities from database
	 * And modifies $scope to contain the data.
	*/
	async function updateGearAbilitiesAsync() {
		$scope.allGearAbilities = await dataAccess.getGearAbilitiesAsync();
		$scope.$apply();
	}

	/* addNewGear. Takes in the name, cost, and
	 * rangeTypeId (1 for melee, 2 for ranged, etc)
	 * to add. Adds it to the database if
	 * there isn't already a gear with that name. 
	*/
	$scope.addNewGear = async function(name, cost, rangeId) {
		if(!name || !rangeId || (!cost && cost !== 0) ) { return; }
		if($scope.allGearV2.findIndex( (gear) => gear.name === name) !== -1) { return; } // Gear already exists
		console.log($scope.allGearV2.findIndex( (gear) => gear.name === name));
		$scope.allGearV2.push( {'name' : name} );
		await $http.post('php/write/addGear.php?name='+name+'&cost='+cost+'&rangeId='+rangeId);
		await updateGearAsync();
	}

	/* updateAddonTypesAsync 
	 * Gets all addon types from database
	 * And modifies $scope to contain the data.
	*/
	async function updateAddonTypesAsync() {
		$scope.allAddonTypes = await dataAccess.getAddonTypesAsync();
		$scope.allAddonTypes.map( (type) => {type.name = type.name.charAt(0).toUpperCase() + type.name.slice(1)});
		$scope.$apply();
	}

	/* updateAddonsAsync 
	 * Gets all Addons from database
	 * And modifies $scope to contain the data.
	*/
	async function updateAddonsAsync() {
		$scope.allAddonsV2 = await dataAccess.getAddonsAsync();
		$scope.$apply();
	}

	/* addNewAddon. Creates a new addon and adds
	 * it to the database if there isn't already
	 * an addon with that text
	 * text            - The text of the addon to add
	 * cost            - The cost of the addon to add
				Oftentimes 0 if it's inferred, like for 
				replace weapon
	 * typeid          - type id of addon (1 for replace
				item, 2 for add models, etc)
	 * addItemId       - id of the item to add
	 * removeItemId    - id of the item to remove
	 * amount          - if applicable, the number of models to add.
				also used for replace item from set
	 * maxTimesTaken   - the number of times the addon can be taken.
				For example, add
				between 1 and 20 tyranids. Defaults to 1
	 * modelId         - if applicable, the modelId to be added
	 * unitLimit       - the max number of times an addon can be taken
				by models in one unit across all models. For example,
				3 of your skitari can add omnispex
	 * grantsArr       - array of addonIds. If this addon is taken, it 
				gives all of these addons for free. Addons in the array
				must be at the same level (unit or model) as this addon,
				as they will apply to the same entity. Used for complex
				addons that are better expressed as a combination of 
				simple ones. For example, add one skitari ranger and 2
				techpriests to this unit.
	* addItemSet       - id of set that items can be added if replacing
				one item with items from set (type 5).
	*/ //TODO break this down into sub parts, grants should be a separate function
	$scope.addNewAddon = async function(text, cost, typeId, addItemId, removeItemId, amount, maxTimesTaken, modelId, unitLimit, grantsArr, addItemSet) {
		if(!text || !typeId) { return; }
		if(typeId === $scope.AddonTypesEnum.IncreaseNumberOfModels && (!amount || !modelId)) { return; }
		if(typeId === $scope.AddonTypesEnum.AddItem && !addItemId) { return; }
		if(typeId === $scope.AddonTypesEnum.ReplaceItem && (!addItemId || !removeItemId)) { return; }
		if(!maxTimesTaken) { maxTimesTaken = 1; }

		for(let i = 0; i < arguments.length; i++) {
			if(!arguments[i]) {
				arguments[i] = null;
			}
		}

		if($scope.allAddonsV2.findIndex( (addon) => addon.text === text) !== -1) { return; } // addon already exists
		$scope.allAddonsV2.push( {'text' : text} );

		const newAddonId = await $http.post('php/write/addNewAddon.php?cost='+cost+'&typeId='+typeId+'&addItemId='+addItemId+'&removeItemId='+removeItemId+'&amount='+amount+'&text='+text+'&times='+maxTimesTaken+'&modelId='+modelId+'&unitLimit='+unitLimit+'&itemSetId='+addItemSet);

		let promises = [];
		grantsArr.forEach((grandAddonId) => {
			promises.push($http.post('php/write/mapAddonGrants.php?addonId='+newAddonId+'&idOfAddonToGrant='+grandAddonId));
		});
		await Promise.all(promises);

		await updateAddonsAsync();
	}

	/* updateAddonRequirements - maps an addon to its prerequisites
	 * addonId 			- The ID of the addon that has prerequisites
	 * requirementType	= The addon_require_type. 
			1 for the model with this addon needs to have this prereq addon.
			2 for the unit that this model is part of needs this prereq addon.
			3 for restrictions about the min or max number of models in this unit.
	* prereqAddonId 	- The id of the addon that is a prereq in case 1 or 2
	* min				- The minimum number of units required for an addon in case 3
	* max 				- The maximum number of units required for an addon in case 3
	*/
	$scope.updateAddonRequirements = async function(addonId, requirementType, prereqAddonId, min, max){
		await $http.post('php/write/mapAddonReqs.php?addonId='+addonId+'&requirementType='+requirementType+'&prereqAddonId='+prereqAddonId+'&min='+min+'&max='+max));
		await updateAddonsAsync();
	}

	/* updatePowersAsync 
	 * Gets all powers from database
	 * And modifies $scope to contain the data.
	*/
	async function updatePowersAsync() {
		$scope.allPowersV2 = await dataAccess.getPowersAsync();
		$scope.$apply();
	}

	/* addNewPower. Takes in the name and text
	 * of the power to add. Adds it to the database 
	 * if there isn't already a power with that name. 
	*/
	$scope.addNewPower = async function(name, text) {
		if(!name || !text) { return; }
		if($scope.allPowersV2.findIndex( (power) => power.name === name) !== -1) { return; } // Power already exists
		$scope.allPowersV2.push( {'name' : name} );
		await $http.post('php/write/addPower.php?name='+name+'&text='+text);
		await updatePowersAsync();
	}

	/* addUnit. Takes in the name,
	 * cost and factionid of the unit to add
	 * Adds it to the database.
	 * Then uses that id to associate abilites, 
	 * addons, powerSets, which is an arry of
	 * objects with 2 properties; amount - the number
	 * of powers a unit gets from a set, and from - the
	 * set (including setId) that the unit chooses from,
	 * and models, the models to add.
	 * These are used to populate the tables approprirately.
	*/
	$scope.addUnit = async function(name, cost, factionId,
									abilArr, addonArr, powerArr, powerSets, models) {
		if(!name || !factionId || (!cost && cost !== 0) || !models || models.length == 0) { return; }
		const numModels = $scope.getNumModels(models);
		const response = await $http.post('php/write/addUnit.php?name='+name+'&numModels='+numModels+'&cost='+cost+'&factionId='+factionId);
		const newUnitId = response.data;

		await mapUnitToAbility(newUnitId, abilArr);
		await mapAddonToUnit(newUnitId, addonArr);
		await addKnownPowers(newUnitId, powerArr);
		await mapUnitToPowerSets(newUnitId, powerSets);
		await mapModelsToUnit(newUnitId, models);
	}

	/* Returns the total amount of models
	 * given a set of models that have an
	 * amount.
 	*/
	$scope.getNumModels = function(models) {
		return models.reduce( (currentValue, model) => currentValue + model.amount, 0);
	}

	/* addModel. Takes in the name, number of models,
	 * cost and factionid of the unit to add
	 * Adds it to the database.
	 * Then uses that id to associate abilites, 
	 * addons, and powerSets, which is an arry of
	 * objects with 2 properties; amount - the number
	 * of powers a unit gets from a set, and from - the
	 * set (including setId) that the unit chooses from.
	 * These are used to populate the tables approprirately.
	*/
	$scope.addModel = async function(name, gearArr, addonArr) {
		if(!name) { return; }
		const response = await $http.post('php/write/addModel.php?name='+name);
		const newModelId = response.data;

		await addGearToModel(newModelId, gearArr);
		await mapAddonToUnit(newModelId, addonArr);
		await updateModelsAsync();
	}

	/* mapUnitToPowerSets. Takes in the unit id and 
	 * array of powerSets, where a powerSet is an object
	 * with 2 properties; amount - the number
	 * of powers a unit gets from a set, and from - the
	 * set (including setId) that the unit chooses from. 
	 * Adds each mapping to the databse
	*/
	async function mapUnitToPowerSets(unitId, powerSetArr) {
		if(!unitId || !powerSetArr || !powerSetArr.length) { return; }

		let promises = [];
		powerSetArr.forEach((set) => {
			promises.push($http.post('php/write/mapUnitToPowerSet.php?unitId='+unitId+'&setId='+set.from.setId+'&amount='+set.amount));
		});
		await Promise.all(promises);
	}

	/* mapModelsToUnit. Takes in the unit id and 
	 * array of models and adds each mapping to
	 * the databse.
	*/
	async function mapModelsToUnit(unitId, models) {
		if(!unitId || !models || !models.length) { return; }

		let promises = [];
		models.forEach((model) => {
			promises.push($http.post('php/write/mapModelToUnit.php?unitId='+unitId+'&modelId='+model.id+'&modelCount='+model.amount));
		});
		await Promise.all(promises);
	}

	/* addGearToModel. Takes in the model id and 
	 * array of gear to add. Adds each mapping 
	 * to the databse
	*/
	async function addGearToModel(modelId, gearArr) {
		if(!modelId || !gearArr || !gearArr.length) { return; }

		let promises = [];
		gearArr.forEach((gear) => {
			promises.push($http.post('php/write/mapGearToModel.php?modelId='+modelId+'&gearId='+gear.id));
		});
		await Promise.all(promises);
	}

	/* mapUnitToAbility. Takes in the unit id and 
	 * array of abilities to add. Adds each mapping to
	 * the databse
	*/
	async function mapUnitToAbility(unitId, abilArr) {
		if(!unitId || !abilArr || !abilArr.length) { return; }

		let promises = [];
		abilArr.forEach((ability) => {
			promises.push($http.post('php/write/mapAbilityToUnit.php?unitId='+unitId+'&abilityId='+ability.id));
		});
		await Promise.all(promises);
	}

	/* mapAddonToUnit. Takes in the unit id and 
	 * array of addons to add. Adds each mapping to
	 * the databse
	*/
	async function mapAddonToUnit(unitId, addonArr) {
		if(!unitId || !addonArr || !addonArr.length) { return; }

		let promises = [];
		addonArr.forEach((addon) => {
			promises.push($http.post('php/write/mapAddonToUnit.php?unitId='+unitId+'&addonId='+addon.id));
		});
		await Promise.all(promises);
	}

	/* mapAddonToModel. Takes in the model id and 
	 * array of addons to add. Adds each mapping to
	 * the databse
	*/
	async function mapAddonToModel(modelId, addonArr) {
		if(!modelId || !addonArr || !addonArr.length) { return; }

		let promises = [];
		addonArr.forEach((addon) => {
			promises.push($http.post('php/write/mapAddonToModel.php?modelId='+modelId+'&addonId='+addon.id));
		});
		await Promise.all(promises);
	}

	/* addKnownPowers. Takes in the unit id and 
	 * array of powers to add. Adds each mapping to
	 * the databse
	*/
	async function addKnownPowers(unitId, powerArr) {
		if(!unitId || !powerArr || !powerArr.length) { return; }

		let promises = [];
		powerArr.forEach((power) => {
			promises.push($http.post('php/mapPowerToUnit.php?unitId='+unitId+'&powerId='+power.id));
		});
		await Promise.all(promises);
	}

	/* updateItemSetsAsync 
	 * Gets all item sets from database
	 * And modifies $scope to contain the data.
	*/
	async function updateItemSetsAsync() {
		$scope.allItemSets = await dataAccess.getItemSetsAsync();
		$scope.$apply();
	}

	/* updatePowerSetsAsync 
	 * Gets all power sets from database
	 * And modifies $scope to contain the data.
	*/
	async function updatePowerSetsAsync() {
		$scope.allPowerSetsV2 = await dataAccess.getPowerSetsAsync();
		$scope.$apply();
	}

	/* updateModelsAsync 
	 * Gets all power sets from database
	 * And modifies $scope to contain the data.
	*/
	async function updateModelsAsync() {
		$scope.allModels = await dataAccess.getModelsAsync();
		$scope.$apply();
	}

	/* addNewPowerSet. Takes in the name and array of
	 * of the powers to add. Adds it to the database 
	 * if there isn't already a powerSet with that name. 
	*/
	$scope.addNewPowerSet = async function(name, powerArr) {
		if(!name || !powerArr || !powerArr.length) { return; }
		if($scope.allPowerSetsV2.findIndex( (set) => set.name === name) !== -1) { return; } // Power set already exists
		$scope.allPowerSetsV2.push( {'name' : name, 'powers': powerArr} );
		const response = await $http.post('php/write/addPowerSet.php?name='+name);
		const newSetId = response.data;

		const promises = [];
		powerArr.forEach((power) => {
			promises.push($http.post('php/write/mapPowerToSet.php?setId='+newSetId+'&powerId='+power.id));
		});
		await Promise.all(promises);
		await updatePowerSetsAsync();
	}

	/* addNewItemSet. Takes in the name and array of
	 * of the items to add. Adds it to the database 
	 * if there isn't already an item set with that name. 
	*/
	$scope.addNewItemSet = async function(name, itemArr) {
		console.log("Horus");
		console.log(name);
		console.log(itemArr);
		if(!name || !itemArr || !itemArr.length) { return; }
		if($scope.allItemSets.findIndex( (set) => set.name === name) !== -1) { return; } // Item set already exists
		$scope.allItemSets.push( {'name' : name, 'items': itemArr} );
		const response = await $http.post('php/write/addItemSet.php?name='+name);
		const newSetId = response.data;
		console.log(newSetId);
		const promises = [];
		itemArr.forEach((item) => {
			promises.push($http.post('php/write/mapItemToSet.php?setId='+newSetId+'&itemId='+item.id));
		});
		await Promise.all(promises);
		await updateItemSetsAsync();
	}
});
