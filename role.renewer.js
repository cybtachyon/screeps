var states = require('constants.states');

var roleRenewer = {
  /** @param {Room} room **/
  getRoomLimit: function (room) {
    return 0;
  },

  /** @param {Creep} creep **/
  run: function (creep) {

    if (creep.ticksToLive > 1000) {
      creep.memory.state = states.STATE_IDLE;
    }
    else {
      creep.memory.state = states.STATE_RENEWING;
      var spawn = creep.room.find(FIND_MY_SPAWNS)[0];
      if (spawn.renewCreep(creep) == ERR_NOT_IN_RANGE) {
        creep.moveTo(spawn);
      }
    }

  }
};

module.exports = roleRenewer;
