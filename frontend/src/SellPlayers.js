import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SellPlayers.css';
import { Dropdown, DropdownButton, Card, Button } from 'react-bootstrap';
import Select from 'react-select';

const api_url = process.env.REACT_APP_API_URL;

function Dashboard() {
    const [leagues, setLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [squad, setSquad] = useState([]);
    const [balance, setBalance] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [dailyChange, setDailyChange] = useState(0);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [playersToSell, setPlayersToSell] = useState([]);
    const maxTeamValue = totalValue + balance;

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
            const squadData = Array.isArray(response.data.it) ? response.data.it : [];
            setSquad(squadData);
            const dailyChangeSum = squadData.reduce((sum, player) => sum + (player.tfhmvt || 0), 0);
            setDailyChange(dailyChangeSum);
        } catch (error) {
            console.error('Failed to fetch squad:', error);
        }
    };

    const handleLeagueChange = (leagueId) => {
        const league = leagues.find(l => l.i === leagueId);
        if (league) {
            setSelectedLeague(leagueId);
            setBalance(league.b);
            setTotalValue(league.tv);
            setSelectedPlayers([]); // Clear selected players
            setPlayersToSell([]); // Clear players to sell
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

    const formatNumber = (num) => {
        return num ? num.toLocaleString() : 0;
    };

    const handlePlayerSelect = (selectedOption) => {
        if (selectedOption && !selectedPlayers.some(player => player.value === selectedOption.value)) {
            setSelectedPlayers(prevPlayers => [...prevPlayers, selectedOption]);
        }
    };

    const handlePlayerRemove = (playerToRemove) => {
        setSelectedPlayers(prevPlayers => prevPlayers.filter(player => player.value !== playerToRemove.value));
    };

    const playerOptions = squad.map(player => ({
        value: player.i,
        label: `${player.n} (${getPositionName(player.pos)})`
    }));

    const handleSellPlayers = async () => {
        const excludedPlayerIds = selectedPlayers.map(player => player.value);
        try {
            const response = await axios.post(`${api_url}/api/sell-players`, {
                players: squad,
                balance: balance,
                excludedPlayers: excludedPlayerIds,
            });

            if (response.data && response.data.playersToSell) {
                setPlayersToSell(response.data.playersToSell);
            } else if (response.data.error) {
                alert(response.data.error); // Display error returned from backend
                setPlayersToSell([]);
            } else {
                console.log('No players to sell:', response.data);
                setPlayersToSell([]);
            }
        } catch (error) {
            console.error('Error fetching players to sell:', error);
            alert('Failed to fetch players to sell. Please check the backend logs.');
        }
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

            {/* Player Selection Search Bar */}
            <div className=" mb-3" >
                <Select
                    className='excluding-players-select'
                    options={playerOptions}
                    onChange={handlePlayerSelect}
                    isClearable
                    placeholder="Choose players to exclude"
                />
            </div>

            {/* Display Selected Players */}
            <div className="selected-players mb-4">
                <h3>Selected Players</h3>
                {selectedPlayers.length > 0 && (
                    <div className="selected-players-list">
                        {selectedPlayers.map((player) => (
                            <Card key={player.value} className="mb-2">
                                <Card.Body>
                                    <Card.Title>{player.label}</Card.Title>
                                    <Button variant="danger" size="sm" onClick={() => handlePlayerRemove(player)}>Remove</Button>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                )}
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

            {/* Button to fetch players to sell */}
            <Button variant="warning" onClick={handleSellPlayers}>Calculate Players to Sell</Button>

            {/* Display Players to Sell as Cards */}
            {playersToSell.length > 0 && (
                <div className="players-to-sell mt-4">
                    <h3>Players to Sell</h3>
                    <div className="player-card-container">
                        {playersToSell.map((combination, index) => (
                            <div key={index} className="combination-card mb-4">
                                <h5>Combination {index + 1}</h5>
                                <div className="card-grid">
                                    {combination.combo.map(player => (
                                        <Card key={player.i} className="player-card">
                                            <Card.Img variant="top" src={player.imageUrl} alt={player.n} />
                                            <Card.Body>
                                                <Card.Title>{player.n}</Card.Title>
                                                <p>Market Value: {formatNumber(player.mv)}</p>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                                <p><strong>Total Market Value:</strong> {formatNumber(combination.totalMarketValue)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;