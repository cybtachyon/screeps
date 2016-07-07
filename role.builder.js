var states = require('constants.states');

var roleBuilder = {
  /** @param {Room} room **/
  getRoomLimit: function (room) {
    if (room.energyAvailable < 50) {
      return 0;
    }
    else {
      var sitesCount = room.find(FIND_CONSTRUCTION_SITES).length;
      return Math.round((room.energyAvailable / 50) * sitesCount);
    }
  },

  /** @param {Creep} creep **/
  run: function (creep) {

    if (creep.memory.state == states.STATE_BUILDING && creep.carry.energy < 1) {
      creep.memory.state = states.STATE_IDLE;
    }
    if (creep.memory.state != states.STATE_BUILDING && creep.carry.energy == creep.carryCapacity) {
      creep.memory.state = states.STATE_BUILDING;
    }

    if (creep.memory.state == states.STATE_BUILDING) {
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0]);
        }
        creep.memory.state = states.STATE_BUILDING;
      }
      else {
        creep.memory.state = states.STATE_IDLE;
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
      // @TODO Make transferring a request so it can be denied if saving.
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
      else {
        creep.memory.state = states.STATE_IDLE;
      }
    }
  }
};

module.exports = roleBuilder;
