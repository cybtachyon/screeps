var towersManager = {
  getLowEnergyTowers: function() {
    var towers = [];
    for (var room_name in Game.rooms) {
      if (!Game.rooms.hasOwnProperty(room_name) || !Game.rooms[room_name] instanceof Room) {
        continue;
      }
      var room = Game.rooms[room_name];
      towers = towers.concat(room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType == STRUCTURE_TOWER
          && structure.energy < structure.energyCapacity * 0.2
      }));
    }
    return towers;
  },

  run: function () {

    for (var room_name in Game.rooms) {
      if (!Game.rooms.hasOwnProperty(room_name) || !Game.rooms[room_name] instanceof Room) {
        continue;
      }
      var room = Game.rooms[room_name];
      var towers = room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType == STRUCTURE_TOWER
      });
      for (var towerDelta = 0; towerDelta < towers.length; towerDelta++) {
        var tower = towers[towerDelta];
        if (tower) {

          if (tower.energy > 100) {
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_MY_STRUCTURES, {
              filter: (structure) => structure.hits < structure.hitsMax
            });
            if (closestDamagedStructure) {
              var action = tower.repair(closestDamagedStructure);
              console.log('Tower ' + tower.id + ' is repairing ' + closestDamagedStructure + ': ' + action);
            }
          }

          var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
          if (closestHostile) {
            tower.attack(closestHostile);
          }
        }
      }
    }
  }
};

module.exports = towersManager;
