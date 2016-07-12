/** @param spaces */
RoomPosition.prototype.getOpenTerrain = function(spaces) {
  var terrain = [];
  for (var x = -spaces; x <= spaces; x++) {
    for (var y = -spaces; y <= spaces; y++) {
      var terrain_type = Game.map.getTerrainAt(this.x + x, this.y + y, this.roomName);
      if (terrain_type != 'wall') {
        terrain.push(new RoomPosition(x, y, this.roomName));
      }
    }
  }
  return terrain;
};
