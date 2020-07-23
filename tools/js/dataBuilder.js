let app = angular.module('armyBuilder', []);
app.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
}]);
app.component('jsonPicker', {
	bindings: {
		newModel: '=',
		output: '=',
		type: '@',
		existingData: '=',
		options: '='
	},
    templateUrl: 'js/components/JsonPicker.html',
    controller: ['$scope', '$compile', function GreetUserControzller($scope, $compile) {
		this.myRand = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		this.getNewElementName = function() {
			return 'newEntry' + this.myRand;
		}
		
		this.getAform = function() {
			if(!this.aform) {
				this.aform = (angular.element(document.getElementById(this.getNewElementName())));
			}
			return this.aform;
		}
		
		this.getNewItemDiv = function() {
			if(!this.newItemDiv) {
				this.newItemDiv = document.getElementById(this.getNewElementName());
			}
			return this.newItemDiv;
		}
		
		this.shouldShowSelectButton = function() {
			let ret = true;
			if(this.type === 'array') {
				ret = true;
			}
			if(this.type === 'string') {
				ret = false;
			}
			return ret;
		}
		
		this.processItemForAdd = function(item) {
			if(!item) { return;}
			if(item === "new") {
				if(!this.addingNew){
					this.addingNew = true;
					this.myModel = new this.newModel();
					Object.keys(this.myModel).forEach( (key) => {
						this.getNewItemDiv().innerHTML +=
						this.generateHtmlInput(key);
					});
					this.myModel.id = this.existingData.length + 1;
					this.getAform().addClass("subblock");
					$compile(this.getAform())($scope);
				}
			} else {
				item = JSON.parse(item);
				this.addItem(item);
			}
		}
		
		this.pushScoped = function(key, item) { 
		 this.myModel[key].push(parseInt(item));
		}
		
		this.generateHtmlInput = function(key) {
			let ifcode = "";
			let typeCode = key === 'Cost' ? 'type="number"' : ' '; // Assume all Cost will be number, nothing else will be.
			let model;
			let ret = "<label>" + key + ":</label>";
			if(this.options && (Object.keys(this.options).indexOf(key) != -1)) {
				const opts = this.options[key];
				if(opts.conditional) {
					const condition = "$ctrl.myModel." + opts.on.key + "===" + "'" + opts.on.value + "'";
					ifcode ="ng-if=\""+condition+"\"";
				}

				ret = "<label " + ifcode +":>" + key + "</label>"
				
				if(opts.type === 'dropdown') {
					if(opts.source === 'list') {
						model = "<select " + ifcode +" ng-model=\"$ctrl.myModel." + key + "\">";
						opts.allowed.forEach( option => {
							model += "<option value=\"" + option + "\">"+option+"</option>"
						});
						model += "</select><br>";
					}
					
					if(opts.source === 'data') {
						model = "<select " + ifcode +" ng-model=\"$ctrl.scopedSel\">";
						this.existingData.forEach( option => {
							model += "<option value=\"" + option.id + "\">"+option.Text+"</option>"
						});
						model += "</select><button ng-click=\"$ctrl.pushScoped('"+key+"', $ctrl.scopedSel)\">Add</button><br>";
					}
					return ret + model;
				}
			}
			model = " ng-model=\"$ctrl.myModel." + key + "\"></input><" + ifcode +"br>";
			return ret + "<input  "+ ifcode + typeCode + model;	
		}
		
		this.addItem = function (item) {
			if(this.type === 'array') {
				this.output.push(parseInt(item.id));
			} else if(this.type === 'string') {
				this.output = item.Name;
			}
		}
		
		this.selectChanged = function(item) {
			if(item && item !== 'new' && this.type === 'string') {
				item = JSON.parse(item);
				this.addItem(item);
			}
		}
		
		this.addNewItem = function () {
			this.addingNew = false;
			this.getNewItemDiv().innerHTML = "";
			this.addItem(this.myModel);
			this.existingData.push(this.myModel);
		}
		
	}]
});

