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
		newJson: '=',
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
		
		this.processItemForAdd = function(item){
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
		console.log(item)
		console.log(key)
		console.log(this.myModel);
		 this.myModel[key].push(parseInt(item));
		}
		
		this.generateHtmlInput = function(key) {
			let ifcode = "";
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
							console.log(option);
						});
						console.log(this.myModel[key]);
						model += "</select><button ng-click=\"$ctrl.pushScoped('"+key+"', $ctrl.scopedSel)\">Add</button><br>";
					}
					
					
					return ret + model;
				}
			}
			model = " ng-model=\"$ctrl.myModel." + key + "\"></input><" + ifcode +"br>";
			return ret + "<input  "+ ifcode + model;	
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
			console.log("mymodel", this.myModel);
			this.addingNew = false;
			this.getNewItemDiv().innerHTML = "";
			this.newJson += ",\r\n" + angular.toJson(this.myModel, true);
			console.log("add new type", typeof(this.myModel));
			this.addItem(this.myModel);
			this.existingData.push(this.myModel);
		}
		
	}]
});

app.controller('builderCtrl', function($scope, $http){
	$scope.gameJson = "";
	$scope.factionJson = "";
	$scope.abilitiesJson = "";
	$scope.addOnJson = "";
	$scope.gearJson = "";
	$scope.powerJson = "";
	$scope.powerOptionsJson = "";
	
	$scope.game = "Warhammer 40k 8th Edition";
	$scope.faction = { Name: "Space Marines"};
	$scope.addOnOptions = {
		Type: {
			type: 'dropdown',
			source: 'list',
			allowed: ['IncreaseModelNum', 'ReplaceItem']
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
			//TODO need to build squad file based on Game, Faction, MyUnit
			console.log("all games", $scope.games);
			let currGame = $scope.games.find( game => game.Name === $scope.game && game.Factions); // Factions check necessary because of how we create on new.
			let currGameIndex = $scope.games.findIndex( game => game.Name === $scope.game);
			console.log("currgame", currGame);
			
			if(!currGame) {
				console.log("should be here");
				//We are adding a new game. Need to set curGame after adding to it.
				let newGame = {Name: $scope.game, Factions: []}
				$scope.games[currGameIndex] = newGame; //Can't just push here, need to override the object. When we add new, this gets created.
				currGame = newGame;
			}
				
			let currFac = currGame.Factions.find( fac => fac.Name === $scope.faction && fac.Units); // See above re: create on new.
			console.log("curfac",currFac);
			if(!currFac) { 
				// We are adding a new faction.
				let newFac = {Name: $scope.faction, Units: []}
				currGame.Factions.push(newFac); //See above re pushing
				currFac = newFac;
			}
			
			currFac.Units.push($scope.myUnit);
			console.log("curfact with my unit", currFac);
			console.log("all games?", $scope.games);
	}
	
	// Right now the entire file gets sent over the network, then destroyed and recreated. 
	// This can be more efficent if we only send changes and build the file in PHP
	$scope.postResults = function () {
		  $scope.buildFile();
		
		  $http.post(
          'scripts/processFile.php',
          {squads: {games: $scope.games}, items: {gear: $scope.gear}, addons: {addons: $scope.addons}, abilities: {abilities: $scope.abilities}, powers: {powers: $scope.powers}}, function(data) {
				console.log(data);
			}
        )
        .then(function(response) {
          console.log('success', response);
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
	
	$http.get('../data/squads.json').then(function(res){
		$scope.games = res.data[Object.keys(res.data)[0]];
		$scope.selectedGame = $scope.games[0];
	});
	$http.get('../data/items.json').then(function(res){
		$scope.gear = res.data[Object.keys(res.data)[0]];
	});
	$http.get('../data/abilities.json').then(function(res){
		$scope.abilities = res.data[Object.keys(res.data)[0]];
	});
	$http.get('../data/addons.json').then(function(res){
		$scope.addons = res.data[Object.keys(res.data)[0]];
	});
	$http.get('../data/powers.json').then(function(res){
		$scope.powers = res.data[Object.keys(res.data)[0]];
	});
	
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
