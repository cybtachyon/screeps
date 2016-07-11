var states = require('constants.states');
var energyManager = require('manager.energy');

var roleHauler = {
  /** @param {Room} room **/
  getRoomLimit: function (room) {
    if(this.getSource(room)) {
      return 1;
    }
    return 0;
  },

  getSource: function(room) {
    var droppedEnergy = room.find(FIND_DROPPED_ENERGY);
    if (droppedEnergy.length) {
      return droppedEnergy[0];
    }
    var source = energyManager.getPickupStorage(room);
    var spawn_system = _.difference(
        [source.structureType],
        [STRUCTURE_SPAWN, STRUCTURE_EXTENSION]
      ).length == 0;
    if (source && !spawn_system) {
      return source;
    }
    return null;
  },

  /** @param {Creep} creep **/
  startUnloading: function (creep) {
    var deliveryTarget = energyManager.getOpenStorage(creep.room);
    creep.memory.target = deliveryTarget.id;
    creep.memory.state = states.STATE_UNLOADING;
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
        if (target instanceof Resource) {
          transfer = creep.pickup(target);
        }
        else if (typeof target.transferEnergy === 'function') {
          transfer = target.transferEnergy(creep);
        }
        else if (typeof target.transfer === 'function') {
          transfer = target.transfer(creep, RESOURCE_ENERGY);
        }
        else {
          console.log('Error: Unable to transfer energy from a ' + target);
        }
        // Find out remaining energy.
        var remainingEnergy = 0;
        if ('energy' in target) {
          remainingEnergy = target.energy;
        } else if ('store' in target) {
          remainingEnergy = target.store[RESOURCE_ENERGY];
        }
        // Handle transfer progress.
        if (transfer == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
          return;
        }
        else if (creep.carry.energy == creep.carryCapacity) {
          this.startUnloading(creep);
          return;
        }
        else if (transfer != OK || remainingEnergy == 0) {
          creep.memory.state = states.STATE_IDLE;
          return;
        }
        return;
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
        return;
        break;
        
      default:
        creep.memory.target = null;
        var source = this.getSource(creep.room);
        if (source) {
          console.log('Hauler ' + creep.name + ' found source ' + source);
          creep.memory.target = source.id;
          creep.memory.state = states.STATE_LOADING;
        }
        else if (creep.carry.energy > 0.3 * creep.carryCapacity) {
          this.startUnloading(creep);
        }
        break;
    }
  }
};

module.exports = roleHauler;
