// Main App component extracted from index.html inline script
// Relies on global window.AppConstants, window.AppUtils, and window.Components

function App() {
  const { formatTime } = window.AppUtils;
  const { 
    HALF_DURATION_MINUTES, HALF_DURATION_SECONDS, OUTFIELD_PLAYERS_ON_FIELD,
    SLOT_DURATION_MINUTES, SLOT_DURATION_SECONDS, MAX_CONSECUTIVE_ON_SLOTS,
    DEFAULT_ROSTER, PITCH_POSITIONS, DEFAULT_FORMATION_IDS
  } = window.AppConstants;

  const [gamePhase, setGamePhase] = React.useState('Setup');
  const [players, setPlayers] = React.useState([]);
  const [setupMode, setSetupMode] = React.useState(null);
  const [availableDefaultPlayers, setAvailableDefaultPlayers] = React.useState(DEFAULT_ROSTER.map(p => ({ ...p, isPlayingToday: true, originalId: p.id })));
  const [designatedGoalie1Id, setDesignatedGoalie1Id] = React.useState(null);
  const [designatedGoalie2Id, setDesignatedGoalie2Id] = React.useState(null);
  const [goalieForHalf1, setGoalieForHalf1] = React.useState(null);
  const [goalieForHalf2, setGoalieForHalf2] = React.useState(null);
  const [currentHalf, setCurrentHalf] = React.useState(1);
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);
  const [timerSeconds, setTimerSeconds] = React.useState(0);
  const [halfStartTime, setHalfStartTime] = React.useState(0);
  const [elapsedOnPause, setElapsedOnPause] = React.useState(0);
  const [activePlayers, setActivePlayers] = React.useState([]);
  const [showLineupSelector, setShowLineupSelector] = React.useState(false);
  const [pendingStartingLineup, setPendingStartingLineup] = React.useState({ goalieId: null, outfieldIds: [] });
  const [confirmedStartingLineup, setConfirmedStartingLineup] = React.useState(null);
  const [playerStats, setPlayerStats] = React.useState({});
  const [showModal, setShowModal] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState('');
  const [modalTitle, setModalTitle] = React.useState('Notification');
  const [substitutionPlan, setSubstitutionPlan] = React.useState(null);
  const [showPlanTable, setShowPlanTable] = React.useState(false);
  const [nextPlannedSubInfo, setNextPlannedSubInfo] = React.useState({ timeString: '', playersComingOff: [], playersGoingOn: [], isApplicable: false, slotIndex: -1, isInitialLineup: false });
  const [acknowledgedPlannedSubSlotIndex, setAcknowledgedPlannedSubSlotIndex] = React.useState(-1);
  const [planDeviated, setPlanDeviated] = React.useState(false);
  const [showPitchView, setShowPitchView] = React.useState(false);
  const [pitchPlayerPositions, setPitchPlayerPositions] = React.useState({});
  const [pitchDisplayMode, setPitchDisplayMode] = React.useState('name');
  const [half2PlayerStartTimes, setHalf2PlayerStartTimes] = React.useState({});
  const [half2PlayerAccumulated, setHalf2PlayerAccumulated] = React.useState({});
  const [geminiIsLoading, setGeminiIsLoading] = React.useState(false);

  const STORAGE_KEY = 'soccer_substitution_state';

  React.useEffect(() => {
    if (location.search.includes('reset=1')) {
      localStorage.removeItem('soccer_substitution_state');
      location.replace(location.pathname); // remove the query
    }
  }, []);

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.gamePhase) setGamePhase(parsed.gamePhase);
        if (parsed.players) setPlayers(parsed.players);
        if (parsed.setupMode) setSetupMode(parsed.setupMode);
        if (parsed.availableDefaultPlayers) setAvailableDefaultPlayers(parsed.availableDefaultPlayers);
        if (parsed.designatedGoalie1Id) setDesignatedGoalie1Id(parsed.designatedGoalie1Id);
        if (parsed.designatedGoalie2Id) setDesignatedGoalie2Id(parsed.designatedGoalie2Id);
        if (parsed.goalieForHalf1) setGoalieForHalf1(parsed.goalieForHalf1);
        if (parsed.goalieForHalf2) setGoalieForHalf2(parsed.goalieForHalf2);
        if (parsed.currentHalf) setCurrentHalf(parsed.currentHalf);
        if (parsed.activePlayers) setActivePlayers(parsed.activePlayers);
        if (parsed.playerStats) setPlayerStats(parsed.playerStats);
        if (parsed.substitutionPlan) setSubstitutionPlan(parsed.substitutionPlan);
        if (parsed.showPlanTable) setShowPlanTable(parsed.showPlanTable);
        if (parsed.nextPlannedSubInfo) setNextPlannedSubInfo(parsed.nextPlannedSubInfo);
        if (parsed.acknowledgedPlannedSubSlotIndex !== undefined) setAcknowledgedPlannedSubSlotIndex(parsed.acknowledgedPlannedSubSlotIndex);
        if (parsed.planDeviated) setPlanDeviated(parsed.planDeviated);
        if (parsed.showPitchView) setShowPitchView(parsed.showPitchView);
        if (parsed.pitchPlayerPositions) setPitchPlayerPositions(parsed.pitchPlayerPositions);
        if (parsed.pitchDisplayMode) setPitchDisplayMode(parsed.pitchDisplayMode);
        if (parsed.half2PlayerStartTimes) setHalf2PlayerStartTimes(parsed.half2PlayerStartTimes);
        if (parsed.half2PlayerAccumulated) setHalf2PlayerAccumulated(parsed.half2PlayerAccumulated);
        if (parsed.timerSeconds) {
          setTimerSeconds(parsed.timerSeconds);
          setElapsedOnPause(parsed.elapsedOnPause || 0);
          if (parsed.isTimerRunning) {
            setIsTimerRunning(true);
            setHalfStartTime(Date.now() - (parsed.timerSeconds - (parsed.elapsedOnPause || 0)) * 1000);
          }
        }
      } catch (err) {
        console.error('Failed to load saved state', err);
      }
    }
  }, []);

  React.useEffect(() => {
    const data = {
      gamePhase,
      players,
      setupMode,
      availableDefaultPlayers,
      designatedGoalie1Id,
      designatedGoalie2Id,
      goalieForHalf1,
      goalieForHalf2,
      currentHalf,
      activePlayers,
      playerStats,
      substitutionPlan,
      showPlanTable,
      nextPlannedSubInfo,
      acknowledgedPlannedSubSlotIndex,
      planDeviated,
      showPitchView,
      pitchPlayerPositions,
      pitchDisplayMode,
      half2PlayerStartTimes,
      half2PlayerAccumulated,
      timerSeconds,
      elapsedOnPause,
      isTimerRunning
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [
    gamePhase, players, setupMode, availableDefaultPlayers, designatedGoalie1Id, designatedGoalie2Id,
    goalieForHalf1, goalieForHalf2, currentHalf, activePlayers, playerStats, substitutionPlan,
    showPlanTable, nextPlannedSubInfo, acknowledgedPlannedSubSlotIndex, planDeviated, showPitchView,
    pitchPlayerPositions, pitchDisplayMode, half2PlayerStartTimes, half2PlayerAccumulated,
    timerSeconds, elapsedOnPause, isTimerRunning
  ]);

  const callGeminiAPI = async (prompt) => {
    setGeminiIsLoading(true);
    setModalMessage('');
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, topK: 1, topP: 1, maxOutputTokens: 200 } };
    try {
      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error:", errorData);
        throw new Error(`API Error: ${response.status} ${errorData?.error?.message || response.statusText}`);
      }
      const result = await response.json();
      setGeminiIsLoading(false);
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        return result.candidates[0].content.parts[0].text;
      } else {
        console.error("Unexpected response structure from Gemini API:", result);
        throw new Error("Could not extract text from Gemini API response.");
      }
    } catch (error) {
      setGeminiIsLoading(false);
      console.error("Error calling Gemini API:", error);
      setModalTitle("API Error");
      setModalMessage(`Could not generate content: ${error.message}. Please try again later.`);
      setShowModal(true);
      return null;
    }
  };

  const handleGeneratePepTalk = async () => {
    const teamName = "our awesome team";
    const prompt = `Generate a very short, fun, and encouraging pep talk (2-3 sentences) for an under-8 co-ed soccer team called "${teamName}" before their game. Focus on teamwork, trying their best, and having fun.`;
    const talk = await callGeminiAPI(prompt);
    if (talk) { setModalTitle("✨ Pre-Game Pep Talk ✨"); setModalMessage(talk); setShowModal(true); }
  };
  const handleGenerateHalftimeMessage = async () => {
    const prompt = `Generate a very short, positive halftime message (2-3 sentences) for an under-8 co-ed soccer team. Remind them to keep up the good effort, listen to their coach, and have fun in the second half. Include one very simple, positive tip like "look for open teammates".`;
    const message = await callGeminiAPI(prompt);
    if (message) { setModalTitle("✨ Half-Time Boost ✨"); setModalMessage(message); setShowModal(true); }
  };

  const generateHalfPlan = React.useCallback((playersList, goalieForThisHalfPlayer, designatedPlayerOutfieldThisHalf, numSlotsInHalf, halfNumber, cumulativePlanStats, previousSlotAssignments) => {
    const halfSlotsData = [];
    const playerSlotCountsThisHalf = {};
    playersList.forEach(p => { playerSlotCountsThisHalf[p.id] = { GK: 0, ON: 0, OFF: 0 }; });
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
      for (let j = 0; j < outfieldCandidatePool.length; j++) { const player = outfieldCandidatePool[j]; if (outfieldSpotsToFill > 0) { newSlotAssignments[player.id] = 'ON'; cumulativePlanStats[player.id].ON++; cumulativePlanStats[player.id].consecutiveON = currentSlotAssignments[player.id] === 'ON' ? (cumulativePlanStats[player.id].consecutiveON || 0) + 1 : 1; if (halfNumber === 1) cumulativePlanStats[player.id].playedInH1 = true; outfieldSpotsToFill--; } else { newSlotAssignments[player.id] = 'OFF'; cumulativePlanStats[player.id].OFF++; cumulativePlanStats[player.id].consecutiveON = 0; } }
      halfSlotsData.push({ assignments: newSlotAssignments });
      currentSlotAssignments = newSlotAssignments;
    }
    return halfSlotsData;
  }, []);

  const generateFullGamePlan = React.useCallback((gamePlayers) => {
    if (gamePlayers.length === 0) return null;
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
    const h1Slots = planGoalieH1Player ? generateHalfPlan(gamePlayers, planGoalieH1Player, dgOutfieldH1Player, numSlotsPerHalf, 1, cumulativePlanStats, null) : [];
    const lastSlotH1Assignments = h1Slots.length > 0 ? h1Slots[h1Slots.length - 1].assignments : null;
    const actualPlanGoalieH2 = (goalieForHalf2 && gamePlayers.find(p=>p.id === goalieForHalf2.id)) ? goalieForHalf2 : planGoalieH2Player;
    const h2Slots = actualPlanGoalieH2 ? generateHalfPlan(gamePlayers, actualPlanGoalieH2, dgOutfieldH2Player, numSlotsPerHalf, 2, cumulativePlanStats, lastSlotH1Assignments) : [];
    setSubstitutionPlan({ half1: h1Slots, half2: h2Slots, totalPlayerSlotCounts: cumulativePlanStats });
    setPlanDeviated(false);
    setAcknowledgedPlannedSubSlotIndex(-1);
  }, [designatedGoalie1Id, designatedGoalie2Id, goalieForHalf1, goalieForHalf2, generateHalfPlan]);

  React.useEffect(() => {
    if (!substitutionPlan || !(gamePhase.includes('Playing') || gamePhase.includes('PreHalf'))) {
      setNextPlannedSubInfo({ isApplicable: false, playersComingOff: [], playersGoingOn: [], timeString: '', slotIndex: -1, isInitialLineup: false });
      return;
    }
    const currentPlanHalfData = currentHalf === 1 ? substitutionPlan.half1 : substitutionPlan.half2;
    if (!currentPlanHalfData || currentPlanHalfData.length === 0) {
      setNextPlannedSubInfo({ isApplicable: false, playersComingOff: [], playersGoingOn: [], timeString: '', slotIndex: -1, isInitialLineup: false });
      return;
    }
    let firstRelevantSlotIndex = acknowledgedPlannedSubSlotIndex + 1;
    if ((gamePhase.includes('PreHalf1') || gamePhase.includes('PreHalf2')) && acknowledgedPlannedSubSlotIndex === -1) { firstRelevantSlotIndex = 0; }
    let foundNextSub = false;
    for (let slotIdx = firstRelevantSlotIndex; slotIdx < currentPlanHalfData.length; slotIdx++) {
      const prevSlotAssignments = (slotIdx === 0) ? (currentHalf === 2 && substitutionPlan.half1.length > 0 ? substitutionPlan.half1[substitutionPlan.half1.length -1].assignments : {}) : currentPlanHalfData[slotIdx - 1].assignments;
      const targetSlotAssignments = currentPlanHalfData[slotIdx].assignments;
      const playersPlannedOff = [];
      const playersPlannedOn = [];
      players.forEach(player => {
        const prevStatus = prevSlotAssignments[player.id];
        const targetStatus = targetSlotAssignments[player.id];
        if (slotIdx === 0 && targetStatus === 'ON' && player.id !== (currentHalf === 1 ? goalieForHalf1?.id : goalieForHalf2?.id) ) {
          playersPlannedOn.push(player);
        } else if (slotIdx > 0) {
          if (prevStatus === 'ON' && targetStatus !== 'ON') playersPlannedOff.push(player);
          else if (prevStatus !== 'ON' && targetStatus === 'ON') playersPlannedOn.push(player);
        }
      });
      const isInitial = (slotIdx === 0 && acknowledgedPlannedSubSlotIndex === -1);
      if (playersPlannedOff.length > 0 || playersPlannedOn.length > 0 || isInitial) {
        setNextPlannedSubInfo({ timeString: formatTime(slotIdx * SLOT_DURATION_SECONDS), playersComingOff: playersPlannedOff, playersGoingOn: playersPlannedOn, isApplicable: true, slotIndex: slotIdx, isInitialLineup: isInitial });
        foundNextSub = true;
        break;
      }
    }
    if (!foundNextSub) setNextPlannedSubInfo({ isApplicable: false, playersComingOff: [], playersGoingOn: [], timeString: currentPlanHalfData.length > 0 ? 'End of Half' : '', slotIndex: -1, isInitialLineup: false });
  }, [timerSeconds, currentHalf, substitutionPlan, gamePhase, players, acknowledgedPlannedSubSlotIndex, goalieForHalf1, goalieForHalf2]);

  const handleSetupModeSelect = (mode) => { setSetupMode(mode); if (mode === 'manual') setPlayers([]); };
  const handleDefaultPlayerToggle = (playerId) => { setAvailableDefaultPlayers(prev => prev.map(p => p.id === playerId ? {...p, isPlayingToday: !p.isPlayingToday} : p)); };
  const handleDefaultPlayerDetailChange = (playerId, field, value) => { setAvailableDefaultPlayers(prev => prev.map(p => p.id === playerId ? {...p, [field]: value} : p)); };
  const addManualPlayer = () => { const newPlayerId = `manual_${Date.now()}`; setPlayers(prev => [...prev, {id: newPlayerId, name: `Player ${prev.length + 1}`, number: '', isDesignatedGoalie: false}]); };
  const handleManualPlayerDetailChange = (playerId, field, value) => { setPlayers(prev => prev.map(p => p.id === playerId ? {...p, [field]:value} : p)); };
  const removeManualPlayer = (playerId) => { setPlayers(prev => prev.filter(p => p.id !== playerId)); if (designatedGoalie1Id === playerId) setDesignatedGoalie1Id(null); if (designatedGoalie2Id === playerId) setDesignatedGoalie2Id(null); };

  const initializePlayerStats = React.useCallback((gamePlayers) => { const initialStats = {}; gamePlayers.forEach(p => { initialStats[p.id] = { name: p.name, number:p.number, outfield: 0, goalie: 0 }; }); setPlayerStats(initialStats); }, []);

  const finalizeSetup = () => {
    let currentPlayersForGame = [];
    if (setupMode === 'defaultRoster') {
      currentPlayersForGame = availableDefaultPlayers.filter(p => p.isPlayingToday).map(p => ({ id: p.id, name: p.name, number: p.number, isDesignatedGoalie: false }));
    } else if (setupMode === 'manual') {
      currentPlayersForGame = players.map(p => ({...p, isDesignatedGoalie: false}));
    }
    if (currentPlayersForGame.length < OUTFIELD_PLAYERS_ON_FIELD + 1) { setModalMessage(`Need at least ${OUTFIELD_PLAYERS_ON_FIELD + 1} players selected.`); setShowModal(true); return; }
    setPlayers(currentPlayersForGame);
    initializePlayerStats(currentPlayersForGame);
    let g1 = designatedGoalie1Id ? currentPlayersForGame.find(p => p.id === designatedGoalie1Id) : null;
    let g2 = designatedGoalie2Id ? currentPlayersForGame.find(p => p.id === designatedGoalie2Id) : null;
    if (g1 && g2) { setGoalieForHalf1(g1); setGoalieForHalf2(g2); }
    else if (g1) { setGoalieForHalf1(g1); }
    else { if (currentPlayersForGame.length > 0) { setModalMessage("Please designate at least one goalie from the selected players."); setShowModal(true); return; } }
    setPendingStartingLineup({ goalieId: g1 ? g1.id : null, outfieldIds: [] });
    setShowLineupSelector(true);
  };

  const setupHalf = React.useCallback((halfNum, startingLineup = null) => {
    setCurrentHalf(halfNum);
    setTimerSeconds(0);
    setElapsedOnPause(0);
    if(halfNum === 2){ setHalf2PlayerStartTimes({}); setHalf2PlayerAccumulated({}); }
    // Prefer an explicitly confirmed lineup for half 1
    const effectiveStartingLineup = (halfNum === 1 && confirmedStartingLineup) ? confirmedStartingLineup : startingLineup;
    let currentActualGoalie = halfNum === 1 ? goalieForHalf1 : goalieForHalf2;
    if (effectiveStartingLineup && effectiveStartingLineup.goalieId) { const selectedGoalie = players.find(p => p.id === effectiveStartingLineup.goalieId); if (selectedGoalie) currentActualGoalie = selectedGoalie; }
    if (!currentActualGoalie) {
      if (halfNum === 2 && designatedGoalie1Id && !designatedGoalie2Id) { setModalMessage("CRITICAL: Select goalie for 2nd half."); setShowModal(true); setGamePhase('HalfTime'); return; }
      else { setModalMessage(`Goalie for Half ${halfNum} not defined.`); setShowModal(true); setGamePhase('Setup'); return; }
    }
    const halfPlan = halfNum === 1 ? substitutionPlan?.half1 : substitutionPlan?.half2;
    let initialFieldPlayers = [];
    if (effectiveStartingLineup && effectiveStartingLineup.outfieldIds && effectiveStartingLineup.outfieldIds.length > 0) { initialFieldPlayers = players.filter(p => effectiveStartingLineup.outfieldIds.includes(p.id)); }
    else if (halfPlan && halfPlan.length > 0 && halfPlan[0].assignments) { const firstSlotAssignments = halfPlan[0].assignments; initialFieldPlayers = players.filter(p => firstSlotAssignments[p.id] === 'ON' && p.id !== currentActualGoalie?.id); }
    else { const availableForOutfield = players.filter(p => p.id !== currentActualGoalie?.id); initialFieldPlayers = availableForOutfield.slice(0, OUTFIELD_PLAYERS_ON_FIELD); }
    setActivePlayers(players.map(p => ({ playerId: p.id, name: p.name, number: p.number, status: p.id === currentActualGoalie?.id ? 'Goalie' : initialFieldPlayers.some(fp => fp.id === p.id) ? 'Field' : 'Bench' })));
    setPlanDeviated(false);
    setAcknowledgedPlannedSubSlotIndex(-1);
    setPitchPlayerPositions({});
  }, [players, goalieForHalf1, goalieForHalf2, designatedGoalie1Id, designatedGoalie2Id, substitutionPlan, confirmedStartingLineup]);

  React.useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        const elapsed = Math.round((Date.now() - halfStartTime) / 1000) + elapsedOnPause;
        const newTimerValue = Math.min(elapsed, HALF_DURATION_SECONDS);
        setTimerSeconds(newTimerValue);
        if (newTimerValue >= HALF_DURATION_SECONDS) {
          setIsTimerRunning(false);
          if (currentHalf === 1) setGamePhase('HalfTime');
          else finishGame();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, halfStartTime, elapsedOnPause, currentHalf]);

  React.useEffect(() => { if (gamePhase === 'PreHalf2') setupHalf(2); }, [gamePhase, setupHalf]);

  const handleConfirmStartingLineup = () => {
    const allPlayers = players;
    const selectedLineup = { ...pendingStartingLineup };
    setConfirmedStartingLineup(selectedLineup);
    setShowLineupSelector(false);
    generateFullGamePlan(allPlayers);
    setupHalf(1);
    setGamePhase('PreHalf1');
  };

  const handlePause = () => { if (!isTimerRunning) return; setIsTimerRunning(false); const elapsed = Math.round((Date.now() - halfStartTime) / 1000) + elapsedOnPause; setElapsedOnPause(Math.min(elapsed, HALF_DURATION_SECONDS)); };
  const handleResume = () => { if (isTimerRunning || timerSeconds >= HALF_DURATION_SECONDS) return; setHalfStartTime(Date.now()); setIsTimerRunning(true); };

  const startGameHalf = () => {
    const currentActualGoalie = (currentHalf === 1) ? goalieForHalf1 : goalieForHalf2;
    if (!currentActualGoalie) { setModalMessage(`Goalie for Half ${currentHalf} must be set.`); setShowModal(true); return; }
    const outfielders = activePlayers.filter(p => p.status === 'Field');
    if (outfielders.length !== OUTFIELD_PLAYERS_ON_FIELD) { setModalMessage(`Select ${OUTFIELD_PLAYERS_ON_FIELD} outfield players.`); setShowModal(true); return; }
    if (nextPlannedSubInfo.isInitialLineup && acknowledgedPlannedSubSlotIndex === -1) {
      let initialPitchPositions = {};
      const outfieldStarters = nextPlannedSubInfo.playersGoingOn;
      DEFAULT_FORMATION_IDS.forEach((posId, idx) => { if (outfieldStarters[idx]) initialPitchPositions[posId] = outfieldStarters[idx].id; });
      setPitchPlayerPositions(initialPitchPositions);
      setAcknowledgedPlannedSubSlotIndex(0);
      setPlanDeviated(false);
    }
    if (currentHalf === 2) {
      const startTimes = {};
      const accum = { ...half2PlayerAccumulated };
      activePlayers.forEach(p => {
        if (p.status === 'Field' || p.status === 'Goalie') {
          startTimes[p.playerId] = { status: p.status, start: timerSeconds };
          if (!accum[p.playerId]) accum[p.playerId] = { outfield: 0, goalie: 0 };
        }
      });
      setHalf2PlayerStartTimes(startTimes);
      setHalf2PlayerAccumulated(accum);
    }
    setHalfStartTime(Date.now());
    setElapsedOnPause(0);
    setIsTimerRunning(true);
    setGamePhase(currentHalf === 1 ? 'Half1Playing' : 'Half2Playing');
  };

  const togglePlayerFieldStatus = (playerId, newStatusOverride = null) => {
    const playerToToggle = activePlayers.find(p => p.playerId === playerId);
    if (!playerToToggle || playerToToggle.status === 'Goalie') return false;
    const currentFieldPlayersCount = activePlayers.filter(p => p.status === 'Field').length;
    let newStatus = newStatusOverride;
    if (!newStatus) newStatus = playerToToggle.status === 'Bench' ? 'Field' : 'Bench';
    if (newStatus === 'Field' && playerToToggle.status === 'Bench') {
      if (currentFieldPlayersCount >= OUTFIELD_PLAYERS_ON_FIELD && !Object.values(pitchPlayerPositions).includes(playerId)) {
        setModalMessage(`Max ${OUTFIELD_PLAYERS_ON_FIELD} outfield players.`);
        setShowModal(true);
        return false;
      }
    }
    if (currentHalf === 2 && gamePhase === 'Half2Playing') {
      if (playerToToggle.status === 'Field' && newStatus === 'Bench') {
        const info = half2PlayerStartTimes[playerId];
        if (info) {
          const delta = timerSeconds - info.start;
          const prev = half2PlayerAccumulated[playerId] || { outfield: 0, goalie: 0 };
          const updated = { outfield: prev.outfield + (info.status === 'Field' ? delta : 0), goalie: prev.goalie + (info.status === 'Goalie' ? delta : 0) };
          setHalf2PlayerAccumulated(prevAccum => ({ ...prevAccum, [playerId]: updated }));
          setHalf2PlayerStartTimes(prevStart => { const ns = { ...prevStart }; delete ns[playerId]; return ns; });
        }
      } else if (playerToToggle.status === 'Bench' && newStatus === 'Field') {
        setHalf2PlayerStartTimes(prev => ({ ...prev, [playerId]: { status: 'Field', start: timerSeconds } }));
        setHalf2PlayerAccumulated(prev => ({ ...prev, [playerId]: prev[playerId] || { outfield: 0, goalie: 0 } }));
      }
    }
    setActivePlayers(prevActive => prevActive.map(p => p.playerId === playerId ? { ...p, status: newStatus } : p));
    if (newStatus === 'Bench') { setPitchPlayerPositions(prev => { const newPos = { ...prev }; Object.keys(newPos).forEach(posId => { if (newPos[posId] === playerId) delete newPos[posId]; }); return newPos; }); }
    setPlanDeviated(true);
    return true;
  };

  const executePlannedSubstitution = () => {
    if (!nextPlannedSubInfo.isApplicable || nextPlannedSubInfo.slotIndex === -1) { setModalMessage("No specific planned substitution to execute now."); setShowModal(true); return; }
    const targetSlotForExecution = nextPlannedSubInfo.slotIndex;
    let newActive = [...activePlayers];
    let newPitchPos = { ...pitchPlayerPositions };
    let updatedStart = half2PlayerStartTimes;
    let updatedAccum = half2PlayerAccumulated;
    if (nextPlannedSubInfo.isInitialLineup) {
      setModalMessage("Starting lineup confirmed.");
      setShowModal(true);
      newPitchPos = {};
      const outfieldStarters = nextPlannedSubInfo.playersGoingOn;
      DEFAULT_FORMATION_IDS.forEach((posId, idx) => { if (outfieldStarters[idx]) newPitchPos[posId] = outfieldStarters[idx].id; });
    } else {
      if (currentHalf === 2 && gamePhase === 'Half2Playing') { updatedStart = { ...half2PlayerStartTimes }; updatedAccum = { ...half2PlayerAccumulated }; }
      nextPlannedSubInfo.playersComingOff.forEach(pOff => {
        newActive = newActive.map(p => p.playerId === pOff.id ? { ...p, status: 'Bench' } : p);
        Object.keys(newPitchPos).forEach(posId => { if (newPitchPos[posId] === pOff.id) delete newPitchPos[posId]; });
        if (currentHalf === 2 && gamePhase === 'Half2Playing') {
          const info = updatedStart[pOff.id];
          if (info) {
            const delta = timerSeconds - info.start;
            const prev = updatedAccum[pOff.id] || { outfield: 0, goalie: 0 };
            updatedAccum[pOff.id] = { outfield: prev.outfield + (info.status === 'Field' ? delta : 0), goalie: prev.goalie + (info.status === 'Goalie' ? delta : 0) };
            delete updatedStart[pOff.id];
          }
        }
      });
      nextPlannedSubInfo.playersGoingOn.forEach(pOn => {
        newActive = newActive.map(p => p.playerId === pOn.id ? { ...p, status: 'Field' } : p);
        for (const pos of PITCH_POSITIONS) {
          if (!Object.values(newPitchPos).includes(pOn.id) && !newPitchPos[pos.id]) { newPitchPos[pos.id] = pOn.id; break; }
        }
        if (currentHalf === 2 && gamePhase === 'Half2Playing') { updatedStart[pOn.id] = { status: 'Field', start: timerSeconds }; if (!updatedAccum[pOn.id]) updatedAccum[pOn.id] = { outfield: 0, goalie: 0 }; }
      });
      if (currentHalf === 2 && gamePhase === 'Half2Playing') { setHalf2PlayerStartTimes(updatedStart); setHalf2PlayerAccumulated(updatedAccum); }
      setActivePlayers(newActive);
    }
    setPitchPlayerPositions(newPitchPos);
    setPlanDeviated(false);
    setAcknowledgedPlannedSubSlotIndex(targetSlotForExecution);
  };

  const proceedToSecondHalf = () => {
    const h1FinalStats = {};
    players.forEach(player => {
      const activeP = activePlayers.find(ap => ap.playerId === player.id);
      const timePlayed = isTimerRunning ? Math.round((Date.now() - halfStartTime) / 1000) + elapsedOnPause : elapsedOnPause;
      h1FinalStats[player.id] = { name: player.name, number: player.number, outfield: (activeP && activeP.status === 'Field') ? timePlayed : 0, goalie: (activeP && activeP.status === 'Goalie') ? timePlayed : 0 };
    });
    setPlayerStats(h1FinalStats);
    setTimerSeconds(0);
    setElapsedOnPause(0);
    if (designatedGoalie1Id && !designatedGoalie2Id && !goalieForHalf2) { setModalMessage("Please select goalie for 2nd half."); setShowModal(true); return; }
    if (goalieForHalf2) generateFullGamePlan(players);
    setGamePhase('PreHalf2');
  };

  const finishGame = () => {
    const finalAccum = { ...half2PlayerAccumulated };
    Object.keys(half2PlayerStartTimes).forEach(pid => {
      const info = half2PlayerStartTimes[pid];
      const delta = timerSeconds - info.start;
      const prev = finalAccum[pid] || { outfield: 0, goalie: 0 };
      finalAccum[pid] = { outfield: prev.outfield + (info.status === 'Field' ? delta : 0), goalie: prev.goalie + (info.status === 'Goalie' ? delta : 0) };
    });
    const finalCumulativeStats = {};
    players.forEach(player => {
      const h1PlayerStats = playerStats[player.id] || { name: player.name, number: player.number, outfield: 0, goalie: 0 };
      const h2Stats = finalAccum[player.id] || { outfield: 0, goalie: 0 };
      finalCumulativeStats[player.id] = { name: player.name, number: player.number, outfield: h1PlayerStats.outfield + h2Stats.outfield, goalie: h1PlayerStats.goalie + h2Stats.goalie };
    });
    setPlayerStats(finalCumulativeStats);
    setGamePhase('FullTime');
    setIsTimerRunning(false);
  };

  const resetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSetupMode(null);
    setGamePhase('Setup');
    setPlayers([]);
    setDesignatedGoalie1Id(null);
    setDesignatedGoalie2Id(null);
    setGoalieForHalf1(null);
    setGoalieForHalf2(null);
    setCurrentHalf(1);
    setTimerSeconds(0);
    setElapsedOnPause(0);
    setIsTimerRunning(false);
    setActivePlayers([]);
    setPlayerStats({});
    setSubstitutionPlan(null);
    setShowPlanTable(false);
    setPlanDeviated(false);
    setNextPlannedSubInfo({ isApplicable: false, playersComingOff: [], playersGoingOn: [], timeString: '', slotIndex: -1, isInitialLineup: false });
    setAcknowledgedPlannedSubSlotIndex(-1);
    setShowPitchView(false);
    setPitchPlayerPositions({});
    setAvailableDefaultPlayers(DEFAULT_ROSTER.map(p => ({ ...p, isPlayingToday: true, originalId: p.id })));
    setHalf2PlayerStartTimes({});
    setHalf2PlayerAccumulated({});
  };

  const downloadMatchData = () => {
    const dataStr = JSON.stringify({ players, playerStats, substitutionPlan }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'match-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTimeAdjustment = (secondsAdjustment) => { if(isTimerRunning) { setHalfStartTime(prev => prev - (secondsAdjustment * 1000)); } else { const newElapsed = Math.max(0, Math.min(HALF_DURATION_SECONDS, elapsedOnPause + secondsAdjustment)); setElapsedOnPause(newElapsed); setTimerSeconds(newElapsed); } };

  const renderPlayerCard = (player) => {
    let timeThisHalf = 0;
    if(isTimerRunning && (player.status === 'Field' || player.status === 'Goalie')) {
      timeThisHalf = Math.round((Date.now() - halfStartTime) / 1000) + elapsedOnPause;
    } else if (!isTimerRunning && (player.status === 'Field' || player.status === 'Goalie')) {
      timeThisHalf = elapsedOnPause;
    }
    const outfieldTimeThisHalf = player.status === 'Field' ? timeThisHalf : 0;
    const goalieTimeThisHalf = player.status === 'Goalie' ? timeThisHalf : 0;
    let displayTotalOutfieldTime = 0;
    if (gamePhase === 'FullTime') { displayTotalOutfieldTime = playerStats[player.playerId]?.outfield || 0; }
    else if (currentHalf === 1) { displayTotalOutfieldTime = outfieldTimeThisHalf; }
    else { displayTotalOutfieldTime = (playerStats[player.playerId]?.outfield || 0) + outfieldTimeThisHalf; }
    let displayTotalGoalieTime = 0;
    if (gamePhase === 'FullTime') { displayTotalGoalieTime = playerStats[player.playerId]?.goalie || 0; }
    else if (currentHalf === 1 && player.status === 'Goalie') { displayTotalGoalieTime = goalieTimeThisHalf; }
    else if (currentHalf === 2) { displayTotalGoalieTime = (playerStats[player.playerId]?.goalie || 0) + goalieTimeThisHalf; }
    return (
      <div key={player.playerId} className={`p-3 rounded-lg shadow mb-2 ${player.status === 'Field' ? 'bg-green-600' : player.status === 'Bench' ? 'bg-gray-600' : 'bg-yellow-500 text-black'}`}>
        <h4 className="font-semibold">{player.name} (#{player.number || 'N/A'}) - {player.status}</h4>
        {player.status !== 'Goalie' && (<>
          <p className="text-sm">Outfield (This Half): {formatTime(outfieldTimeThisHalf)}</p>
          {(currentHalf === 2 || gamePhase === 'FullTime') && <p className="text-xs text-gray-200">Outfield (Total Game): {formatTime(displayTotalOutfieldTime)}</p>}
        </>)}
        {player.status === 'Goalie' && (<>
          <p className="text-sm">Goalie (This Half): {formatTime(goalieTimeThisHalf)}</p>
          {(currentHalf === 2 || gamePhase === 'FullTime') && <p className="text-xs text-gray-200">Goalie (Total Game): {formatTime(displayTotalGoalieTime)}</p>}
        </>)}
        {(gamePhase.includes('Playing') || gamePhase.includes('Pre')) && player.status !== 'Goalie' && !showPitchView && (
          <button onClick={() => togglePlayerFieldStatus(player.playerId)} className={`mt-2 w-full text-xs py-1 px-2 rounded ${player.status === 'Field' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>
            {player.status === 'Field' ? 'Move to Bench' : 'Move to Field'}
          </button>
        )}
      </div>
    );
  };

  const SubstitutionPlanTable = window.Components.SubstitutionPlanTable;
  const SoccerPitchView = window.Components.SoccerPitchView;

  const renderSetup = () => { /* Keep as in original with handlers */
    return (
      <div className="p-4 md:p-6 space-y-6 bg-gray-800 text-white rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center text-teal-400">Game Setup</h2>
        {!setupMode ? (
          <div className="flex flex-col space-y-3">
            <button onClick={() => handleSetupModeSelect('defaultRoster')} className="py-3 px-4 bg-sky-600 hover:bg-sky-700 rounded-lg">Load & Select from Default Roster</button>
            <button onClick={() => handleSetupModeSelect('manual')} className="py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg">Manually Enter Players</button>
          </div>
        ) : (
          <>
            {setupMode === 'defaultRoster' && (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-teal-300">Select Players for Today's Game:</h3>
                {availableDefaultPlayers.map(p => (
                  <div key={p.originalId} className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                    <div className="flex items-center">
                      <input type="checkbox" id={`check-${p.originalId}`} checked={p.isPlayingToday} onChange={() => handleDefaultPlayerToggle(p.originalId)} className="mr-3 h-5 w-5 text-teal-500 border-gray-500 rounded focus:ring-teal-400"/>
                      <input type="text" value={p.name} onChange={(e) => handleDefaultPlayerDetailChange(p.originalId, 'name', e.target.value)} className="p-1 bg-gray-600 border border-gray-500 rounded-md w-32 mr-2"/>
                      <input type="text" value={p.number} onChange={(e) => handleDefaultPlayerDetailChange(p.originalId, 'number', e.target.value)} placeholder="Num" className="p-1 bg-gray-600 border border-gray-500 rounded-md w-16"/>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${p.isPlayingToday ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>{p.isPlayingToday ? 'Playing' : 'Not Playing'}</span>
                  </div>
                ))}
              </div>
            )}
            {setupMode === 'manual' && (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-teal-300">Enter Player Details:</h3>
                {players.map((p, index) => (
                  <div key={p.id} className="flex items-center p-3 bg-gray-700 rounded-md">
                    <input type="text" value={p.name} onChange={(e) => handleManualPlayerDetailChange(p.id, 'name', e.target.value)} placeholder={`Player ${index+1} Name`} className="p-2 bg-gray-600 border border-gray-500 rounded-md flex-grow mr-2"/>
                    <input type="text" value={p.number} onChange={(e) => handleManualPlayerDetailChange(p.id, 'number', e.target.value)} placeholder="Num" className="p-2 bg-gray-600 border border-gray-500 rounded-md w-20 mr-2"/>
                    <button onClick={() => removeManualPlayer(p.id)} className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-xs">Remove</button>
                  </div>
                ))}
                {players.length < 20 && <button onClick={addManualPlayer} className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">+ Add Player</button>}
              </div>
            )}
            <div className="mt-4 space-y-3">
              <h3 className="text-xl font-semibold text-teal-300">Designate Goalie(s) for the Day:</h3>
              <p className="text-xs text-gray-400">Select up to two. They play one half GK, one half outfield.</p>
              {(setupMode === 'defaultRoster' ? availableDefaultPlayers.filter(p=>p.isPlayingToday) : players).map(p => (
                <div key={`dg-${p.id}`} className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
                  <span>{p.name} (#{p.number || 'N/A'})</span>
                  <button onClick={() => { const finalPlayerId = p.id; if (designatedGoalie1Id === finalPlayerId) setDesignatedGoalie1Id(null); else if (designatedGoalie2Id === finalPlayerId) setDesignatedGoalie2Id(null); else if (!designatedGoalie1Id) setDesignatedGoalie1Id(finalPlayerId); else if (!designatedGoalie2Id) setDesignatedGoalie2Id(finalPlayerId); else { setModalMessage("Max two DGs."); setShowModal(true); } }} className={`px-3 py-1 rounded-md text-xs ${(designatedGoalie1Id === p.id || designatedGoalie2Id === p.id) ? 'bg-teal-500' : 'bg-gray-500'}`}>{(designatedGoalie1Id === p.id || designatedGoalie2Id === p.id) ? 'Designated Goalie' : 'Set as DG'}</button>
                </div>
              ))}
            </div>
            <button onClick={finalizeSetup} className="w-full mt-6 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md">Finalize Player List & Proceed</button>
            <button onClick={() => setSetupMode(null)} className="w-full mt-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm">Back to Setup Mode Choice</button>
          </>
        )}
      </div>
    );
  };

  const renderLineupSelector = () => {
    if (!showLineupSelector) return null;
    const allPlayers = players;
    const goalieId = pendingStartingLineup.goalieId;
    const outfieldIds = pendingStartingLineup.outfieldIds;
    const maxOutfield = OUTFIELD_PLAYERS_ON_FIELD;
    const handleGoalieChange = (e) => {
      setPendingStartingLineup(prev => ({ ...prev, goalieId: e.target.value }));
      setPendingStartingLineup(prev => ({ ...prev, outfieldIds: prev.outfieldIds.filter(id => id !== e.target.value) }));
    };
    const handleOutfieldToggle = (id) => {
      setPendingStartingLineup(prev => {
        let newOutfield = prev.outfieldIds.includes(id)
          ? prev.outfieldIds.filter(pid => pid !== id)
          : prev.outfieldIds.length < maxOutfield && id !== prev.goalieId
            ? [...prev.outfieldIds, id]
            : prev.outfieldIds;
        return { ...prev, outfieldIds: newOutfield };
      });
    };
    const canConfirm = goalieId && outfieldIds.length === maxOutfield;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-700 p-6 rounded-lg shadow-xl text-white max-w-md w-full">
          <h3 className="text-2xl font-bold mb-4 text-teal-300">Set Starting Lineup</h3>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Goalie:</label>
            <select value={goalieId || ''} onChange={handleGoalieChange} className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md">
              <option value="">-- Select Goalie --</option>
              {allPlayers.map(p => (<option key={p.id} value={p.id}>{p.name} (#{p.number || 'N/A'})</option>))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Outfield Players ({outfieldIds.length}/{maxOutfield}):</label>
            <div className="grid grid-cols-2 gap-2">
              {allPlayers.filter(p => p.id !== goalieId).map(p => (
                <label key={p.id} className={`flex items-center p-2 rounded-md cursor-pointer ${outfieldIds.includes(p.id) ? 'bg-green-600' : 'bg-gray-600'}`}>
                  <input type="checkbox" checked={outfieldIds.includes(p.id)} onChange={() => handleOutfieldToggle(p.id)} className="mr-2" disabled={!outfieldIds.includes(p.id) && outfieldIds.length >= maxOutfield} />
                  {p.name} (#{p.number || 'N/A'})
                </label>
              ))}
            </div>
          </div>
          <button onClick={handleConfirmStartingLineup} disabled={!canConfirm} className={`w-full py-2 mt-2 rounded-lg font-semibold ${canConfirm ? 'bg-teal-500 hover:bg-teal-600' : 'bg-gray-500 cursor-not-allowed'}`}>Confirm Starting Lineup</button>
        </div>
      </div>
    );
  };

  const renderNextPlannedSub = () => {
    if (!nextPlannedSubInfo.isApplicable || !(gamePhase.includes("Playing") || gamePhase.includes("PreHalf"))) return null;
    const titleText = nextPlannedSubInfo.isInitialLineup ? `Planned Starting Lineup at ~${nextPlannedSubInfo.timeString}` : `Next Planned Sub at ~${nextPlannedSubInfo.timeString}`;
    const buttonText = nextPlannedSubInfo.isInitialLineup ? "Confirm Starting Lineup" : "Execute This Planned Substitution";
    const goalieForDisplay = currentHalf === 1 ? goalieForHalf1 : goalieForHalf2;
    return (
      <div className="my-4 p-4 bg-gray-700 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-center text-cyan-400 mb-2">{titleText}{nextPlannedSubInfo.slotIndex !== -1 && !nextPlannedSubInfo.isInitialLineup && ` (Slot ${nextPlannedSubInfo.slotIndex + 1})`}</h4>
        {planDeviated && <p className="text-center text-xs text-yellow-400 mb-2">(Plan deviated. Planned subs are based on original plan.)</p>}
        { goalieForDisplay && nextPlannedSubInfo.isInitialLineup && <p className="text-center text-sm text-yellow-300 mb-1">Goalie: {goalieForDisplay.name} (#{goalieForDisplay.number || 'N/A'})</p> }
        {(nextPlannedSubInfo.playersComingOff.length === 0 && nextPlannedSubInfo.playersGoingOn.length === 0 && !nextPlannedSubInfo.isInitialLineup) ? (
          <p className="text-center text-gray-400">No changes or current lineup matches next phase of plan.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {nextPlannedSubInfo.playersComingOff.length > 0 && (
                <div>
                  <p className="font-medium text-red-400">Coming OFF (Outfield):</p>
                  <ul className="list-disc list-inside ml-1 text-sm">{nextPlannedSubInfo.playersComingOff.map(p => <li key={`off-${p.id}`}>{p.name} (#{p.number || 'N/A'})</li>)}</ul>
                </div>
              )}
              {nextPlannedSubInfo.playersGoingOn.length > 0 && (
                <div>
                  <p className="font-medium text-green-400">Going ON (Outfield):</p>
                  <ul className="list-disc list-inside ml-1 text-sm">{nextPlannedSubInfo.playersGoingOn.map(p => <li key={`on-${p.id}`}>{p.name} (#{p.number || 'N/A'})</li>)}</ul>
                </div>
              )}
            </div>
            <button onClick={executePlannedSubstitution} className="mt-3 w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md text-sm">{buttonText}</button>
          </>
        )}
      </div>
    );
  };

  const renderGameScreen = () => {
    const currentGoalie = activePlayers.find(p => p.status === 'Goalie');
    const onFieldPlayers = activePlayers.filter(p => p.status === 'Field');
    const onBenchPlayers = activePlayers.filter(p => p.status === 'Bench' && p.playerId !== currentGoalie?.playerId);
    const dg1 = players.find(p => p.id === designatedGoalie1Id);
    const dg2 = players.find(p => p.id === designatedGoalie2Id);
    const nonGoaliePlayingOutfieldCount = players.length - (dg1 && dg2 ? 2 : dg1 || dg2 ? 1 : 0);
    return (
      <div className="p-4 md:p-6 space-y-4 bg-gray-800 text-white rounded-lg shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-teal-400">{currentHalf === 1 ? 'First Half' : 'Second Half'}{gamePhase.includes('Pre') && ' - Lineup'}</h2>
          <p className="text-5xl font-mono my-3 text-yellow-400">{formatTime(timerSeconds)}</p>
          {gamePhase.includes('Playing') && isTimerRunning && substitutionPlan?.totalPlayerSlotCounts && players.length > 0 && (
            <p className="text-sm text-gray-400">Approx Target Outfield Slots: {nonGoaliePlayingOutfieldCount > 0 ? Math.round(Object.values(substitutionPlan.totalPlayerSlotCounts).filter(stat => !((dg1 && stat.name === dg1.name) || (dg2 && stat.name === dg2.name))).reduce((sum, p) => sum + p.ON, 0) / nonGoaliePlayingOutfieldCount) : 'N/A'}</p>
          )}
        </div>
        <div className="flex justify-center space-x-2 my-2">
          <button onClick={() => handleTimeAdjustment(-60)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs">Rewind 1m</button>
          <button onClick={() => handleTimeAdjustment(60)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs">FFwd 1m</button>
          <button onClick={() => handleTimeAdjustment(300)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs">FFwd 5m</button>
        </div>
        {gamePhase === 'PreHalf1' && !isTimerRunning && (
          <button onClick={handleGeneratePepTalk} disabled={geminiIsLoading} className="w-full mb-2 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50">{geminiIsLoading ? 'Generating...' : '✨ Generate Pep Talk ✨'}</button>
        )}
        {!isTimerRunning && (gamePhase === 'PreHalf1' || gamePhase === 'PreHalf2') && (
          <button onClick={startGameHalf} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md">Start {currentHalf === 1 ? 'First Half' : 'Second Half'}</button>
        )}
        {isTimerRunning && (
          <button onClick={handlePause} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md">Pause Timer</button>
        )}
        {!isTimerRunning && (gamePhase.includes("Playing")) && (
          <button onClick={handleResume} className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md mt-2">Resume Timer</button>
        )}
        {renderNextPlannedSub()}
        {(gamePhase.includes("PreHalf") || gamePhase.includes("Playing")) && (
          <button onClick={() => setShowPitchView(!showPitchView)} className="mt-3 w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg">{showPitchView ? 'Hide Pitch View' : 'Show Pitch View'}</button>
        )}
        {substitutionPlan && (gamePhase.includes('Pre') || gamePhase.includes('Playing')) && (
          <button onClick={() => setShowPlanTable(!showPlanTable)} className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">{showPlanTable ? 'Hide' : 'Show'} Substitution Plan</button>
        )}
        {showPlanTable && substitutionPlan && <SubstitutionPlanTable plan={substitutionPlan} playersList={players} />}
        {showPitchView && (gamePhase.includes("PreHalf") || gamePhase.includes("Playing")) ? (
          <SoccerPitchView activePlayers={activePlayers} onPlayerMove={togglePlayerFieldStatus} goalie={currentGoalie} pitchPlayerPositions={pitchPlayerPositions} setPitchPlayerPositions={setPitchPlayerPositions} pitchDisplayMode={pitchDisplayMode} setPitchDisplayMode={setPitchDisplayMode} setShowModal={setShowModal} setModalTitle={setModalTitle} setModalMessage={setModalMessage} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-yellow-300">Goalie</h3>
              {currentGoalie ? renderPlayerCard(currentGoalie) : <p className="text-gray-400">N/A</p>}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-green-300">On Field ({onFieldPlayers.length}/{OUTFIELD_PLAYERS_ON_FIELD})</h3>
              {onFieldPlayers.map(renderPlayerCard)}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-300">Bench</h3>
              {onBenchPlayers.map(renderPlayerCard)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHalfTime = () => {
    const dg1 = players.find(p => p.id === designatedGoalie1Id);
    const dg2 = players.find(p => p.id === designatedGoalie2Id);
    return (
      <div className="p-6 space-y-6 bg-gray-800 text-white rounded-lg shadow-xl text-center">
        <h2 className="text-3xl font-bold text-teal-400">Half Time!</h2>
        <p className="text-xl">First half completed.</p>
        {goalieForHalf1 && dg1 && goalieForHalf1.id === dg1.id && dg2 && (<p className="text-md text-gray-300">{dg1.name} was goalie. {dg2.name} will be goalie for 2nd half.</p>)}
        {goalieForHalf1 && dg1 && goalieForHalf1.id === dg1.id && !dg2 && (<p className="text-md text-gray-300">{dg1.name} played goalie and will be outfield. <span className="font-bold text-yellow-300">Select 2nd half goalie.</span></p>)}
        <button onClick={handleGenerateHalftimeMessage} disabled={geminiIsLoading} className="w-full max-w-xs mx-auto mt-2 mb-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50">{geminiIsLoading ? 'Generating...' : '✨ Generate Halftime Message ✨'}</button>
        {dg1 && !dg2 && (
          <div className="my-4 p-3 bg-gray-700 rounded-md">
            <label htmlFor="h2GoalieSelect" className="block text-sm font-medium text-yellow-300 mb-1">Select Goalie for 2nd Half:</label>
            <select id="h2GoalieSelect" onChange={(e) => setGoalieForHalf2(players.find(p => p.id === e.target.value) || null)} value={goalieForHalf2?.id || ""} className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-teal-500 focus:border-teal-500">
              <option value="">-- Select --</option>
              {players.filter(p => p.id !== dg1.id).map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          </div>
        )}
        <button onClick={proceedToSecondHalf} disabled={dg1 && !dg2 && !goalieForHalf2} className="w-full max-w-xs mx-auto py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50">Set Up Second Half</button>
        {substitutionPlan && (<button onClick={() => setShowPlanTable(!showPlanTable)} className="mt-4 w-full max-w-xs mx-auto py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">{showPlanTable ? 'Hide' : 'Show'} Plan</button>)}
        {showPlanTable && substitutionPlan && <SubstitutionPlanTable plan={substitutionPlan} playersList={players} />}
        <button onClick={resetGame} className="w-full max-w-xs mx-auto mt-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md">Reset Game</button>
      </div>
    );
  };

  const renderFullTime = () => (
    <div className="p-6 space-y-6 bg-gray-800 text-white rounded-lg shadow-xl text-center">
      <h2 className="text-3xl font-bold text-teal-400">Full Time!</h2>
      <p className="text-xl mb-6">Match Ended.</p>
      <h3 className="text-2xl font-semibold mb-3 text-yellow-300">Player Stats (Actual Play Time):</h3>
      <div className="space-y-3 max-w-md mx-auto text-left">
        {Object.values(playerStats).sort((a,b) => a.name.localeCompare(b.name)).map(stats => (
          <div key={stats.name + stats.number} className="p-3 bg-gray-700 rounded-md shadow">
            <p className="font-semibold text-lg">{stats.name} (#{stats.number || 'N/A'})</p>
            <p className="text-sm text-gray-300">Outfield: {formatTime(stats.outfield)}</p>
            <p className="text-sm text-gray-300">Goalie: {formatTime(stats.goalie)}</p>
          </div>
        ))}
      </div>
      {substitutionPlan && (<button onClick={() => setShowPlanTable(!showPlanTable)} className="mt-6 w-full max-w-xs mx-auto py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">{showPlanTable ? 'Hide' : 'Show'} Final Plan</button>)}
      {showPlanTable && substitutionPlan && <SubstitutionPlanTable plan={substitutionPlan} playersList={players} />}
      <button onClick={downloadMatchData} className="w-full max-w-xs mx-auto mt-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Download Match Data</button>
      <button onClick={resetGame} className="w-full max-w-xs mx-auto mt-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md">Start New Game</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl">
        <header className="mb-8 text-center"><h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Soccer Substitution Tracker</h1></header>
        {gamePhase === 'Setup' && renderSetup()}
        {renderLineupSelector()}
        {(gamePhase === 'PreHalf1' || gamePhase === 'Half1Playing') && renderGameScreen()}
        {gamePhase === 'HalfTime' && renderHalfTime()}
        {(gamePhase === 'PreHalf2' || gamePhase === 'Half2Playing') && renderGameScreen()}
        {gamePhase === 'FullTime' && renderFullTime()}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-700 p-6 rounded-lg shadow-xl text-white max-w-sm w-full">
              <h3 className="text-xl font-semibold mb-4 text-yellow-400">{modalTitle}</h3>
              <p className="mb-6 whitespace-pre-wrap">{modalMessage}</p>
              <button onClick={() => {setShowModal(false); setModalTitle("Notification");}} className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 rounded-md font-medium">OK</button>
            </div>
          </div>
        )}
      </div>
      <footer className="mt-12 text-center text-xs text-gray-500"><p>&copy; {new Date().getFullYear()} Soccer Substitution Tracker. Plan, Play, and Pep Talk!</p></footer>
    </div>
  );
}

window.AppRoot = { App };


