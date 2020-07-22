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
	
	
	/* Immediately invoked function
	 * Initializes games and factions
	 */
	(async function initialize()
	{
		await updateGamesAsync();
		await updateAbilitiesAsync();
		await updateGearAsync();
		$scope.allGearV2.sort((a,b) => a.name <= b.name ? -1 : 1);
		await updateGearRangesAsync();
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
	*/
	async function updateGearAsync() {
		$scope.allGearV2 = await getGearAsync();
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
