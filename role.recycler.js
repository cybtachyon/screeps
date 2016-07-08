var states = require('constants.states');

var roleRecycler = {
  /** @param {Room} room **/
  getRoomLimit: function (room) {
    return 0;
  },

  /** @param {Creep} creep **/
  run: function (creep) {
    if (creep.memory.state != states.STATE_RECYCLING) {
      var spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
      creep.memory.target = spawn.id;
      creep.memory.state = states.STATE_RECYCLING;
    }
    var targetSpawn = Game.getObjectById(creep.memory.target);
    if (targetSpawn.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetSpawn);
    }
  }

};

module.exports = roleRecycler;
