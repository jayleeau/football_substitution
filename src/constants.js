// Constants and data used across the app. Attached to window for non-bundled usage.

window.AppConstants = (function() {
  const HALF_DURATION_MINUTES = 20;
  const HALF_DURATION_SECONDS = HALF_DURATION_MINUTES * 60;
  const OUTFIELD_PLAYERS_ON_FIELD = 6;
  const SLOT_DURATION_MINUTES = 5;
  const SLOT_DURATION_SECONDS = SLOT_DURATION_MINUTES * 60;
  const MAX_CONSECUTIVE_ON_SLOTS = 3;

  const DEFAULT_ROSTER = [
    { id: 'default_1', name: 'Noah', number: '5' }, { id: 'default_2', name: 'Harry', number: '10' },
    { id: 'default_3', name: 'Remy', number: '11' }, { id: 'default_4', name: 'Josh', number: '5' },
    { id: 'default_5', name: 'James', number: '24' }, { id: 'default_6', name: 'Gabriel', number: '7' },
    { id: 'default_7', name: 'Alexander', number: '4' }, { id: 'default_8', name: 'Kendrick', number: '12' },
    { id: 'default_9', name: 'Ben', number: '12' }, { id: 'default_10', name: 'Vihaan', number: '9' },
    { id: 'default_11', name: 'Fraser', number: '12' }, { id: 'default_12', name: 'Ashton', number: '1' }
  ];

  const PITCH_POSITIONS = [
    { id: 'LW', name: 'LW', zone: 'Forward', gridArea: '1 / 1 / 2 / 2' }, { id: 'ST1', name: 'ST', zone: 'Forward', gridArea: '1 / 2 / 2 / 3' }, { id: 'ST2', name: 'ST', zone: 'Forward', gridArea: '1 / 3 / 2 / 4' }, { id: 'ST3', name: 'ST', zone: 'Forward', gridArea: '1 / 4 / 2 / 5' }, { id: 'RW', name: 'RW', zone: 'Forward', gridArea: '1 / 5 / 2 / 6' },
    { id: 'LM', name: 'LM', zone: 'Midfield', gridArea: '2 / 1 / 3 / 2' }, { id: 'CM1', name: 'CM', zone: 'Midfield', gridArea: '2 / 2 / 3 / 3' }, { id: 'CM2', name: 'CM', zone: 'Midfield', gridArea: '2 / 3 / 3 / 4' }, { id: 'CM3', name: 'CM', zone: 'Midfield', gridArea: '2 / 4 / 3 / 5' }, { id: 'RM', name: 'RM', zone: 'Midfield', gridArea: '2 / 5 / 3 / 6' },
    { id: 'DL', name: 'DL', zone: 'Defense', gridArea: '3 / 1 / 4 / 2' }, { id: 'DC1', name: 'DC', zone: 'Defense', gridArea: '3 / 2 / 4 / 3' }, { id: 'DC2', name: 'DC', zone: 'Defense', gridArea: '3 / 3 / 4 / 4' }, { id: 'DC3', name: 'DC', zone: 'Defense', gridArea: '3 / 4 / 4 / 5' }, { id: 'DR', name: 'DR', zone: 'Defense', gridArea: '3 / 5 / 4 / 6' },
  ];

  const DEFAULT_FORMATION_IDS = ['ST2', 'CM2', 'RM', 'LM', 'DC1', 'DC3'];

  return {
    HALF_DURATION_MINUTES,
    HALF_DURATION_SECONDS,
    OUTFIELD_PLAYERS_ON_FIELD,
    SLOT_DURATION_MINUTES,
    SLOT_DURATION_SECONDS,
    MAX_CONSECUTIVE_ON_SLOTS,
    DEFAULT_ROSTER,
    PITCH_POSITIONS,
    DEFAULT_FORMATION_IDS,
  };
})();


