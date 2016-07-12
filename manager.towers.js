var towersManager = {
  // @TODO: Revisit hardcoded percentages here.

  getLowEnergyTowers: function() {
    var towers = [];
    for (var room_name in Game.rooms) {
      if (!Game.rooms.hasOwnProperty(room_name) || !Game.rooms[room_name] instanceof Room) {
        continue;
      }
      var room = Game.rooms[room_name];
      towers = towers.concat(room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType == STRUCTURE_TOWER
          && structure.energy < structure.energyCapacity * 0.7
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

          if (tower.energy > tower.energyCapacity * 0.35) {
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
              filter: (structure) => (structure.hits < structure.hitsMax && structure.my)
                || (structure.hits < structure.hitsMax * 0.003
                  && structure.structureType == STRUCTURE_WALL)
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
