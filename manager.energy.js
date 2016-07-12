var energyManager = {
  run: function() {
    if (!Memory.energy) {
      Memory.energy = {
        storage: 0,
        storageLastTick: 0,
        capacity: 0,
        reserved: 0,
        avgPerTick: 0,
        ticks: []
      };
    }
    Memory.energy.storageLastTick = Memory.energy.storage;
    Memory.energy.storage = 0;
    Memory.energy.capacity = 0;
    for (var room_name in Game.rooms) {
      if (!Game.rooms.hasOwnProperty(room_name)) {
        continue;
      }
      Memory.energy.storage += Game.rooms[room_name].energyAvailable;
      Memory.energy.capacity += Game.rooms[room_name].energyCapacityAvailable;
    }
    Memory.energy.ticks.push(Memory.energy.storage - Memory.energy.storageLastTick);
    if (Memory.energy.ticks.length > 60) {
      Memory.energy.ticks.shift();
    }
    Memory.energy.avgPerTick = Memory.energy.ticks.reduce(
      function(previous_value, current_value, index, map_array) {
        if (index + 1 == map_array.length) {
          return (previous_value + current_value) / map_array.length;
        }
        return previous_value + current_value;
      }
    );

  },

  /**
   * Returns the structure priorities for storing energy.
   *
   * @returns {*[]}
   */
  getStoragePriorities: function() {
    return [
      STRUCTURE_SPAWN,
      STRUCTURE_EXTENSION,
      STRUCTURE_STORAGE,
      STRUCTURE_CONTAINER
    ];
  },

  /**
   * Requests a structure to provide the required amount of energy.
   *
   * @param creep
   * @param amount
   * @returns {OwnedStructure}
   */
  requestEnergySource: function(creep, amount) {
    // @TODO Make transferring a request so it can be denied if saving.
    // @TODO: Need to have a request queue with weight and type.
    // Things like renewals and spawns come first before builds etc.
    return this.getPickupStorage(creep.room);
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
    if (typeof target.energy === 'number') {
      return target.energy;
    }
    else if (typeof target.store === 'object') {
      return target.store[RESOURCE_ENERGY];
    }
    else if (typeof target.carry === 'object') {
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
    if (typeof target.energyCapacity === 'number') {
      return target.energyCapacity;
    }
    else if (typeof target.storeCapacity === 'number') {
      return target.storeCapacity;
    }
    else if (typeof target.carryCapacity === 'number') {
      return target.carryCapacity;
    }
    return 0;
  },

  /**
   * Returns a prioritized structure that has room for energy.
   *
   * @param {Room} room
   * @returns {*|T}
   */
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

  /**
   * Returns a prioritized structure that has energy to give.
   *
   * @param {Room} room
   * @returns {*|T}
   */
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
