var energyManager = require('manager.energy');

Creep.prototype.receiveEnergy = function(energy_amount) {
  var source = energyManager.requestEnergySource(this, energy_amount);
  if (!source) {
    return false;
  }
  var transfer = energyManager.transferEnergy(source, this, energy_amount);
  if (transfer == ERR_NOT_IN_RANGE) {
    return this.moveTo(source);
  }
};
