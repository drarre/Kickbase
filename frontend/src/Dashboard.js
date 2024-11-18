import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css'; // Include a CSS file for custom styling
import { Dropdown, DropdownButton, Card, Row, Col } from 'react-bootstrap'; 

const api_url = process.env.REACT_APP_API_URL;

function Dashboard() {
    const [leagues, setLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [squad, setSquad] = useState([]);
    const [balance, setBalance] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [dailyChange, setDailyChange] = useState(0);
    const [sortBy, setSortBy] = useState("mv");  // Default sort by Market Value
    const [sortOrder, setSortOrder] = useState("desc");  // Default sort order (descending)

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

    // Sorting handler
    const handleSortChange = (criteria) => {
        if (criteria === sortBy) {
            // If the user selects the same sort criteria, toggle the order
            setSortOrder(prevOrder => prevOrder === "asc" ? "desc" : "asc");
        } else {
            // If the user selects a new sort criteria, set to descending order
            setSortBy(criteria);
            setSortOrder("desc");
        }
    };

    // Sort the squad data based on the selected criteria and order
    const sortedSquad = [...squad].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Ensure sorting of numerical values (Market Value, Profit, etc.)
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);

        if (sortOrder === "asc") {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
    });

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
            
            {/* Filter Dropdown (Only visible after selecting a league) */}
            {selectedLeague && (
                <div className="mb-3">
                    <DropdownButton
                        id="sort-dropdown"
                        title={`Sort by ${sortBy === 'mv' ? 'Market Value' : sortBy === 'tfhmvt' ? '24h Change' : sortBy === 'mvgl' ? 'Profit' : sortBy === 'p' ? 'Points' : 'Average Points'}`}
                        variant="secondary"
                        onSelect={handleSortChange}
                        className="w-100"
                    >
                        <Dropdown.Item eventKey="mv">Market Value</Dropdown.Item>
                        <Dropdown.Item eventKey="tfhmvt">24h Change</Dropdown.Item>
                        <Dropdown.Item eventKey="mvgl">Profit</Dropdown.Item>
                        <Dropdown.Item eventKey="p">Points</Dropdown.Item>
                        <Dropdown.Item eventKey="ap">Average Points</Dropdown.Item>
                    </DropdownButton>
                </div>
            )}

            {/* Squad Cards */}
            <div className="squad-cards">
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {sortedSquad.map(player => (
                        <Col key={player.i}>
                            <Card className="squad-card">
                                {/* Player Image */}
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
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
}

export default Dashboard;