var states = require('constants.states');
var energyManager = require('manager.energy');
var towerManager = require('manager.towers');

var roleTanker = {
  /** @param {Room} room **/
  getRoomLimit: function (room) {
    if (towerManager.getLowEnergyTowers().length) {
      return 1;
    }
    return 0;
  },

  /** @param {Creep} creep **/
  startUnloading: function (creep) {
    // @TODO Allow deliveries to things over than towers.
    var delivery_targets = towerManager.getLowEnergyTowers();
    if (delivery_targets.length) {
      creep.memory.target = delivery_targets[0].id;
      creep.memory.state = states.STATE_UNLOADING;
      return;
    }
    creep.memory.state = states.STATE_IDLE;
  },

  /** @param {Creep} creep **/
  run: function (creep) {
    var state = creep.memory.state;
    var target = Game.getObjectById(creep.memory.target);
    var transfer = '';

    switch (state) {
      case states.STATE_LOADING:
        if (!target) {
          creep.memory.state = states.STATE_IDLE;
          return;
        }
        // Attempt transfer.
        transfer = energyManager.transferEnergy(target, creep);
        var remaining_energy = energyManager.getEnergy(target);
        // Handle transfer progress.
        if (transfer == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
          return;
        }
        else if (creep.carry.energy == creep.carryCapacity) {
          this.startUnloading(creep);
          return;
        }
        else if (transfer != OK || remaining_energy == 0) {
          creep.memory.state = states.STATE_IDLE;
          return;
        }
        break;

      case states.STATE_UNLOADING:
        if (!creep.memory.target) {
          creep.memory.state = states.STATE_IDLE;
          return;
        }
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
          return;
        }
        if (creep.carry.energy < 1) {
          creep.memory.state = states.STATE_IDLE;
          return;
        }
        break;

      default:
        var deliveryTargets = towerManager.getLowEnergyTowers();
        if (deliveryTargets.length == 0) {
          break;
        }
        // Handle lazy workers with resources idling.
        // @TODO: Address this smarter.
        if (creep.carry.energy > 0.3 * creep.carryCapacity) {
          this.startUnloading(creep);
          break;
        }
        var source = energyManager.requestEnergySource(creep);
        if (source) {
          creep.memory.target = source.id;
          creep.memory.state = states.STATE_LOADING;
        }
        break;
    }
  }
};

module.exports = roleTanker;
