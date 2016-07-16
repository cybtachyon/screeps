var states = require('constants.states');
var energyManager = require('manager.energy');

var roleHarvester = {
  /** @param {Room} room **/
  getRoomLimit: function (room) {
    var sources = room.find(FIND_SOURCES_ACTIVE);
    if (sources.length) {
      return sources[sources.length - 1].getOpenTerrainCount();
    }
    return 0;
  },

  /**
   * Starts the harvesting process.
   *
   * @param creep
   */
  startHarvesting: function (creep) {
    var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
    if (source) {
      creep.memory.target = source.id;
      creep.memory.state = states.STATE_HARVESTING;
      return;
    }
    creep.memory.state = states.STATE_IDLE;
  },

  /**
   * Starts the drop off process.
   *
   * @param creep
   */
  startTransporting: function (creep) {
    var target = energyManager.getOpenStorage(creep.room);
    if (target) {
      creep.memory.target = target.id;
      creep.memory.state = states.STATE_TRANSPORTING;
      return;
    }
    creep.memory.state = states.STATE_IDLE;
  },

  /**
   * Runs the role for the given creep.
   *
   * @param {Creep} creep
   */
  run: function (creep) {
    var state = creep.memory.state;
    var target = Game.getObjectById(creep.memory.target);
    if (!target) {
      creep.memory.state = states.STATE_IDLE;
    }

    switch (state) {
      case states.STATE_HARVESTING:
        if (creep.carry.energy == creep.carryCapacity) {
          this.startTransporting(creep);
          break;
        }
        if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
        break;

      case states.STATE_TRANSPORTING:
        if (creep.carry.energy < 1) {
          this.startHarvesting(creep);
          break;
        }
        if (energyManager.getEnergy(target) == energyManager.getEnergyCapacity(target)) {
          console.log(Game.time + ' Harvester transport target ' + target + ' is full');
          this.startTransporting(creep);
          break;
        }
        var transfer = creep.transfer(target, RESOURCE_ENERGY);
        if (transfer == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
          break;
        }
        else if (transfer != OK) {
          console.log(Game.time + ' Error ' + transfer  + ' transporting energy to ' + target);
          creep.memory.state = states.STATE_IDLE;
        }
        break;

      default:
        if (creep.carry.energy > creep.carryCapacity * 0.6) {
          this.startTransporting(creep);
          break;
        }
        this.startHarvesting(creep);
        break;
    }
  }
};

module.exports = roleHarvester;
