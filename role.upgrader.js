var states = require('constants.states');

var roleUpgrader = {
  /** @param {Room} room **/
  getRoomLimit: function (room) {
    if (room.energyAvailable < CARRY_CAPACITY) {
      return 0;
    }
    else {
      // @TODO: Something less stupid about idlers.
      var idleCreepCount = Object.keys(Game.spawns.Spawn1.memory.idleCreeps).length;
      var roleCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
      var numUpgraders = roleCreeps.length;
      return Math.floor((room.energyAvailable) / (CARRY_CAPACITY * numUpgraders + 1));
    }
  },

  /** @param {Creep} creep **/
  run: function (creep) {
    // @TODO: Refactor to use switch case for cleaner code.

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
      var load = creep.receiveEnergy(creep.carryCapacity - creep.carry[RESOURCE_ENERGY]);
      if (load) {
        creep.memory.state = states.STATE_TRANSPORTING;
      }
      else {
        creep.memory.state = states.STATE_IDLE;
      }
    }
  }
};

module.exports = roleUpgrader;
