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
		this.newItemDiv = document.getElementById("newEntry");
		var aform = (angular.element(document.getElementById('newEntry')));
		
		this.processItemForAdd = function(item){
			if(item === "new") {
				this.addingNew = true;
				this.myModel = new this.newModel();
				Object.keys(this.myModel).forEach( (key) => {
					this.newItemDiv.innerHTML +=
					key + ": <input ng-model=\"$ctrl.myModel." + key + "\"></input> <br>";
				});
				$compile(aform)($scope);
			} else {
				item = JSON.parse(item);
				this.addItem(item);
			}
		}
		
		this.addItem = function (item) {
			console.log("item", item);
			console.log("add item type", typeof(item));
			if(this.type === 'array') {
				this.output.push(parseInt(item.id));
			}
		}
		
		this.addNewItem = function () {
			console.log("mymodel", this.myModel);
			this.addingNew = false;
			this.newItemDiv.innerHTML = "";
			this.newJson += ",\r\n" + angular.toJson(this.myModel, true);
			console.log("add new type", typeof(this.myModel));
			this.addItem(this.myModel);
		}
		
	}]
});

app.controller('builderCtrl', function($scope, $http){
	$scope.gearJson = "";
	$scope.game = "Warhammer 40k 8th Edition";
	$scope.faction = "Space Marines";
	
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
	$scope.unitModel = unitModel;
	$scope.myUnit = new unitModel("Test", 1, 1, [], [], [], []);
	
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
