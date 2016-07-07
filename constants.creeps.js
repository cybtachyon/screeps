module.exports = {
  CREEP_WORKER: {
    bodyParts: [
      MOVE,
      WORK,
      CARRY
    ],
    preReqs: []
  },
  CREEP_ADV_WORKER: {
    bodyParts: [
      MOVE,
      WORK,
      WORK,
      CARRY,
      CARRY
    ],
    preReqs: [
      {STRUCTURE_SPAWN: 1},
      {STRUCTURE_EXTENSION: 1}
    ]
  }
};
