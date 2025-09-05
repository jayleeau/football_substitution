// Pure logic helpers for planning and initial lineup selection. Attached to window for tests.

(function(){
  const generateHalfPlan = (playersList, goalieForThisHalfPlayer, designatedPlayerOutfieldThisHalf, numSlotsInHalf, halfNumber, cumulativePlanStats, previousSlotAssignments, constants) => {
    const { OUTFIELD_PLAYERS_ON_FIELD, MAX_CONSECUTIVE_ON_SLOTS } = constants;
    const halfSlotsData = [];
    let currentSlotAssignments = previousSlotAssignments || {};
    const specialOutfieldPlayers = playersList.filter(p => p.id !== goalieForThisHalfPlayer?.id);
    if (!designatedPlayerOutfieldThisHalf && specialOutfieldPlayers.length === OUTFIELD_PLAYERS_ON_FIELD * 2) {
      const group1 = specialOutfieldPlayers.slice(0, OUTFIELD_PLAYERS_ON_FIELD);
      const group2 = specialOutfieldPlayers.slice(OUTFIELD_PLAYERS_ON_FIELD);
      for (let i = 0; i < numSlotsInHalf; i++) {
        const newSlotAssignments = {};
        playersList.forEach(player => { if (cumulativePlanStats[player.id] && currentSlotAssignments[player.id] !== 'ON') { cumulativePlanStats[player.id].consecutiveON = 0; } });
        if (goalieForThisHalfPlayer) { newSlotAssignments[goalieForThisHalfPlayer.id] = 'GK'; cumulativePlanStats[goalieForThisHalfPlayer.id].GK++; cumulativePlanStats[goalieForThisHalfPlayer.id].consecutiveON = 0; }
        const activeGroup = i < numSlotsInHalf / 2 ? group1 : group2;
        const benchGroup = i < numSlotsInHalf / 2 ? group2 : group1;
        activeGroup.forEach(p => { newSlotAssignments[p.id] = 'ON'; cumulativePlanStats[p.id].ON++; cumulativePlanStats[p.id].consecutiveON = currentSlotAssignments[p.id] === 'ON' ? (cumulativePlanStats[p.id].consecutiveON || 0) + 1 : 1; if (halfNumber === 1) cumulativePlanStats[p.id].playedInH1 = true; });
        benchGroup.forEach(p => { newSlotAssignments[p.id] = 'OFF'; cumulativePlanStats[p.id].OFF++; cumulativePlanStats[p.id].consecutiveON = 0; });
        halfSlotsData.push({ assignments: newSlotAssignments });
        currentSlotAssignments = newSlotAssignments;
      }
      return halfSlotsData;
    }
    for (let i = 0; i < numSlotsInHalf; i++) {
      const newSlotAssignments = {};
      playersList.forEach(player => { if (cumulativePlanStats[player.id] && currentSlotAssignments[player.id] !== 'ON') { cumulativePlanStats[player.id].consecutiveON = 0; } });
      if (goalieForThisHalfPlayer) { newSlotAssignments[goalieForThisHalfPlayer.id] = 'GK'; cumulativePlanStats[goalieForThisHalfPlayer.id].GK++; cumulativePlanStats[goalieForThisHalfPlayer.id].consecutiveON = 0; }
      let outfieldSpotsToFill = OUTFIELD_PLAYERS_ON_FIELD;
      if (designatedPlayerOutfieldThisHalf) { newSlotAssignments[designatedPlayerOutfieldThisHalf.id] = 'ON'; cumulativePlanStats[designatedPlayerOutfieldThisHalf.id].ON++; cumulativePlanStats[designatedPlayerOutfieldThisHalf.id].consecutiveON = currentSlotAssignments[designatedPlayerOutfieldThisHalf.id] === 'ON' ? (cumulativePlanStats[designatedPlayerOutfieldThisHalf.id].consecutiveON || 0) + 1 : 1; if (halfNumber === 1) cumulativePlanStats[designatedPlayerOutfieldThisHalf.id].playedInH1 = true; outfieldSpotsToFill--; }
      let outfieldCandidatePool = playersList.filter(p => p.id !== goalieForThisHalfPlayer?.id && p.id !== designatedPlayerOutfieldThisHalf?.id);
      outfieldCandidatePool.sort((a, b) => {
        const aStats = cumulativePlanStats[a.id]; const bStats = cumulativePlanStats[b.id];
        if (!aStats || !bStats) return 0;
        if (halfNumber === 2) { if (!aStats.playedInH1 && bStats.playedInH1) return -1; if (aStats.playedInH1 && !bStats.playedInH1) return 1; }
        if (aStats.ON !== bStats.ON) return aStats.ON - bStats.ON;
        const aWasOn = currentSlotAssignments[a.id] === 'ON'; const bWasOn = currentSlotAssignments[b.id] === 'ON';
        if (aWasOn && aStats.consecutiveON < MAX_CONSECUTIVE_ON_SLOTS && (!bWasOn || bStats.consecutiveON >= MAX_CONSECUTIVE_ON_SLOTS)) return -1;
        if (bWasOn && bStats.consecutiveON < MAX_CONSECUTIVE_ON_SLOTS && (!aWasOn || aStats.consecutiveON >= MAX_CONSECUTIVE_ON_SLOTS)) return 1;
        if (aStats.consecutiveON !== bStats.consecutiveON) return aStats.consecutiveON - bStats.consecutiveON;
        const numB = parseInt(b.number, 10) || 0; const numA = parseInt(a.number, 10) || 0;
        if (numA !== numB) { return numB - numA; }
        return a.name.localeCompare(b.name);
      });
      for (let j = 0; j < outfieldCandidatePool.length; j++) {
        const player = outfieldCandidatePool[j];
        if (outfieldSpotsToFill > 0) { newSlotAssignments[player.id] = 'ON'; cumulativePlanStats[player.id].ON++; cumulativePlanStats[player.id].consecutiveON = currentSlotAssignments[player.id] === 'ON' ? (cumulativePlanStats[player.id].consecutiveON || 0) + 1 : 1; if (halfNumber === 1) cumulativePlanStats[player.id].playedInH1 = true; outfieldSpotsToFill--; }
        else { newSlotAssignments[player.id] = 'OFF'; cumulativePlanStats[player.id].OFF++; cumulativePlanStats[player.id].consecutiveON = 0; }
      }
      halfSlotsData.push({ assignments: newSlotAssignments });
      currentSlotAssignments = newSlotAssignments;
    }
    return halfSlotsData;
  };

  const generateFullGamePlan = (gamePlayers, config) => {
    const { HALF_DURATION_SECONDS, SLOT_DURATION_SECONDS, designatedGoalie1Id, designatedGoalie2Id, goalieForHalf1, goalieForHalf2, constants } = config;
    if (!gamePlayers || gamePlayers.length === 0) return { half1: [], half2: [], totalPlayerSlotCounts: {} };
    const numSlotsPerHalf = Math.floor(HALF_DURATION_SECONDS / SLOT_DURATION_SECONDS);
    const cumulativePlanStats = {};
    gamePlayers.forEach(p => { cumulativePlanStats[p.id] = { GK: 0, ON: 0, OFF: 0, name: p.name, number: p.number, playedInH1: false, consecutiveON: 0 }; });
    let planGoalieH1Player = null, planGoalieH2Player = null;
    let dgOutfieldH1Player = null, dgOutfieldH2Player = null;
    const dg1 = designatedGoalie1Id ? gamePlayers.find(p => p.id === designatedGoalie1Id) : null;
    const dg2 = designatedGoalie2Id ? gamePlayers.find(p => p.id === designatedGoalie2Id) : null;
    if (dg1 && dg2) { planGoalieH1Player = dg1; dgOutfieldH1Player = dg2; planGoalieH2Player = dg2; dgOutfieldH2Player = dg1; }
    else if (dg1) { planGoalieH1Player = dg1; dgOutfieldH2Player = dg1; const potentialH2Goalies = gamePlayers.filter(p => p.id !== dg1.id); planGoalieH2Player = potentialH2Goalies.length > 0 ? potentialH2Goalies[0] : dg1; }
    else { planGoalieH1Player = goalieForHalf1; planGoalieH2Player = goalieForHalf2; }
    if (goalieForHalf1 && gamePlayers.find(p=>p.id === goalieForHalf1.id)) planGoalieH1Player = goalieForHalf1;
    const h1Slots = planGoalieH1Player ? generateHalfPlan(gamePlayers, planGoalieH1Player, dgOutfieldH1Player, numSlotsPerHalf, 1, cumulativePlanStats, null, constants) : [];
    const lastSlotH1Assignments = h1Slots.length > 0 ? h1Slots[h1Slots.length - 1].assignments : null;
    const actualPlanGoalieH2 = (goalieForHalf2 && gamePlayers.find(p=>p.id === goalieForHalf2.id)) ? goalieForHalf2 : planGoalieH2Player;
    const h2Slots = actualPlanGoalieH2 ? generateHalfPlan(gamePlayers, actualPlanGoalieH2, dgOutfieldH2Player, numSlotsPerHalf, 2, cumulativePlanStats, lastSlotH1Assignments, constants) : [];
    return { half1: h1Slots, half2: h2Slots, totalPlayerSlotCounts: cumulativePlanStats };
  };

  const getInitialActivePlayers = (players, goalieForHalf, startingLineup, firstSlotAssignments, constants) => {
    const { OUTFIELD_PLAYERS_ON_FIELD } = constants;
    let currentActualGoalie = goalieForHalf;
    if (startingLineup && startingLineup.goalieId) {
      const selectedGoalie = players.find(p => p.id === startingLineup.goalieId);
      if (selectedGoalie) currentActualGoalie = selectedGoalie;
    }
    let initialFieldPlayers = [];
    if (startingLineup && startingLineup.outfieldIds && startingLineup.outfieldIds.length > 0) {
      initialFieldPlayers = players.filter(p => startingLineup.outfieldIds.includes(p.id));
    } else if (firstSlotAssignments) {
      initialFieldPlayers = players.filter(p => firstSlotAssignments[p.id] === 'ON' && p.id !== currentActualGoalie?.id);
    } else {
      const availableForOutfield = players.filter(p => p.id !== currentActualGoalie?.id);
      initialFieldPlayers = availableForOutfield.slice(0, OUTFIELD_PLAYERS_ON_FIELD);
    }
    const active = players.map(p => ({ playerId: p.id, name: p.name, number: p.number, status: p.id === currentActualGoalie?.id ? 'Goalie' : initialFieldPlayers.some(fp => fp.id === p.id) ? 'Field' : 'Bench' }));
    return active;
  };

  window.AppLogic = { generateHalfPlan, generateFullGamePlan, getInitialActivePlayers };
})();


