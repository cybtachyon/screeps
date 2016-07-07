var energyManager = require('manager.energy');

var roleHarvester = {

  /** @param {Creep} creep **/
  run: function (creep) {
    var state = creep.memory.state;
    if (!state) {
      state = STATE_HARVESTING;
    }
    else if (creep.carry.energy == 0) {
      state = STATE_HARVESTING;
    }
    else if (state == STATE_HARVESTING && creep.carry.energy < creep.carryCapacity) {
      var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
      if(source) {
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source);
        }
      }
    }
    else {
      state = STATE_TRANSPORTING;
      var target = energyManager.getOpenStorage(creep.room);
      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
    }
    creep.memory.state = state;
  }
};

module.exports = roleHarvester;
