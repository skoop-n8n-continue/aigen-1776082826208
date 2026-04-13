// Cricket Match Simulation Engine for Digital Signage
class CricketEngine {
    constructor() {
        this.match = {
            teams: { home: "PAK", away: "ENG" },
            score: { runs: 168, wickets: 4, overs: 18, balls: 2 },
            batsmen: [
                { name: "Babar Azam", runs: 72, balls: 45, strike: true },
                { name: "Mohammad Rizwan", runs: 45, balls: 32, strike: false }
            ],
            bowler: { name: "Mark Wood", overs: 3.2, maidens: 0, runs: 34, wickets: 1 },
            wormData: [],
            recentMatches: [
                { teams: "PAK vs BAN", result: "PAK won by 6 wickets", date: "Mar 15, 2026" },
                { teams: "PAK vs BAN", result: "PAK won by 82 runs", date: "Mar 13, 2026" },
                { teams: "PAK vs NZ", result: "NZ won by 4 wickets", date: "Feb 28, 2026" },
                { teams: "PAK vs NZ", result: "PAK won by 12 runs", date: "Feb 26, 2026" }
            ],
            lastEvents: []
        };

        // Initialize worm data with some random progression
        let currentTotal = 0;
        for (let i = 0; i <= 18; i++) {
            currentTotal += Math.floor(Math.random() * 12) + 4;
            this.match.wormData.push(currentTotal);
        }

        this.elements = {
            clock: document.getElementById('clock'),
            date: document.getElementById('date'),
            currentScore: document.getElementById('current-score'),
            currentOvers: document.getElementById('current-overs'),
            crr: document.getElementById('crr'),
            projected: document.getElementById('projected'),
            last5: document.getElementById('last-5-overs'),
            partnership: document.getElementById('partnership'),
            batsman1: document.getElementById('batsman-1'),
            batsman2: document.getElementById('batsman-2'),
            bowler: document.getElementById('current-bowler'),
            recentMatches: document.getElementById('recent-matches-container'),
            lastUpdated: document.getElementById('last-updated'),
            wormChartCanvas: document.getElementById('wormChart')
        };

        this.wormChart = null;
        this.init();
    }

    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);

        this.renderRecentMatches();
        this.initChart();
        this.updateUI();

        // Simulate a new ball every 10 seconds for dynamic signage feel
        setInterval(() => this.simulateBall(), 10000);
    }

    updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        this.elements.clock.textContent = `${hours}:${minutes}:${seconds}`;

        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        this.elements.date.textContent = now.toLocaleDateString('en-US', options).toUpperCase();
    }

    simulateBall() {
        const outcomes = [0, 1, 1, 1, 2, 2, 4, 4, 6, 'W'];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

        this.match.score.balls++;
        if (this.match.score.balls >= 6) {
            this.match.score.overs++;
            this.match.score.balls = 0;
            // Rotation of strike at end of over
            this.match.batsmen[0].strike = !this.match.batsmen[0].strike;
            this.match.batsmen[1].strike = !this.match.batsmen[1].strike;

            // Add to worm data at end of over
            this.match.wormData.push(this.match.score.runs);
            this.updateChart();
        }

        if (outcome === 'W') {
            this.match.score.wickets++;
            // Simple logic to replace batsman
            const outIndex = this.match.batsmen.findIndex(b => b.strike);
            this.match.batsmen[outIndex] = {
                name: "Iftikhar Ahmed",
                runs: 0,
                balls: 0,
                strike: true
            };
            this.match.bowler.wickets++;
        } else {
            this.match.score.runs += outcome;
            const striker = this.match.batsmen.find(b => b.strike);
            striker.runs += outcome;
            striker.balls++;
            this.match.bowler.runs += outcome;

            // Rotate strike on odd runs
            if (outcome % 2 !== 0) {
                this.match.batsmen[0].strike = !this.match.batsmen[0].strike;
                this.match.batsmen[1].strike = !this.match.batsmen[1].strike;
            }
        }

        // Update bowler overs
        const bowlOvers = Math.floor(this.match.bowler.overs);
        let bowlBalls = Math.round((this.match.bowler.overs - bowlOvers) * 10);
        bowlBalls++;
        if (bowlBalls >= 6) {
            this.match.bowler.overs = bowlOvers + 1;
        } else {
            this.match.bowler.overs = bowlOvers + (bowlBalls / 10);
        }

        this.updateUI();
        this.elements.lastUpdated.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    updateUI() {
        this.elements.currentScore.textContent = `${this.match.score.runs}/${this.match.score.wickets}`;
        this.elements.currentOvers.textContent = `(${this.match.score.overs}.${this.match.score.balls})`;

        const totalBalls = (this.match.score.overs * 6) + this.match.score.balls;
        const crr = totalBalls > 0 ? (this.match.score.runs / (totalBalls / 6)).toFixed(2) : "0.00";
        this.elements.crr.textContent = crr;

        const projected = Math.round(crr * 20);
        this.elements.projected.textContent = projected;

        // Mock partnership and last 5
        this.elements.partnership.textContent = `${this.match.batsmen[0].runs + this.match.batsmen[1].runs}(${this.match.batsmen[0].balls + this.match.batsmen[1].balls})`;
        this.elements.last5.textContent = `48/1`; // Static mock for simplicity in simulation

        // Batsmen
        const b1 = this.match.batsmen[0];
        const b2 = this.match.batsmen[1];

        this.elements.batsman1.querySelector('.p-name').textContent = b1.name + (b1.strike ? '*' : '');
        this.elements.batsman1.querySelector('.p-stats').textContent = `${b1.runs} (${b1.balls})`;
        this.elements.batsman1.className = `player-row ${b1.strike ? 'active' : ''}`;

        this.elements.batsman2.querySelector('.p-name').textContent = b2.name + (b2.strike ? '*' : '');
        this.elements.batsman2.querySelector('.p-stats').textContent = `${b2.runs} (${b2.balls})`;
        this.elements.batsman2.className = `player-row ${b2.strike ? 'active' : ''}`;

        // Bowler
        this.elements.bowler.querySelector('.p-name').textContent = this.match.bowler.name;
        this.elements.bowler.querySelector('.p-stats').textContent = `${this.match.bowler.overs}-${this.match.bowler.maidens}-${this.match.bowler.runs}-${this.match.bowler.wickets}`;
    }

    renderRecentMatches() {
        this.elements.recentMatches.innerHTML = '';
        this.match.recentMatches.forEach(m => {
            const div = document.createElement('div');
            div.className = 'match-item';
            div.innerHTML = `
                <div class="m-teams">${m.teams}</div>
                <div class="m-result">${m.result}</div>
            `;
            this.elements.recentMatches.appendChild(div);
        });
    }

    initChart() {
        const ctx = this.elements.wormChartCanvas.getContext('2d');
        const labels = Array.from({ length: 21 }, (_, i) => i);

        this.wormChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pakistan',
                    data: this.match.wormData,
                    borderColor: '#FFD700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#FFD700'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#ffffff', font: { family: 'Outfit' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#ffffff', font: { family: 'Outfit' } }
                    }
                }
            }
        });
    }

    updateChart() {
        if (this.wormChart) {
            this.wormChart.data.datasets[0].data = [...this.match.wormData];
            this.wormChart.update();
        }
    }
}

// Start Engine
window.addEventListener('load', () => {
    new CricketEngine();
});
