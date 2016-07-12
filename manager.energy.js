var energyManager = {
  getStoragePriorities: function() {
    return [
      STRUCTURE_SPAWN,
      STRUCTURE_EXTENSION,
      STRUCTURE_STORAGE,
      STRUCTURE_CONTAINER
    ];
  },

  requestEnergySource: function(creep, amount) {
    // @TODO Make transferring a request so it can be denied if saving.
    // @TODO: Need to have a request queue with weight and type.
    // Things like renewals and spawns come first before builds etc.
    return creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
      filter: (structure) => structure.structureType == STRUCTURE_SPAWN
    });
  },

  transferEnergy: function(source, destination, amount) {
    if (typeof source.transferEnergy === 'function') {
      return source.transferEnergy(destination);
    }
    else if (typeof source.transfer === 'function') {
      return source.transfer(destination, RESOURCE_ENERGY);
    }
    else {
      console.log('Error: Unable to transfer energy from ' + source + ' to ' + destination);
      return ERR_INVALID_TARGET;
    }
  },

  /**
   * Returns the energy count inside the target.
   *
   * @param {Object} target
   *   The target to get the energy amount from.
   *
   * @return int
   *   Energy amount.
   */
  getEnergy: function(target) {
    if (target.hasOwnProperty('energy')) {
      return target.energy;
    }
    else if (target.hasOwnProperty('store')) {
      return target.store[RESOURCE_ENERGY];
    }
    else if (target.hasOwnProperty('carry')) {
      return target.carry[RESOURCE_ENERGY];
    }
    return 0;
  },

  /**
   * Returns the energy count inside the target.
   *
   * @param {Object} target
   *   The target to get the energy amount from.
   *
   * @return int
   *   Energy amount.
   */
  getEnergyCapacity: function(target) {
    if (target.hasOwnProperty('energyCapacity')) {
      return target.energyCapacity;
    }
    else if (target.hasOwnProperty('storeCapacity')) {
      return target.storeCapacity;
    }
    else if (target.hasOwnProperty('carryCapacity')) {
      return target.carryCapacity;
    }
    return 0;
  },
  
  /** @param {Room} room **/
  getOpenStorage: function(room) {
    var storagePriorities = this.getStoragePriorities();
    var structures = room.find(FIND_STRUCTURES);
    for (var storageDelta = 0; storageDelta < storagePriorities.length; storageDelta++) {
      var storageStructures = _.filter(structures,
        (structure) => structure.structureType == storagePriorities[storageDelta]
      );
      for (var structureDelta = 0; structureDelta < storageStructures.length; structureDelta++) {
        var structure = storageStructures[structureDelta];
        if (structure.energy < structure.energyCapacity) {
          return structure;
        }
      }
    }
  },

  /** @param {Room} room **/
  getPickupStorage: function(room) {
    var storagePriorities = this.getStoragePriorities().reverse();
    var structures = room.find(FIND_STRUCTURES);
    for (var storageDelta = 0; storageDelta < storagePriorities.length; storageDelta++) {
      var storageStructures = _.filter(structures,
        (structure) => structure.structureType == storagePriorities[storageDelta]
      );
      for (var structureDelta = 0; structureDelta < storageStructures.length; structureDelta++) {
        var structure = storageStructures[structureDelta];
        var energy = 0;
        if (structure.store) {
          energy = structure.store[RESOURCE_ENERGY];
        }
        else {
          energy = structure.energy;
        }
        if (energy > 0) {
          return structure;
        }
      }
    }
  }
};

module.exports = energyManager;
