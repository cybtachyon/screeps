var states = require('constants.states');

var roleUpgrader = {
  /** @param {Room} room **/
  getRoomLimit: function (room) {
    if (room.energyAvailable < 50) {
      return 0;
    }
    else {
      // @TODO: Something less stupid about idlers.
      var idleCreepCount = Object.keys(Game.spawns.Spawn1.memory.idleCreeps).length;
      var roleCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
      var numUpgraders = roleCreeps.length + 1;
      return Math.round((room.energyAvailable + 1) / (50 * numUpgraders)) + idleCreepCount;
    }
  },

  /** @param {Creep} creep **/
  run: function (creep) {

    if (creep.memory.state == states.STATE_UPGRADING && creep.carry.energy < 1) {
      creep.memory.state = states.STATE_IDLE;
    }
    if (creep.memory.state != states.STATE_UPGRADING && creep.carry.energy == creep.carryCapacity) {
      creep.memory.state = states.STATE_UPGRADING;
    }

    if (creep.memory.state == states.STATE_UPGRADING) {
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
        creep.memory.state = states.STATE_TRANSPORTING;
      }
      else {
        creep.memory.state = states.STATE_IDLE;
      }
    }
  }
};

module.exports = roleUpgrader;
