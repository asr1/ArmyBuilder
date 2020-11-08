let adjustmentService = angular.module('AddonAdjustmentService', []).service('adjustmentService', function($http) {

	/* Gets all addon adjustmensts from database
	 */
	this.getAllAdjustmentsAsync = async function() {
		const response = await $http.post('src/php/getAllAddonAdjustments.php');
		return response.data;
	}
});
