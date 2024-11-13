import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css'; // Include a CSS file for custom styling
import { Dropdown, DropdownButton, Card, Table } from 'react-bootstrap'; // Import Bootstrap components


const api_url = process.env.REACT_APP_API_URL;

function Dashboard() {
    const [leagues, setLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [squad, setSquad] = useState([]);
    const [balance, setBalance] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [dailyChange, setDailyChange] = useState(0);
    const maxTeamValue = totalValue + balance;

    // Fetch leagues when component mounts
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

    // Fetch squad details based on selected league
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

    // Handle league selection
    const handleLeagueChange = (leagueId) => {
        const league = leagues.find(l => l.i === leagueId);

        if (league) {
            setSelectedLeague(leagueId);
            setBalance(league.b);
            setTotalValue(league.tv);
            fetchSquad(leagueId);
        }
    };

    // Get position name from position code
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

    // Format numbers for display
    const formatNumber = (num) => {
        return num ? num.toLocaleString() : 0;
    };



    return (
        <div className="dashboard">
            <h2>Dashboard</h2>

            {/* League Selection */}
            <div className="mb-3">
                <DropdownButton
                    id="league-selector"
                    title={selectedLeague ? `Selected League: ${selectedLeague}` : 'Select League'}
                    variant="primary"
                    onSelect={handleLeagueChange}
                    className="w-100"
                >
                    {leagues.map(league => (
                        <Dropdown.Item key={league.i} eventKey={league.i}>
                            {league.n} (Competition ID: {league.cpi})
                        </Dropdown.Item>
                    ))}
                </DropdownButton>
            </div>



            {/* League Details */}
            {selectedLeague && (
                <Card className="league-details mb-4">
                    <Card.Body>
                        <Card.Title>League Details</Card.Title>
                        <p><strong>Balance:</strong> {formatNumber(balance)}</p>
                        <p><strong>Total Value:</strong> {formatNumber(totalValue)}</p>
                        <p><strong>Max Team Value:</strong> {formatNumber(maxTeamValue)}</p>
                        <p>
                            <strong>Daily Win/Loss:</strong>
                            <span className={dailyChange >= 0 ? 'positive' : 'negative'}>
                                {formatNumber(dailyChange)}
                            </span>
                        </p>
                    </Card.Body>
                </Card>
            )}

            {/* Squad Table */}
            {squad.length > 0 && (
                <div className="squad">
                    <Card>
                        <Card.Body>
                            <Card.Title>Squad</Card.Title>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Position</th>
                                        <th>Market Value</th>
                                        <th>Points</th>
                                        <th>Average Points</th>
                                        <th>24h Change</th>
                                        <th>Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {squad.map(player => (
                                        <tr key={player.i} className="squad-row">
                                            <td>{player.n}</td>
                                            <td>{getPositionName(player.pos)}</td>
                                            <td>{formatNumber(player.mv)}</td>
                                            <td>{player.p || 0}</td>
                                            <td>{player.ap || 0}</td>
                                            <td className={player.tfhmvt >= 0 ? 'positive' : 'negative'}>
                                                {formatNumber(player.tfhmvt)}
                                            </td>
                                            <td className ={player.mvgl >= 0 ? 'positive' : 'negative'}>
                                                {formatNumber(player.mvgl)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default Dashboard;