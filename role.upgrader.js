var roleUpgrader = {

  /** @param {Creep} creep **/
  run: function (creep) {

    if (creep.memory.upgrading && creep.carry.energy == 0) {
      creep.memory.upgrading = false;
    }
    if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
      creep.memory.upgrading = true;
    }

    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
      }
    }
    else {
      var sources = creep.room.find(
        FIND_MY_STRUCTURES,
        {
          filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
              structure.structureType == STRUCTURE_SPAWN)
              && structure.energy > creep.carryCapacity;
          }
        }
      );
      if (sources) {
        var transfer = null;
        if (sources[0].structureType == STRUCTURE_SPAWN) {
          transfer = sources[0].transferEnergy(creep, creep.carryCapacity - creep.carry.energy);
        }
        else {
          transfer = sources[0].transfer(creep, 'energy', creep.carryCapacity - creep.carry.energy)
        }
        if (transfer == ERR_NOT_IN_RANGE) {
          creep.moveTo(sources[0]);
        }
      }
    }
  }
};

module.exports = roleUpgrader;
