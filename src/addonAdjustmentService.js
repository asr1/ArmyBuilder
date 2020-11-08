let adjustmentService = angular.module('AddonAdjustmentService', []).service('adjustmentService', function($http) {
	this.activeAdjustments = {};
	const TriggerTypes = { NumberOfModelsInUnit: 1 };


	/* Gets all addon adjustments from database
	 */
	this.getAllAdjustmentsAsync = async function() {
		const response = await $http.post('src/php/getAllAddonAdjustments.php');
		this.allAdjustments = response.data;
		return this.allAdjustments;
	}
	
	this.processAddon = function (unit, addon, models) {
		// Find all add-ons for this unit.
		let unitAddonAdjustments = this.allAdjustments.filter( (adjustment) => {
			return adjustment.unit_id === unit.id;
		});
		
		console.log("");
		console.log("before");
		console.log("Unit", unit);
		console.log("addon", addon);
		console.log("all adjusments", this.allAdjustments);
		console.log("adjustments", unitAddonAdjustments);
		
		unitAddonAdjustments.forEach( (adjustment) => {
			if(this.activeAdjustments[unit.name] === undefined) { this.activeAdjustments[unit.name] = []; }
			
			// Is the addon active?
			let isActive = !!this.activeAdjustments[unit.name][adjustment.addon_id];
			let shouldBeActive = isActive;
			
			// Then, should it be active based on the criteria?
			switch (adjustment.trigger_type) { // Right now we only have one case. Each case needs to have the "should be active" and the "update" steps. If we get a lot more cases, it may make sense to have two different switch statements back to back.
				case TriggerTypes.NumberOfModelsInUnit:
					shouldBeActive = unit.numberOfModels === adjustment.trigger_amount;
					// If should be is different than is, make the change to the addon.
					if(isActive != shouldBeActive) {
						const delta =  adjustment.effect_amount * shouldBeActive ? 1 : -1;
						updateAddonsForUnitsModels(models, adjustment.addon_id, adjustment.effect_column, delta);
					}
					
				break;
			}
			
			//Update the cache
			this.activeAdjustments[unit.name][adjustment.addon_id] = shouldBeActive;11
		});

	};
	
	//"Private" functions
	
	/* updateAddonsForUnitsModels
	 * Applies an adjustment to every model that exists for a given
	 * Unit. Takes in the unit with all of its models, the addonId
	 * To Process for each model, the property name of the addon 
	 * to modify, and the amount to modify it by (delta)
	*/
	function updateAddonsForUnitsModels(models, addonId, propName, delta) {
		let newNumber = undefined;
		models.forEach( (model) => {
			model.addons.forEach( (addon) => {
				if(addon.id === addonId) {
					if(newNumber === undefined) {
						newNumber = addon[propName] + delta;
					}
					addon[propName] = newNumber;
				}
			});
		});
	}
});
