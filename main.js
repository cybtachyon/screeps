require('Creep');

var creepsManager = require('manager.creeps');
var towersManager = require('manager.towers');

module.exports.loop = function () {
  // Always place this memory cleaning code at the very top of your main loop!
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  towersManager.run();
  creepsManager.run(Game.creeps);

};
