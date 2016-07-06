var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

var roles = [
  {
    name: 'harvester',
    class: roleHarvester,
    roomLimit: 3
  },
  {
    name: 'upgrader',
    class: roleUpgrader,
    roomLimit: 2
  },
  {
    name: 'builder',
    class: roleBuilder,
    roomLimit: 1
  }
];

var creepsManager = {

  /** @param {Array.<Creep>} creeps **/
  run: function (creeps) {

    for (var roleId in roles) {
      var role = roles[roleId];
      // Ensure enough creeps are spawned.
      var roleCreeps = _.filter(creeps, (creep) => creep.memory.role == role.name);
      if (roleCreeps.length < role.roomLimit) {
        if (!Game.spawns.Spawn1.spawning && Game.spawns.Spawn1.canCreateCreep([WORK, CARRY, MOVE]) == OK) {
          Game.spawns.Spawn1.createCreep([WORK, CARRY, MOVE], undefined, {role: role.name});
        }
      }

      // Run the roles for each creep.
      for (var creep in roleCreeps) {
        role.class.run(roleCreeps[creep]);
      }
    }
  }
};

module.exports = creepsManager;
