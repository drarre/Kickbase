const getPlayersToSell = (players, balance, excludedPlayers, excludeStartingEleven) => {
    const target = -balance;

    // Step 1: Exclude starting eleven and user-specified players
    const validPlayers = players.filter(player => {
        if (excludeStartingEleven && typeof player.lo === 'number') {
            return false; // Exclude players in the starting eleven
        }
        if (excludedPlayers.includes(player.i)) {
            return false; // Exclude user-specified players
        }
        return true;
    });

    // Group 500k players separately
    const players500k = validPlayers.filter(player => player.mv === 500000);
    const otherPlayers = validPlayers.filter(player => player.mv !== 500000);
    const max500kCount = players500k.length;

    // Step 2: Validate squad constraints
    const isValidSquad = (remainingPlayers) => {
        const goalkeepers = remainingPlayers.filter(player => player.pos === 1).length;
        const defenders = remainingPlayers.filter(player => player.pos === 2).length;
        return remainingPlayers.length >= 11 && goalkeepers >= 1 && defenders >= 3;
    };

    // Check if the total market value is already insufficient
    const totalMarketValue = otherPlayers.reduce((sum, player) => sum + player.mv, 0) + (max500kCount * 500000);
    if (totalMarketValue < target) {
        return {
            error: 'Excluded too many players. The total market value of remaining players is insufficient.',
        };
    }

    // Step 3: Find valid combinations
    const validCombinations = new Map(); // Use a Map to track unique combinations by IDs
    const findCombination = (index, currentCombo, currentSum, current500kCount) => {
        // Dynamically filter remaining players
        const filteredRemainingPlayers = validPlayers.filter(player => !currentCombo.includes(player));

        // Stop if the total market value is sufficient
        if (currentSum + (current500kCount * 500000) >= target) {
            if (isValidSquad(filteredRemainingPlayers)) {
                const playersToInclude = [...currentCombo];
                const additional500kNeeded = Math.ceil((target - currentSum) / 500000);

                // Add only the required number of 500k players
                if (additional500kNeeded > 0) {
                    playersToInclude.push(...players500k.slice(0, Math.min(additional500kNeeded, current500kCount)));
                }

                // Create a unique key based on player IDs
                const combinationKey = playersToInclude.map(player => player.i).sort().join(',');

                // Add combination if it's unique
                if (!validCombinations.has(combinationKey)) {
                    validCombinations.set(combinationKey, {
                        combo: playersToInclude,
                        totalMarketValue: currentSum + Math.min(additional500kNeeded, current500kCount) * 500000,
                    });
                }
            }
            return;
        }

        for (let i = index; i < filteredRemainingPlayers.length; i++) {
            findCombination(
                i + 1,
                [...currentCombo, filteredRemainingPlayers[i]],
                currentSum + filteredRemainingPlayers[i].mv,
                current500kCount
            );
        }
    };

    findCombination(0, [], 0, max500kCount);

    // Convert Map values to an array
    const uniqueCombinations = Array.from(validCombinations.values());

    // Sort by total market value, closest to the balance
    uniqueCombinations.sort((a, b) => a.totalMarketValue - b.totalMarketValue);

    // Return the top 5 combinations
    if (uniqueCombinations.length === 0) {
        return {
            error: 'No valid combinations found. Even the nearest combination does not meet the balance requirement.',
        };
    }

    return { playersToSell: uniqueCombinations.slice(0, 5) };
};

module.exports = { getPlayersToSell };