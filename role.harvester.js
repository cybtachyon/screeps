var states = require('constants.states');
var energyManager = require('manager.energy');

var roleHarvester = {
  /** @param {Room} room **/
  getRoomLimit: function (room) {
    return 3;
  },

  /** @param {Creep} creep **/
  run: function (creep) {
    var state = creep.memory.state;
    // Set default state.
    if (!state) {
      state = states.STATE_HARVESTING;
    }
    else if (creep.carry.energy < 1) {
      state = states.STATE_HARVESTING;
    }
    // Handle harvesting.
    if (state == states.STATE_HARVESTING && creep.carry.energy < creep.carryCapacity) {
      var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
      if (source) {
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source);
        }
      }
    }
    // Handle transporting.
    else {
      state = states.STATE_TRANSPORTING;
      var target = energyManager.getOpenStorage(creep.room);
      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
        if (creep.carry.energy < 1) {
          creep.memory.state = states.STATE_HARVESTING;
        }
      }
      else {
        state = states.STATE_IDLE;
      }
    }
    creep.memory.state = state;
  }
};

module.exports = roleHarvester;
