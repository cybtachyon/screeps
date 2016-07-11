var states = require('constants.states');
var energyManager = require('manager.energy');
var towerManager = require('manager.towers');

var roleRepairer = {
  /** @param {Room} room **/
  getRoomLimit: function (room) {
    var my_structures = room.find(FIND_MY_STRUCTURES);
    var towers = _.filter(my_structures, function (structure) {
      return structure.structureType == STRUCTURE_TOWER
    });
    var damaged = _.filter(my_structures, function (structure) {
      return structure.hits < structure.hitsMax * 0.9
    });
    if (towers.length < 1 && damaged.length) {
      return 1;
    }
    return 0;
  },

  /** @param {Creep} creep **/
  startRepairing: function (creep) {
    var damaged = creep.room.find(FIND_MY_STRUCTURES, {
      filter: (structure) => structure.hits < structure.hitsMax * 0.9
    });
    if (damaged.length) {
      creep.memory.target = damaged[0].id;
      creep.memory.state = states.STATE_REPAIRING;
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
        // Find out remaining energy.
        var remainingEnergy = 0;
        if (target.hasOwnProperty('energy')) {
          remainingEnergy = target.energy;
        } else if (target.hasOwnProperty('store')) {
          remainingEnergy = target.store[RESOURCE_ENERGY];
        }
        // Handle transfer progress.
        if (transfer == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
          return;
        }
        else if (creep.carry.energy == creep.carryCapacity) {
          this.startRepairing(creep);
          return;
        }
        else if (transfer != OK || remainingEnergy == 0) {
          creep.memory.state = states.STATE_IDLE;
          return;
        }
        break;

      case states.STATE_REPAIRING:
        if (!creep.memory.target) {
          creep.memory.state = states.STATE_IDLE;
          return;
        }
        var repair = creep.repair(target);
        if (repair == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
          return;
        }
        if (target.hits >= target.hitsMax) {
          creep.memory.state = states.STATE_IDLE;
          return;
        }
        if (creep.carry.energy < 1) {
          creep.memory.state = states.STATE_IDLE;
          return;
        }
        break;

      default:
        var damaged = creep.room.find(FIND_MY_STRUCTURES, {
          filter: (structure) => structure.hits < structure.hitsMax * 0.9
        });
        if (!damaged.length) {
          break;
        }
        if (creep.carry.energy > 0.3 * creep.carryCapacity) {
          this.startRepairing(creep);
          break;
        }
        var source = energyManager.requestEnergySource(creep);
        if (source) {
          console.log('Repairer ' + creep.name + ' found source ' + source.structureType);
          creep.memory.target = source.id;
          creep.memory.state = states.STATE_LOADING;
        }
        break;
    }
  }
};

module.exports = roleRepairer;
