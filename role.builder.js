var states = require('constants.states');

var roleBuilder = {
  /** @param {Room} room **/
  getRoomLimit: function (room) {
    if (room.energyAvailable < 50) {
      return 0;
    }
    else {
      var sites_count = room.find(FIND_CONSTRUCTION_SITES).length;
      return Math.floor(Math.sqrt((room.energyAvailable / CARRY_CAPACITY) * sites_count));
    }
  },

  /** @param {Creep} creep **/
  run: function (creep) {
    var state = creep.memory.state;
    switch (state) {
      case states.STATE_BUILDING:
        var target = Game.getObjectById(creep.memory.target);
        if (!(target instanceof ConstructionSite)) {
          creep.memory.state = states.STATE_IDLE;
          break;
        }
        if (creep.carry.energy < 1) {
          var build_cost = CONSTRUCTION_COST[target.structureType];
          var build_percentage = target.progress / target.progressTotal;
          var remaining_build_energy = build_cost * build_percentage;
          var energy_amount = Math.min(remaining_build_energy, creep.carryCapacity);
          var transfer = creep.receiveEnergy(energy_amount);
          if (!transfer) {
            creep.memory.state = states.STATE_IDLE;
            break;
          }
        }
        else {
          var build_status = creep.build(target);
          if (build_status == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
          }
          else if (build_status != OK) {
            console.log('Build error: ' + build_status);
            if (creep.dismantle(target) != OK) {
              creep.memory.state = states.STATE_IDLE;
            }
            break;
          }
        }
        break;

      default:
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length) {
          creep.memory.target = targets[0].id;
          creep.memory.state = states.STATE_BUILDING;
        }
        break;
    }
  }
};

module.exports = roleBuilder;
