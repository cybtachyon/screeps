var towersManager = {
  run: function () {

    for (var roomName in Game.rooms) {
      if (!Game.rooms.hasOwnProperty(roomName) || !Game.rooms[roomName] instanceof Room) {
        continue;
      }
      var room = Game.rooms[roomName];
      var towers = room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType == STRUCTURE_TOWER
      });
      for (var towerDelta = 0; towerDelta < towers.length; towerDelta++) {
        var tower = towers[towerDelta];
        if (tower) {
          var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
          });
          if (closestDamagedStructure) {
            var action = tower.repair(closestDamagedStructure);
            console.log('Tower ' + tower.id + ' is repairing ' + closestDamagedStructure + ': ' + action);
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
