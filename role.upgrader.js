var states = require('constants.states');

var roleUpgrader = {
  /**
   * Returns the room creep limit for the role.
   *
   * @param {Room} room
   * @returns {number}
   */
  getRoomLimit: function (room) {
    if (room.energyAvailable < CARRY_CAPACITY) {
      return 0;
    }
    else {
      var roleCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
      var num_upgraders = roleCreeps.length;
      return Math.floor((room.energyAvailable) / (CARRY_CAPACITY * num_upgraders + 1)) + 1;
    }
  },

  /**
   * Runs the role for the provided creep.
   *
   * @param {Creep} creep
   */
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
