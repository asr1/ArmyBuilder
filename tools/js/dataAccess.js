let dataAccess = angular.module('armyDataAccessController', []).service('dataAccess', function($http) {

	/* Gets all games from database
	 */
	this.getGamesAsync = async function getGamesAsync() {
		const response = await $http.post('../src/php/getGames.php');
		return response.data;
	}

	/* Gets all factions for a given gameid from database
	 */
	this.getFactionsForGame = async function(gameId) {
		if(!gameId) { return };
		const response = await $http.post('../src/php/getFactionsForGame.php?gameId='+gameId);
		return response.data;
	}

	/* Gets all abilities from database
	 */
	this.getAbilitiesAsync = async function() {
		const response = await $http.post('php/read/getAllAbilities.php');
		return response.data;
	}

	/* Gets all gear from database
	 */
	this.getGearAsync = async function() {
		const response = await $http.post('../src/php/getAllGear.php');
		return response.data;
	}

	/* Gets all gear ranges from database
	 */
	this.getGearRangesAsync = async function getGearRangesAsync() {
		const response = await $http.post('php/read/getGearRanges.php');
		return response.data;
	}

	/* Gets all gear abilities from database
	 */
	this.getGearAbilitiesAsync = async function() {
		const response = await $http.post('php/read/getGearAbilities.php');
		return response.data;
	}

	/* Gets all addonTypes from database
	 */
	this.getAddonTypesAsync = async function() {
		const response = await $http.post('php/read/getAddonTypes.php');
		return response.data;
	}


	/* Gets all addons from database
	 */
	this.getAddonsAsync = async function() {
		const response = await $http.post('php/read/getAllAddons.php');
		return response.data;
	}

	/* Gets all powers from database
	 */
	this.getPowersAsync = async function() {
		const response = await $http.post('php/read/getAllPowers.php');
		return response.data;
	}

	/* Gets all models from database
	 */
	this.getModelsAsync = async function() {
		const response = await $http.post('php/read/getAllModels.php');
		return response.data;
	}

	/* Gets all item sets from database
	 */
	this.getItemSetsAsync = async function() {
		const response = await $http.post('php/read/getAllItemSets.php');
		const sets = response.data;
		sets.forEach( async (set) => {
			set.items = await this.getItemsInSetAsync(set.id);
		});
		return sets;
	}

	/* Gets all powers in a set from database
	 */
	this.getPowersInSetAsync = async function(setId) {
		const response = await $http.post('php/read/getAllPowersInSet.php?setId='+setId);
		return response.data;
	}

	/* Gets all items in a set from database
	 */
	this.getItemsInSetAsync = async function(setId) {
		const response = await $http.post('php/read/getAllItemsInSet.php?setId='+setId);
		return response.data;
	}

	/* Gets all power sets from database
	 */
	this.getPowerSetsAsync = async function() {
		const response = await $http.post('php/read/getAllPowerSets.php');
		const sets = response.data;
		sets.forEach( async (set) => {
			set.powers = await this.getPowersInSetAsync(set.setId);
		});
		return sets;
	}
});
