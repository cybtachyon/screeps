var energyManager = {
  getStoragePriorities: function() {
    return [
      STRUCTURE_SPAWN,
      STRUCTURE_EXTENSION,
      STRUCTURE_STORAGE,
      STRUCTURE_CONTAINER
    ];
  },

  /** @param {Room} room **/
  getOpenStorage: function(room) {
    var storagePriorities = this.getStoragePriorities();
    var myStructures = room.find(FIND_MY_STRUCTURES);
    for (var storageDelta = 0; storageDelta < storagePriorities.length; storageDelta++) {
      var storageStructures = _.filter(myStructures, (structure) => structure.structureType == storagePriorities[storageDelta]);
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
    var myStructures = room.find(FIND_MY_STRUCTURES);
    for (var storageDelta = 0; storageDelta < storagePriorities.length; storageDelta++) {
      var storageStructures = _.filter(myStructures, (structure) => structure.structureType == storagePriorities[storageDelta]);
      for (var structureDelta = 0; structureDelta < storageStructures.length; structureDelta++) {
        var structure = storageStructures[structureDelta];
        if (structure.energy > 0) {
          return structure;
        }
      }
    }
  }
};

module.exports = energyManager;
