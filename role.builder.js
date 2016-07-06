var roleBuilder = {

  /** @param {Creep} creep **/
  run: function (creep) {

    if (creep.memory.building && creep.carry.energy == 0) {
      creep.memory.building = false;
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
    }

    if (creep.memory.building) {
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0]);
        }
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
      if (sources.length > 0) {
        var transfer = null;
        if (sources[0].structureType == STRUCTURE_SPAWN ||
          sources[0].structureType == STRUCTURE_EXTENSION) {
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

module.exports = roleBuilder;
