var states = require('constants.states');

var roleBuilder = require('role.builder');
var roleHarvester = require('role.harvester');
var roleHauler = require('role.hauler');
var roleRecycler = require('role.recycler');
var roleRenewer = require('role.renewer');
var roleRepairer = require('role.repairer');
var roleTanker = require('role.tanker');
var roleUpgrader = require('role.upgrader');

// @TODO: For now these are in role of priority.
// Need to do some sorting or something to handle this.
var roles = [
  {
    name: 'harvester',
    class: roleHarvester,
    bodyParts: [WORK, CARRY, MOVE]
  },
  {
    name: 'upgrader',
    class: roleUpgrader,
    bodyParts: [WORK, CARRY, MOVE]
  },
  {
    name: 'builder',
    class: roleBuilder,
    bodyParts: [WORK, CARRY, MOVE]
  },
  {
    name: 'hauler',
    class: roleHauler,
    bodyParts: [WORK, CARRY, MOVE]
  },
  {
    name: 'tanker',
    class: roleTanker,
    bodyParts: [WORK, CARRY, MOVE]
  },
  {
    name: 'repairer',
    class: roleRepairer,
    bodyParts: [WORK, CARRY, MOVE]
  },
  {
    name: 'renewer',
    class: roleRenewer,
    bodyParts: []
  },
  {
    name: 'recycler',
    class: roleRecycler,
    bodyParts: []
  }
];

var creepsManager = {

  /** @param {Array.<Creep>} creeps **/
  run: function (creeps) {
    var room = Game.spawns.Spawn1.room;
    if (!Game.spawns.Spawn1.memory.idleCreeps) {
      Game.spawns.Spawn1.memory.idleCreeps = {};
    }

    for (var roleDelta = 0; roleDelta < roles.length; roleDelta++) {
      var role = roles[roleDelta];
      // Ensure enough creeps are spawned.
      var roleCreeps = _.filter(creeps, (creep) => creep.memory.role == role.name);
      // Special case to pause managing if no harvesters are present.
      // This mostly handles new rooms & spawns.
      // @TODO Revisit for rooms with no harvesting nodes.
      if (role.name == 'harvester' && roleCreeps.length < 1) {
        console.log('Emergency: no harvesters available!');
        Memory.emergency = true;
        this.makeCreepRole(role);
      }
      else {
        Memory.emergency = false;
      }
      // Create new creeps if roles are not filled.
      if (!Memory.emergency && roleCreeps.length < role.class.getRoomLimit(room)) {
        this.makeCreepRole(role);
      }

      // Run the roles for each creep.
      for (var creepDelta = 0; creepDelta < roleCreeps.length; creepDelta++) {
        var creep = roleCreeps[creepDelta];
        if (creep.ticksToLive < 50 && creep.memory.role != 'renewer') {
          creep.memory.role = 'renewer';
          console.log('Creep ' + creep.name + ' needs to be renewed.');
          continue;
        }
        role.class.run(creep);
        if (creep.memory.state == states.STATE_IDLE) {
          if (!creep.memory.idleTime) {
            creep.memory.idleTime = 0;
          }
          creep.memory.idleTime++;
          if (creep.memory.idleTime >= 15) {
            Game.spawns.Spawn1.memory.idleCreeps[creep.name] = 0;
            creep.memory.role = 'builder';
            if (creep.memory.idleTime > 300) {
              creep.memory.role = 'recycler';
            }
          }
        }
        else {
          creep.memory.idleTime = 0;
          delete Game.spawns.Spawn1.memory.idleCreeps[creep.name];
        }
      }
    }
  },

  /** @param {Object} role **/
  createCreep: function(role) {
    if (!Game.spawns.Spawn1.spawning && Game.spawns.Spawn1.canCreateCreep(role.bodyParts) == OK) {
      console.log('Creating new ' + role.name);
      return Game.spawns.Spawn1.createCreep(
        role.bodyParts,
        undefined,
        {role: role.name, state: states.STATE_IDLE}
      );
    }
    else {
      return false;
    }
  },

  /** @param {Object} role **/
  makeCreepRole: function(role) {
    var idleCreeps = Game.spawns.Spawn1.memory.idleCreeps;
    for (var delta = 0; delta < Object.keys(idleCreeps).length; delta++) {
      var creepName = Object.keys(idleCreeps)[delta];
      var creep = Game.creeps[creepName];
      if (!creep) {
        delete Game.spawns.Spawn1.memory.idleCreeps[creepName];
        continue;
      }
      if (_.difference(role.bodyParts, creep.bodyParts).length) {
        creep.memory.role = role.name;
        creep.memory.idleTime = 0;
        delete Game.spawns.Spawn1.memory.idleCreeps[creepName];
        console.log('Assigning ' + creepName + ' to role ' + role.name);
        Game.spawns.Spawn1.memory.idleCreeps = idleCreeps;
        return creep;
      }
    }
    return this.createCreep(role);
  }
};

module.exports = creepsManager;