app.controller('builderCtrl', function($scope, $http){
	
	$scope.allGamesV2 = [];
	$scope.currentFactions = [];
	$scope.allAbilitiesV2 = [];
	$scope.allGearV2 = [];
	$scope.allGearRanges = [];
	$scope.allAddonsV2 = [];
	$scope.allAddonTypes = [];
	$scope.allAddonLevels = [];
	$scope.allPowersV2 = [];
	$scope.AddonTypesEnum = {ReplaceItem:1, IncreaseNumberOfModels:2, Direct: 3, AddItem: 4};

	
	
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
		await updateAddonLevelsAsync();
		await updatePowersAsync();
	})();
	
	/* Gets all games from database
	 */
	async function getGamesAsync() {
		const response = await $http.post('../src/php/getGames.php');
		return response.data;
	}

	/* UpdategamesAsync 
	 * Gets all games from database
	 * And modifies $scope to contain updates.
	*/
	async function updateGamesAsync() {
		$scope.allGamesV2 = await getGamesAsync();
		$scope.$apply();
	}

	/* Gets all factions for a given gameid from database
	 */
	async function getFactionsForGame(gameId) {
		if(!gameId) { return };
		const response = await $http.post('../src/php/getFactionsForGame.php?gameId='+gameId);
		return response.data;
	}
	
	/* UpdateFactionsAsync 
	 * Gets all games from database
	 * And modifies $scope to contain updates.
	*/
	$scope.updateFactionsForGameAsync = async function(gameId) {
		$scope.currentFactions = await getFactionsForGame(gameId);
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
		await $http.post('php/addGame.php?name='+name);
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
		await $http.post('php/addFaction.php?gameId='+gameId+'&name='+factionName);
		await $scope.updateFactionsForGameAsync(gameId);
	}

	/* Gets all abilities from database
	 */
	async function getAbilitiesAsync() {
		const response = await $http.post('php/getAllAbilities.php');
		return response.data;
	}
	
	/* updateAbilitiesAsync 
	 * Gets all abilities from database
	 * And modifies $scope to contain the data.
	*/
	async function updateAbilitiesAsync() {
		$scope.allAbilitiesV2 = await getAbilitiesAsync();
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
		await $http.post('php/addAbility.php?name='+name+'&text='+text);
		await updateAbilitiesAsync();
	}
	
	/* Gets all gear from database
	 */
	async function getGearAsync() {
		const response = await $http.post('../src/php/getAllGear.php');
		return response.data;
	}
	
	/* updateGearAsync 
	 * Gets all gear from database
	 * And modifies $scope to contain the data.
	 * THen sorts the same
	 */
	async function updateGearAsync() {
		$scope.allGearV2 = await getGearAsync();
		$scope.allGearV2.sort((a,b) => a.name <= b.name ? -1 : 1);
		$scope.$apply();
	}
	
	/* Gets all gear ranges from database
	 */
	async function getGearRangesAsync() {
		const response = await $http.post('php/getGearRanges.php');
		return response.data;
	}
	
	/* updateGearRangesAsync 
	 * Gets all gear ranges from database
	 * And modifies $scope to contain the data.
	*/
	async function updateGearRangesAsync() {
		$scope.allGearRanges = await getGearRangesAsync();
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
		await $http.post('php/addGear.php?name='+name+'&cost='+cost+'&rangeId='+rangeId);
		//TODO:
		// get the gear id from the above call
		// Add gear Abilities
		// Add call to map gear ability to gear
		// Same for gear keywords?? We don't use this on army builder (yet)
		await updateGearAsync();
	}
	
	/* Gets all addonTypes from database
	 */
	async function getAddonTypesAsync() {
		const response = await $http.post('php/getAddonTypes.php');
		return response.data;
	}
	
	/* updateAddonTypesAsync 
	 * Gets all addon types from database
	 * And modifies $scope to contain the data.
	*/
	async function updateAddonTypesAsync() {
		$scope.allAddonTypes = await getAddonTypesAsync();
		$scope.allAddonTypes.map( (type) => {type.name = type.name.charAt(0).toUpperCase() + type.name.slice(1)});
		$scope.$apply();
	}
	
	/* Gets all addons from database
	 */
	async function getAddonsAsync() {
		const response = await $http.post('php/getAllAddons.php');
		return response.data;
	}
	
	/* updateAddonsAsync 
	 * Gets all Addons from database
	 * And modifies $scope to contain the data.
	*/
	async function updateAddonsAsync() {
		$scope.allAddonsV2 = await getAddonsAsync();
		$scope.$apply();
	}
	
	/* addNewAddon. Takes in the text, cost, typeid,
	 * (1 for replace item, 2 for add models, etc),
	 * Level id (1 for mode, 2 for unit),
	 * item id to add, item id to remove, 
	 * amount (if applicable), and number of times
	 * the addon can be taken of the addon
	 * to add. Adds it to the database if
	 * there isn't already an addon with that text. 
	*/
	$scope.addNewAddon = async function(text, cost, typeId, levelId, addItemId, removeItemId, amount, maxTimesTaken) {
		if(!text || !typeId || !levelId) { return; }
		if(typeId === $scope.AddonTypesEnum.IncreaseNumberOfModels && !amount) { return; }
		if(typeId === $scope.AddonTypesEnum.AddItem && !addItemId) { return; }
		if(typeId === $scope.AddonTypesEnum.ReplaceItem && (!addItemId || !removeItemId)) { return; }
		if(typeId === $scope.AddonTypesEnum.Direct && !cost) { return; }
		if(!maxTimesTaken) { maxTimesTaken = 1; }
		
		for(let i = 0; i < arguments.length; i++) {
			if(!arguments[i]) {
				arguments[i] = null;
			}
		}
		
		if($scope.allAddonsV2.findIndex( (addon) => addon.text === text) !== -1) { return; } // addon already exists
		$scope.allAddonsV2.push( {'text' : text} );
		
		$http({
		  method: 'POST',
		  url: 'php/addNewAddon.php?cost='+cost+'&typeId='+typeId+'&levelId='+levelId+'&addItemId='+addItemId+'&removeItemId='+removeItemId+'&amount='+amount+'&text='+text+'&times='+maxTimesTaken,
		  data: JSON.stringify({text})
		})
		.then(async function (success) {
		  console.log("Success");
		  console.log(success);
		  await updateAddonsAsync();
		}, function (error) {
		  console.log(error);
		});
		

	}
	
	/* Gets all addonLevels from database
	 */
	async function getAddonLevelsAsync() {
		const response = await $http.post('php/getAddonLevels.php');
		return response.data;
	}
	
	/* updateAddonLevelsAsync 
	 * Gets all addon types from database
	 * And modifies $scope to contain the data.
	*/
	async function updateAddonLevelsAsync() {
		$scope.allAddonLevels = await getAddonLevelsAsync();
		$scope.allAddonLevels.map( (level) => {level.name = level.name.charAt(0).toUpperCase() + level.name.slice(1)});
		$scope.$apply();
	}
	
	/* Gets all powers from database
	 */
	async function getPowersAsync() {
		const response = await $http.post('php/getAllPowers.php');
		return response.data;
	}
	
	/* updatePowersAsync 
	 * Gets all powers from database
	 * And modifies $scope to contain the data.
	*/
	async function updatePowersAsync() {
		$scope.allPowersV2 = await getAddonsAsync();
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
		await $http.post('php/addPower.php?name='+name+'&text='+text);
		await updatePowersAsync();
	}
	
	
	/* addUnit. Takes in the name, number of models,
	 * cost and factionid of the unit to add.
	 * Adds it to the database.
	 * Then uses that id to associate gear, abilites, 
	 * addons, and powers.
	*/
	$scope.addUnit = async function(name, numModels, cost, factionId,
									gearArr, abilArr, addonArr, powerArr) {
		if(!name || !numModels || !factionId || (!cost && cost !== 0)) { return; }
		const newUnitId = await $http.post('php/addUnit.php?name='+name+'&numModels='+numModels+'&cost='+cost+'&factionId='+factionId);
		
		//TODO for each gear add entry to unit_to_gear
		//TODO for each ability add entry to unit_to_ability
		//TOOD for each addon add entry to unit_to_addon
		//TODO for each known power add entry to unit_to power
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	// Old
	$scope.game = "Warhammer 40k 8th Edition";
	$scope.faction = { Name: "Space Marines"};
	$scope.addOnOptions = {
		Type: {
			type: 'dropdown',
			source: 'list',
			allowed: ['Direct', 'IncreaseModelNum', 'ReplaceItem', 'AddItem']
		},
		Level: {
			type: 'dropdown',
			source: 'list',
			allowed: ['Model', 'Unit']
		},
		Amount: {
			conditional: true,
			on: {
				key: 'Type',
				value: 'IncreaseModelNum'
			}
		},
		Remove: {
			conditional: true,
			on: {
				key: 'Type',
				value: 'ReplaceItem'
			}
		},
		Add: {
			conditional: true,
			on: {
				key: 'Type',
				value: 'ReplaceItem'
			}
		},
		Mutex: {
			type: 'dropdown',
			source: 'data'
		}
	}
	
	class gearModel {
		constructor(id, Name, Cost, Ability, Keywords) {
			this.id = id;
			this.Name = Name;
			this.Cost = Cost;
			this.Ability = Ability;
			this.Keywords = Keywords;
		}
	}
	$scope.gearModel = gearModel;
	
	class abilityModel {
		constructor(id, Name, Text) {
			this.id = id;
			this.Name = Name;
			this.Text = Text;
		}
	}
	$scope.abilityModel = abilityModel;
	$scope.powerModel = abilityModel;
	
	class addOnModel {
		constructor(id, Text, Cost, Type, Remove, Add, Level, Amount) {
			this.id = id;
			this.Text = Text;
			this.Cost = Cost;
			this.Level = Level;
			this.Mutex = [];
			this.Type = Type;
			this.Amount = Amount;
			this.Remove = Remove;
			this.Add = Add;
		}
	}
	$scope.addOnModel = addOnModel;
	
	class unitModel {
		constructor(unitName, numTroops, unitCost, unitAbility, addOns, gear, powers) {
			this.Name = unitName;
			this.NumberOfModels = numTroops;
			this.Cost = unitCost;
			this.Abilities = unitAbility;
			this.AddOns = addOns;
			this.Gear = gear;
			this.Powers = powers;
		}
	}
	
	class factionModel {
		constructor(factionName) {
			this.Name = factionName;
		}
	}
	
	$scope.buildFile = function() {
			console.log("all games", $scope.games);
			let currGame = $scope.games.find( game => game.Name === $scope.game && game.Factions); // Factions check necessary because of how we create on new.
			let currGameIndex = $scope.games.findIndex( game => game.Name === $scope.game);
			console.log("currgame", currGame);
			console.log("cur game index", currGameIndex);
			
			if(!currGame) {
				console.log("Adding a new game");
				//We are adding a new game. Need to set curGame after adding to it.
				let newGame = {Name: $scope.game, Factions: []}
				$scope.games[currGameIndex] = newGame; //Can't just push here, need to override the object. When we add new, this gets created.
				currGame = newGame;
			}
			console.log("Halfway games", $scope.games);
				
			let currFac = currGame.Factions.find( fac => fac.Name === $scope.faction && fac.Units); // See above re: create on new.
			let currFacIndex = currGame.Factions.findIndex( fac => fac.Name === $scope.faction);
			if(!currFac) { 
				console.log("Adding a new faction");
				let newFac = {Name: $scope.faction, Units: []}
				currFacIndex = currFacIndex >= 0 ? currFacIndex : 0;
				currGame.Factions[currFacIndex] = newFac; //See above re pushing
				currFac = newFac;
			}
			
			currFac.Units.push($scope.myUnit);
			console.log("currFac", currFac);
			console.log("final games", $scope.games);
	}
	
	// Right now the entire file gets sent over the network, then destroyed and recreated. 
	// This can be more efficent if we only send changes and build the file in PHP
	$scope.postResults = function () {
		  $scope.buildFile();
		
		  $http.post(
          'php/processFile.php',
          {squads: {games: $scope.games}, items: {gear: $scope.gear}, addons: {addons: $scope.addons}, abilities: {abilities: $scope.abilities}, powers: {powers: $scope.powers}}, function(data) {
				console.log(data);
			}
        )
        .then(function(response) {
		  //Reset the form: myUnit, Faction, Game should all get zeroed. Or maybe just myUnit.
		  $scope.myUnit = new unitModel("Test", 1, 1, [], [], [], {Known: [], Options: {Amount: 0, From: []}});
        })
        .catch(function(response) {
          console.log('error', response);
        });
		  
	}
	
	$scope.unitModel = unitModel;
	$scope.factionModel = factionModel;
	$scope.myUnit = new unitModel("Test", 1, 1, [], [], [], {Known: [], Options: {Amount: 0, From: []}});
	
	
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
});
