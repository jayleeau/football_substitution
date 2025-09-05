// Depends on React, window.AppConstants

function SoccerPitchView({ activePlayers, onPlayerMove, goalie, pitchPlayerPositions, setPitchPlayerPositions, pitchDisplayMode, setPitchDisplayMode, setShowModal, setModalTitle, setModalMessage }) {
    const { OUTFIELD_PLAYERS_ON_FIELD, PITCH_POSITIONS } = window.AppConstants;
    const [draggedPlayer, setDraggedPlayer] = React.useState(null);

    const handleDragStart = (e, player, originalZone = 'bench', originalPositionId = null) => {
        if (player.status === 'Goalie') { e.preventDefault(); return; }
        setDraggedPlayer({ id: player.playerId, originalZone, originalPositionId });
        e.dataTransfer.setData("playerId", player.playerId);
        e.dataTransfer.effectAllowed = "move";
    };
    const handleDragOver = (e) => e.preventDefault();
    const handleDropOnPosition = (e, positionId) => {
        e.preventDefault(); e.stopPropagation();
        if (!draggedPlayer) return;
        const playerId = draggedPlayer.id;
        const playerToMove = activePlayers.find(p => p.playerId === playerId);
        if (!playerToMove || playerToMove.status === 'Goalie') return;
        const currentFieldPlayers = activePlayers.filter(p => p.status === 'Field');
        const isMovingToFieldFromBench = playerToMove.status === 'Bench';
        if (pitchPlayerPositions[positionId] === playerId) { setDraggedPlayer(null); return; }
        if (isMovingToFieldFromBench && currentFieldPlayers.length >= OUTFIELD_PLAYERS_ON_FIELD) {
            setModalTitle("Substitution Blocked");
            setModalMessage(`Cannot move ${playerToMove.name} to field. Field is full.`);
            setShowModal(true);
            setDraggedPlayer(null);
            return;
        }
        const occupantPlayerId = pitchPlayerPositions[positionId];
        const newPitchPositions = { ...pitchPlayerPositions };
        if (draggedPlayer.originalPositionId) delete newPitchPositions[draggedPlayer.originalPositionId];
        Object.keys(newPitchPositions).forEach(key => { if (newPitchPositions[key] === playerId) delete newPitchPositions[key]; });
        if (occupantPlayerId && occupantPlayerId !== playerId) {
            if (isMovingToFieldFromBench) {
                onPlayerMove(occupantPlayerId, 'Bench');
            } else {
                if (draggedPlayer.originalPositionId) { newPitchPositions[draggedPlayer.originalPositionId] = occupantPlayerId; }
            }
        }
        newPitchPositions[positionId] = playerId;
        setPitchPlayerPositions(newPitchPositions);
        if (playerToMove.status !== 'Field') { onPlayerMove(playerId, 'Field'); }
        setDraggedPlayer(null);
    };
    const handleDropOnPlayer = (e, targetPlayerId) => {
        e.preventDefault(); e.stopPropagation();
        if (!draggedPlayer) return;
        const draggedPlayerId = draggedPlayer.id;
        const draggedPlayerInfo = activePlayers.find(p => p.playerId === draggedPlayerId);
        const targetPlayerInfo = activePlayers.find(p => p.playerId === targetPlayerId);
        if (!draggedPlayerInfo || !targetPlayerInfo || draggedPlayerInfo.status === 'Goalie' || targetPlayerInfo.status === 'Goalie') { setDraggedPlayer(null); return; }
        if (draggedPlayerInfo.status === 'Field' && targetPlayerInfo.status === 'Field') {
            const targetPositionId = Object.keys(pitchPlayerPositions).find(key => pitchPlayerPositions[key] === targetPlayerId);
            const sourcePositionId = draggedPlayer.originalPositionId;
            if (targetPositionId && sourcePositionId) { setPitchPlayerPositions(prev => ({ ...prev, [targetPositionId]: draggedPlayerId, [sourcePositionId]: targetPlayerId, })); }
        } else if (draggedPlayerInfo.status === 'Bench' && targetPlayerInfo.status === 'Field') {
            const targetPosition = Object.keys(pitchPlayerPositions).find(key => pitchPlayerPositions[key] === targetPlayerId);
            onPlayerMove(targetPlayerId, 'Bench');
            onPlayerMove(draggedPlayerId, 'Field');
            if (targetPosition) { setPitchPlayerPositions(prev => { const newPos = {...prev}; delete newPos[targetPosition]; newPos[targetPosition] = draggedPlayerId; return newPos; }); }
        }
        setDraggedPlayer(null);
    };
    const handleDropOnBench = (e) => { e.preventDefault(); if (!draggedPlayer) return; const playerId = draggedPlayer.id; const playerToMove = activePlayers.find(p => p.playerId === playerId); if (!playerToMove || playerToMove.status !== 'Field') { setDraggedPlayer(null); return; } onPlayerMove(playerId, 'Bench'); setDraggedPlayer(null); };

    const fieldPlayersData = PITCH_POSITIONS.map(pos => { const playerId = pitchPlayerPositions[pos.id]; const player = activePlayers.find(p => p.playerId === playerId && p.status === 'Field'); return { ...pos, player }; });
    const benchPlayersData = activePlayers.filter(p => p.status === 'Bench');
    const unassignedFieldPlayers = activePlayers.filter(p => p.status === 'Field' && p.playerId !== goalie?.playerId && !Object.values(pitchPlayerPositions).includes(p.playerId));

    return (
        <div className="mt-4 p-2 bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-semibold text-pink-400">Interactive Pitch View</h3><button onClick={() => setPitchDisplayMode(prev => prev === 'name' ? 'number' : 'name')} className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-xs rounded-md">Toggle Name/Number</button></div>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow bg-green-700 border-4 border-green-400 rounded-md p-1 md:p-2 min-h-[400px] md:min-h-[500px] flex flex-col">
                    <div className="grid grid-cols-5 grid-rows-3 gap-1 md:gap-2 p-2 flex-grow">
                        {fieldPlayersData.map(({ id, name, player, gridArea }) => (
                            <div key={id} style={{ gridArea }} onDragOver={handleDragOver} onDrop={(e) => handleDropOnPosition(e, id)} className={`border border-dashed border-white/30 rounded-md flex items-center justify-center relative ${draggedPlayer && !player ? 'bg-green-600/50' : ''}`}>
                                <span className="absolute top-0 left-1 text-[8px] text-white/50">{name}</span>
                                {player && (
                                  <div draggable onDragStart={(e) => handleDragStart(e, player, 'position', id)} onDrop={(e) => handleDropOnPlayer(e, player.playerId)} className={`p-1 rounded-full w-14 h-14 md:w-16 md:h-16 flex flex-col items-center justify-center text-center text-[10px] md:text-xs cursor-grab shadow-md transition-all ${draggedPlayer?.id === player.playerId ? 'opacity-30 ring-2 ring-pink-400' : 'bg-blue-500 hover:bg-blue-400 text-white'}`}>
                                    <span>{pitchDisplayMode === 'name' ? player.name : player.number || 'N/A'}</span>
                                    <span className="text-[8px] opacity-70">({player.playerId === goalie?.playerId ? 'GK' : 'Field'})</span>
                                  </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center items-center p-2 border-t-2 border-white/30 mt-2">
                        {goalie && (<div className="bg-yellow-500 text-black p-1 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-[10px] md:text-xs text-center shadow-lg select-none">{pitchDisplayMode === 'name' ? goalie.name.substring(0,7) : goalie.number || 'GK'}<br/>(GK)</div>)}
                    </div>
                </div>
                <div className="md:w-1/3 bg-gray-600 border-2 border-gray-500 rounded-md p-3 min-h-[150px] md:min-h-[500px]" onDragOver={handleDragOver} onDrop={handleDropOnBench}>
                    <p className="text-center text-sm text-gray-300 mb-2">BENCH ({benchPlayersData.length + unassignedFieldPlayers.length})</p>
                    <div className="space-y-1">
                        {unassignedFieldPlayers.map(player => (
                          <div key={`unassigned-${player.playerId}`} draggable onDragStart={(e) => handleDragStart(e, player, 'field', null)} className={`p-1.5 rounded-md text-center text-[10px] md:text-xs cursor-grab shadow-md transition-all ${draggedPlayer?.id === player.playerId ? 'opacity-30 ring-2 ring-pink-400' : 'bg-sky-400 hover:bg-sky-300 text-black'}`}>{pitchDisplayMode === 'name' ? player.name : player.number || 'N/A'} (Field - Unplaced)</div>
                        ))}
                        {benchPlayersData.map(player => (
                          <div key={player.playerId} draggable onDragStart={(e) => handleDragStart(e, player, 'bench', null)} className={`p-1.5 rounded-md text-center text-[10px] md:text-xs cursor-grab shadow-md transition-all ${draggedPlayer?.id === player.playerId ? 'opacity-30 ring-2 ring-pink-400' : 'bg-gray-400 hover:bg-gray-300 text-black'}`}>{pitchDisplayMode === 'name' ? player.name : player.number || 'N/A'}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

window.Components = window.Components || {};
window.Components.SoccerPitchView = SoccerPitchView;


