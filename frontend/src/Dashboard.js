import React, { useState, useEffect } from 'react';
import './Dashboard.css'; // Include a CSS file for custom styling
import { Dropdown, DropdownButton, Card, Row, Col } from 'react-bootstrap';
import apiClient from './api/apiClient';

const api_url = process.env.REACT_APP_API_URL;

function Dashboard() {
    const [leagues, setLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [squad, setSquad] = useState([]);
    const [balance, setBalance] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [dailyChange, setDailyChange] = useState(0);
    const [playersToSell, setPlayersToSell] = useState([]);
    const [totalSellMarketValue, setTotalSellMarketValue] = useState(0);

    // Fetch leagues when component mounts
    useEffect(() => {
        const fetchLeagues = async () => {
            try {
                const response = await apiClient.get(`${api_url}/api/leagues`);
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
            const response = await apiClient.get(`${api_url}/api/squads/${leagueId}`);
            const squadData = Array.isArray(response.data.it) ? response.data.it : [];
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
            setPlayersToSell([]);
            setTotalSellMarketValue(0);
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

    // Add or remove players from the list of players to sell
    const handlePlayerSellToggle = (player, isChecked) => {
        if (isChecked) {
            setPlayersToSell(prev => [...prev, player]);
        } else {
            setPlayersToSell(prev => prev.filter(p => p.i !== player.i));
        }
    };

    // Recalculate the total market value of selected players
    useEffect(() => {
        const totalValue = playersToSell.reduce((sum, player) => sum + player.mv, 0);
        setTotalSellMarketValue(totalValue);
    }, [playersToSell]);

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
                        <p><strong>Max Team Value:</strong> {formatNumber(totalValue + balance)}</p>
                        <p>
                            <strong>Daily Win/Loss:</strong>
                            <span className={dailyChange >= 0 ? 'positive' : 'negative'}>
                                {formatNumber(dailyChange)}
                            </span>
                        </p>
                    </Card.Body>
                </Card>
            )}

            {/* Squad Cards */}
            <div className="squad-cards">
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {squad.map(player => (
                        <Col key={player.i}>
                            <Card className="squad-card">
                                <div className="squad-card-img">
                                    <Card.Img variant="top" src={player.imageUrl} alt={`${player.n} image`} />
                                </div>
                                <Card.Body>
                                    <Card.Title>{player.n}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">{getPositionName(player.pos)}</Card.Subtitle>
                                    <Row>
                                        <Col xs={6}>
                                            <p><strong>Market Value:</strong></p>
                                            <p><strong>24h Change:</strong></p>
                                            <p><strong>Profit:</strong></p>
                                            <p><strong>Points:</strong></p>
                                            <p><strong>Average Points:</strong></p>
                                        </Col>
                                        <Col xs={6}>
                                            <p>{formatNumber(player.mv)}</p>
                                            <p><span className={player.tfhmvt >= 0 ? 'positive' : 'negative'}>{formatNumber(player.tfhmvt)}</span></p>
                                            <p><span className={player.mvgl >= 0 ? 'positive' : 'negative'}>{formatNumber(player.mvgl)}</span></p>
                                            <p>{formatNumber(player.p)}</p>
                                            <p>{formatNumber(player.ap)}</p>
                                        </Col>
                                    </Row>
                                    {/* Checkbox for marking players to sell */}
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`sell-${player.i}`}
                                            checked={playersToSell.some(p => p.i === player.i)}
                                            onChange={(e) => handlePlayerSellToggle(player, e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor={`sell-${player.i}`}>
                                            Mark for Sale
                                        </label>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Market Value Calculator Overlay */}
            <div className="market-value-overlay">
                <h4>Total Market Value of Selected Players: <strong>{formatNumber(totalSellMarketValue)}</strong></h4>
            </div>
        </div>
    );
}

export default Dashboard;