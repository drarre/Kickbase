import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css'; // Include a CSS file for custom styling

const api_url = process.env.REACT_APP_API_URL;

function Dashboard() {
    const [leagues, setLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [squad, setSquad] = useState([]);
    const [balance, setBalance] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [dailyChange, setDailyChange] = useState(0);

    useEffect(() => {
        const fetchLeagues = async () => {
            try {
                const response = await axios.get(`${api_url}/api/leagues`);
                setLeagues(Array.isArray(response.data.it.it) ? response.data.it.it : []);
            } catch (error) {
                console.error('Failed to fetch leagues:', error);
            }
        };

        fetchLeagues();
    }, []);

    const fetchSquad = async (leagueId) => {
        try {
            const response = await axios.get(`${api_url}/api/squads/${leagueId}`);
            const squadData = Array.isArray(response.data.it.it) ? response.data.it.it : [];
            setSquad(squadData);
            const dailyChangeSum = squadData.reduce((sum, player) => sum + (player.tfhmvt || 0), 0);
            setDailyChange(dailyChangeSum);
        } catch (error) {
            console.error('Failed to fetch squad:', error);
        }
    };

    const handleLeagueChange = (e) => {
        const leagueId = e.target.value;
        const league = leagues.find(l => l.i === leagueId);

        if (league) {
            setSelectedLeague(leagueId);
            setBalance(league.b);
            setTotalValue(league.tv);
            fetchSquad(leagueId);
        }
    };

    const getPositionName = (position) => {
        switch (position) {
            case 1:
                return 'Goalkeeper';
            case 2:
                return 'Defender';
            case 3:
                return 'Midfielder';
            case 4:
                return 'Attacker';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="dashboard">
            <h2>Dashboard</h2>
            <label>Select League:</label>
            <select onChange={handleLeagueChange} value={selectedLeague || ''}>
                <option value="" disabled>Select a league</option>
                {leagues.map(league => (
                    <option key={league.i} value={league.i}>
                        {league.n} (Competition ID: {league.cpi})
                    </option>
                ))}
            </select>

            {selectedLeague && (
                <div className="league-details">
                    <h3>League Details</h3>
                    <p><strong>Balance:</strong> {balance}</p>
                    <p><strong>Total Value:</strong> {totalValue}</p>
                    <p><strong>Daily Win/Loss:</strong> {dailyChange}</p>
                </div>
            )}

            {squad.length > 0 && (
                <div className="squad">
                    <h3>Squad</h3>
                    <table className="squad-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Position</th>
                                <th>Market Value</th>
                                <th>Points</th>
                                <th>Average Points</th>
                                <th>24h Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {squad.map(player => (
                                <tr key={player.i} className="squad-row">
                                    <td>{player.n}</td>
                                    <td>{getPositionName(player.pos)}</td>
                                    <td>{player.mv.toLocaleString()}</td>
                                    <td>{player.p}</td>
                                    <td>{player.ap}</td>
                                    <td className={player.tfhmvt >= 0 ? 'positive' : 'negative'}>
                                        {player.tfhmvt.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Dashboard;