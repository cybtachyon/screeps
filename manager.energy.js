var energyManager = {
  getStoragePriorities: function() {
    return [
      STRUCTURE_SPAWN,
      STRUCTURE_EXTENSION,
      STRUCTURE_STORAGE,
      STRUCTURE_CONTAINER
    ];
  },

  requestEnergy: function(creep, amount) {
    // @TODO: Need to have a request queue with weight and type.
    // Things like renewals and spawns come first before builds etc.
    return creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: ''
    });
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
