var states = require('constants.states');
var energy_manager = require('manager.energy');

var roleUpgrader = {
  /**
   * Returns the room creep limit for the role.
   *
   * @param {Room} room
   * @returns {number}
   */
  getRoomLimit: function (room) {
    if (room.energyAvailable < CARRY_CAPACITY) {
      return 0;
    }
    else {
      var roleCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
      var num_upgraders = roleCreeps.length;
      return Math.floor((room.energyAvailable) / ((SPAWN_ENERGY_CAPACITY + CARRY_CAPACITY) * num_upgraders ^ 2 + 1)) + 1;
    }
  },

  startUpgrading: function (creep) {
    var controller = creep.room.controller;
    creep.memory.target = controller.id;
    creep.memory.state = states.STATE_UPGRADING;
    this.run(creep);
  },

  startLoading: function (creep) {
    var source = energy_manager.requestEnergySource(creep, creep.capacity);
    creep.memory.target = source.id;
    creep.memory.state = states.STATE_LOADING;
    this.run(creep);
  },

  /**
   * Runs the role for the provided creep.
   *
   * @param {Creep} creep
   */
  run: function (creep) {
    var target = Game.getObjectById(creep.memory.target);
    if (!target) {
      creep.memory.state = states.STATE_IDLE;
    }

    switch (creep.memory.state) {
      case states.STATE_UPGRADING:
        if (creep.carry.energy < 1) {
          this.startLoading(creep);
          break;
        }
        var upgrade = creep.upgradeController(target);
        if (upgrade == ERR_NOT_IN_RANGE) {
          var move = creep.moveTo(target);
          if (move != OK) {
            creep.memory.state = states.STATE_IDLE;
          }
        }
        else if (upgrade != OK) {
          creep.memory.state = states.STATE_IDLE;
        }
        break;

      case states.STATE_LOADING:
        var load = creep.receiveEnergy(creep.carryCapacity - creep.carry[RESOURCE_ENERGY]);
        if (load != OK) {
          creep.memory.state = states.STATE_IDLE;
        }
        if (creep.carry.energy == creep.carryCapacity) {
          this.startUpgrading(creep);
        }
        break;

      default:
        if (creep.carry.energy < creep.carryCapacity * 0.6) {
          this.startLoading(creep);
        }
        else {
          this.startUpgrading(creep);
        }
        break;
    }
  }
};

module.exports = roleUpgrader;
