// Depends on React, window.AppConstants

function SubstitutionPlanTable({ plan, playersList }) {
  const { HALF_DURATION_SECONDS, SLOT_DURATION_MINUTES, SLOT_DURATION_SECONDS } = window.AppConstants;
  if (!plan || !plan.half1 || !plan.half2 || !plan.totalPlayerSlotCounts) return <p className="text-center text-orange-400 mt-4">Substitution plan not fully generated or available.</p>;
  const numSlotsPerHalf = Math.floor(HALF_DURATION_SECONDS / SLOT_DURATION_SECONDS);
  const headerSlots = Array.from({length: numSlotsPerHalf * 2}, (_, i) => `${String(i*SLOT_DURATION_MINUTES).padStart(2,'0')}-${String((i+1)*SLOT_DURATION_MINUTES).padStart(2,'0')}'`);
  return (
    <div className="mt-6 overflow-x-auto">
      <h3 className="text-2xl font-semibold text-center text-teal-300 mb-3">Suggested Substitution Plan</h3>
      <table className="min-w-full text-sm text-left text-gray-300 bg-gray-700 rounded-md">
        <thead className="bg-gray-600">
          <tr>
            <th className="px-3 py-2">Player</th>
            {headerSlots.map(s=> <th key={s} className="px-2 py-2 text-center">{s}</th>)}
            <th className="px-3 py-2 text-center">ON</th>
            <th className="px-3 py-2 text-center">GK</th>
          </tr>
        </thead>
        <tbody>
          {playersList.map(player => {
            const stats = plan.totalPlayerSlotCounts[player.id] || { ON: 0, GK: 0, name: player.name, number: player.number };
            return (
              <tr key={player.id} className="border-b border-gray-600 hover:bg-gray-600/50">
                <td className="px-3 py-2 font-medium whitespace-nowrap">{stats.name} (#{stats.number || 'N/A'})</td>
                {plan.half1.map((slot, idx) => (
                  <td key={`h1s${idx}-${player.id}`} className={`px-2 py-2 text-center font-semibold ${slot.assignments[player.id]==='GK'?'bg-yellow-500 text-black':slot.assignments[player.id]==='ON'?'bg-green-700':'bg-gray-500'}`}>{slot.assignments[player.id]}</td>
                ))}
                {plan.half2.map((slot, idx) => (
                  <td key={`h2s${idx}-${player.id}`} className={`px-2 py-2 text-center font-semibold ${slot.assignments[player.id]==='GK'?'bg-yellow-500 text-black':slot.assignments[player.id]==='ON'?'bg-green-700':'bg-gray-500'}`}>{slot.assignments[player.id]}</td>
                ))}
                <td className="px-3 py-2 text-center">{stats.ON}</td>
                <td className="px-3 py-2 text-center">{stats.GK}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

window.Components = window.Components || {};
window.Components.SubstitutionPlanTable = SubstitutionPlanTable;


