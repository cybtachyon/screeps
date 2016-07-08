var states = require('constants.states');
var energyManager = require('manager.energy');

var roleHauler = {
  /** @param {Room} room **/
  getRoomLimit: function (room) {
    return 1;
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
    var room = creep.room;
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
        else if (target.hasOwnProperty('transferEnergy')) {
          transfer = target.transferEnergy(creep);
        }
        else if (target.hasOwnProperty('transfer')) {
          transfer = target.transfer(creep, RESOURCE_ENERGY);
        }
        else {
          console.log('Error: Unable to transfer energy from a ' + target.constructor.name);
        }
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
          this.startUnloading(creep);
          return;
        }
        else if (transfer != OK || remainingEnergy == 0) {
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
        var droppedEnergy = creep.room.find(FIND_DROPPED_ENERGY);
        if (droppedEnergy.length) {
          console.log('Hauler' + creep.name + ' found energy ' + droppedEnergy[0].id);
          creep.memory.target = droppedEnergy[0].id;
          creep.memory.state = states.STATE_LOADING;
          return;
        }
        var source = energyManager.getPickupStorage(room);
        if (source && source.structureType != STRUCTURE_SPAWN) {
          console.log('Hauler ' + creep.name + ' found source ' + source.structureType);
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
