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
		newJson: '='
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
			if(item === "new") {
				this.addingNew = true;
				this.myModel = new this.newModel();
				Object.keys(this.myModel).forEach( (key) => {
					this.getNewItemDiv().innerHTML +=
					key + ": <input ng-model=\"$ctrl.myModel." + key + "\"></input> <br>";
				});
				this.myModel.id = this.existingData.length + 1;
				$compile(this.getAform())($scope);
			} else {
				item = JSON.parse(item);
				this.addItem(item);
			}
		}
		
		this.addItem = function (item) {
			if(this.type === 'array') {
				this.output.push(parseInt(item.id));
			} else if(this.type === 'string') {
				this.output = item.Name;
			}
		}
		
		this.selectChanged = function(item) {
			if(item !== 'new' && this.type === 'string') {
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
			this.Type = Type;
			this.Remove = Remove;
			this.Add = Add;
			this.Level = Level;
			this.Amount = Amount;
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
	
	    //you need this function to convert the dataURI
    function dataURItoBlob(dataURI) {
      var binary = atob(dataURI.split(',')[1]);
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      var array = [];
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {
        type: mimeString
      });
	}
	
	$scope.postResults = function () {
		  $http.post(
          'scripts/processFile.php',
          {unit: $scope.myUnit}, function(data) {
				console.log(data);
			}
        )
        .then(function(response) {
          console.log('success', response);
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
