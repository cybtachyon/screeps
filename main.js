require('Creep');
require('RoomPosition');
require('Source');

var creepsManager = require('manager.creeps');
var towersManager = require('manager.towers');

module.exports.loop = function () {
  // Stat tracking.
  if (!Memory.stats) {
    Memory.stats = {
      avgMsPerTick: 0.00,
      gameAvgMsPerTick: 0.00,
      gameLastTs: new Date(),
      lastTicks: [],
      gameLastTicks: []
    };
  }
  var loop_start = new Date();

  // Always place this memory cleaning code at the very top of your main loop!
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  towersManager.run();
  creepsManager.run(Game.creeps);

  // Stat tracking.
  var loop_end = new Date();
  var tick_ms = loop_end - loop_start;
  Memory.stats.lastTicks.push(tick_ms);
  if (Memory.stats.lastTicks.length > 5) {
    Memory.stats.lastTicks.shift();
  }
  Memory.stats.avgMsPerTick = Memory.stats.lastTicks.reduce(
    function(previous_value, current_value, index, map_array) {
      if (index + 1 == map_array.length) {
        return (previous_value + current_value) / map_array.length;
      }
      return previous_value + current_value;
    }, 0);
  var game_tick_ms = loop_end - new Date(Memory.stats.gameLastTs);
  Memory.stats.gameLastTicks.push(game_tick_ms);
  if (Memory.stats.gameLastTicks.length > 5) {
    Memory.stats.gameLastTicks.shift();
  }
  Memory.stats.gameAvgMsPerTick = Memory.stats.gameLastTicks.reduce(
    function(previous_value, current_value, index, map_array) {
      if (index + 1 == map_array.length) {
        return (previous_value + current_value) / map_array.length;
      }
      return previous_value + current_value;
    }, 0);
  Memory.stats.gameLastTs = loop_end;
};
