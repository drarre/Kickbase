const getPlayersToSell = (players, balance, excludedPlayers) => {
    // Filter out the excluded players
    const filteredPlayers = players.filter(player => !excludedPlayers.includes(player.i));

    // Group players by position
    const goalkeepers = filteredPlayers.filter(player => player.pos === 1);
    const defenders = filteredPlayers.filter(player => player.pos === 2);
    const nonDefendersAndGoalkeepers = filteredPlayers.filter(player => player.pos !== 1 && player.pos !== 2);

    // Sort players by market value (descending order)
    const sortedPlayers = [...nonDefendersAndGoalkeepers].sort((a, b) => b.mv - a.mv);

    // Function to check if the remaining squad meets the constraints
    const isValidSquad = (remainingPlayers) => {
        const remainingGoalkeepers = remainingPlayers.filter(player => player.pos === 1);
        const remainingDefenders = remainingPlayers.filter(player => player.pos === 2);
        return remainingPlayers.length >= 11 && remainingGoalkeepers.length >= 1 && remainingDefenders.length >= 3;
    };

    let validCombinations = [];

    // Use a more efficient approach to generate combinations
    const generateCombinations = (arr, r) => {
        const result = [];
        const combination = (start, chosen) => {
            if (chosen.length === r) {
                result.push(chosen);
                return;
            }
            for (let i = start; i < arr.length; i++) {
                combination(i + 1, [...chosen, arr[i]]);
            }
        };
        combination(0, []);
        return result;
    };

    // Try combinations of players to sell, from 1 to max possible players
    for (let r = 1; r <= sortedPlayers.length; r++) {
        const combinations = generateCombinations(sortedPlayers, r);
        for (const combo of combinations) {
            const totalMarketValue = combo.reduce((total, player) => total + player.mv, 0);

            // Only consider combinations that meet the balance condition
            if (totalMarketValue >= -balance) {
                // Get the remaining players after selling the selected combo
                const remainingPlayers = filteredPlayers.filter(player => !combo.includes(player));

                // Check if the remaining squad is valid (at least 1 goalkeeper, 3 defenders, and 11 players)
                if (isValidSquad(remainingPlayers)) {
                    validCombinations.push({ combo, totalMarketValue });
                }
            }
        }
    }

    // Sort the valid combinations by total market value and get the top 5 closest to the required balance
    validCombinations = validCombinations.sort((a, b) => a.totalMarketValue - b.totalMarketValue).slice(0, 5);

    return { playersToSell: validCombinations };
};

module.exports = { getPlayersToSell };