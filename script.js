// Table Tennis Match Simulation Engine for Digital Signage
class TableTennisEngine {
    constructor() {
        this.match = {
            players: [
                {
                    name: "FAN ZHENDONG",
                    rank: "#1",
                    nation: "CHN",
                    sets: 2,
                    points: 8,
                    stats: { aces: 4, fhWinners: 12, bhWinners: 8, unforced: 5, maxRally: 18 }
                },
                {
                    name: "MA LONG",
                    rank: "#3",
                    nation: "CHN",
                    sets: 1,
                    points: 6,
                    stats: { aces: 3, fhWinners: 10, bhWinners: 9, unforced: 7, maxRally: 18 }
                }
            ],
            history: ["11-9", "8-11", "11-6"],
            server: 0, // 0 for player 1, 1 for player 2
            serveCount: 0,
            duration: { hours: 0, minutes: 34, seconds: 12 },
            progressionData: [0, 1, 1, 2, 3, 3, 4, 5, 5, 6, 7, 8], // Sample progression for current set
            winProb: 62
        };

        this.elements = {
            p1Points: document.getElementById('p1-points'),
            p2Points: document.getElementById('p2-points'),
            p1Sets: document.getElementById('p1-sets'),
            p2Sets: document.getElementById('p2-sets'),
            p1Serve: document.getElementById('p1-serve'),
            p2Serve: document.getElementById('p2-serve'),
            p1Prob: document.getElementById('p1-prob'),
            p2Prob: document.getElementById('p2-prob'),
            history: document.getElementById('set-history'),
            duration: document.getElementById('match-duration'),
            clock: document.getElementById('current-time'),
            date: document.getElementById('current-date'),
            progressionCanvas: document.getElementById('progressionChart'),
            rallyFeed: document.getElementById('rally-feed'),
            // Stats
            p1Aces: document.getElementById('p1-aces'),
            p2Aces: document.getElementById('p2-aces'),
            p1Fh: document.getElementById('p1-fh-winners'),
            p2Fh: document.getElementById('p2-fh-winners'),
            p1Bh: document.getElementById('p1-bh-winners'),
            p2Bh: document.getElementById('p2-bh-winners'),
            p1Err: document.getElementById('p1-unforced'),
            p2Err: document.getElementById('p2-unforced'),
            p1Rally: document.getElementById('p1-max-rally'),
            p2Rally: document.getElementById('p2-max-rally')
        };

        this.progressionChart = null;
        this.init();
    }

    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);

        this.initChart();
        this.updateUI();

        // Increment match duration
        setInterval(() => this.tickDuration(), 1000);

        // Simulate a point every 8-12 seconds
        this.scheduleNextPoint();
    }

    updateClock() {
        const now = new Date();
        this.elements.clock.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.elements.date.textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
    }

    tickDuration() {
        this.match.duration.seconds++;
        if (this.match.duration.seconds >= 60) {
            this.match.duration.minutes++;
            this.match.duration.seconds = 0;
        }
        if (this.match.duration.minutes >= 60) {
            this.match.duration.hours++;
            this.match.duration.minutes = 0;
        }

        const h = String(this.match.duration.hours).padStart(2, '0');
        const m = String(this.match.duration.minutes).padStart(2, '0');
        const s = String(this.match.duration.seconds).padStart(2, '0');
        this.elements.duration.textContent = `${h}:${m}:${s}`;
    }

    scheduleNextPoint() {
        const delay = Math.floor(Math.random() * 4000) + 8000; // 8-12 seconds
        setTimeout(() => {
            this.simulatePoint();
            this.scheduleNextPoint();
        }, delay);
    }

    simulatePoint() {
        const winnerIdx = Math.random() < (this.match.winProb / 100) ? 0 : 1;
        const loserIdx = 1 - winnerIdx;

        // Update points
        this.match.players[winnerIdx].points++;

        // Update serve
        this.match.serveCount++;
        if (this.match.serveCount >= 2) {
            this.match.server = 1 - this.match.server;
            this.match.serveCount = 0;
        }

        // Handle Deuce (10-10)
        if (this.match.players[0].points >= 10 && this.match.players[1].points >= 10) {
            // Serve changes every point in deuce
            this.match.server = 1 - this.match.server;
            this.match.serveCount = 0;
        }

        // Add to progression data (just the winner's point for the chart simplicity)
        this.match.progressionData.push(this.match.players[0].points);
        if (this.match.progressionData.length > 20) this.match.progressionData.shift();

        // Check for set win (11 points, win by 2)
        const p1p = this.match.players[0].points;
        const p2p = this.match.players[1].points;

        if ((p1p >= 11 || p2p >= 11) && Math.abs(p1p - p2p) >= 2) {
            this.match.history.push(`${p1p}-${p2p}`);
            this.match.players[winnerIdx].sets++;
            this.match.players[0].points = 0;
            this.match.players[1].points = 0;
            this.match.progressionData = [0];

            if (this.match.history.length > 5) this.match.history.shift();
            this.renderHistory();
        }

        // Update stats randomly
        const rand = Math.random();
        if (rand < 0.1) this.match.players[winnerIdx].stats.aces++;
        else if (rand < 0.4) this.match.players[winnerIdx].stats.fhWinners++;
        else if (rand < 0.7) this.match.players[winnerIdx].stats.bhWinners++;
        else if (rand < 0.85) this.match.players[loserIdx].stats.unforced++;

        const rallyLength = Math.floor(Math.random() * 12) + 2;
        if (rallyLength > this.match.players[0].stats.maxRally) {
            this.match.players[0].stats.maxRally = rallyLength;
            this.match.players[1].stats.maxRally = rallyLength;
        }

        // Dynamic win probability shift
        this.match.winProb = Math.max(20, Math.min(80, this.match.winProb + (winnerIdx === 0 ? 1 : -1)));

        this.addRallyEvent(winnerIdx, rallyLength);
        this.updateUI();
        this.updateChart();
    }

    addRallyEvent(winnerIdx, length) {
        const types = ["Forehand Smash Winner", "Backhand Loop Winner", "Cross-court Winner", "Net-cord Winner", "Unforced Error"];
        const type = types[Math.floor(Math.random() * types.length)];
        const winnerName = this.match.players[winnerIdx].name;

        this.elements.rallyFeed.innerHTML = `
            <div class="rally-item winner">
                <span class="rally-point">+1</span>
                <span class="rally-desc">${type} - ${winnerName}</span>
            </div>
            <div class="rally-item">
                <span class="rally-point">${length}</span>
                <span class="rally-desc">Rally Length (Shots)</span>
            </div>
            <div class="rally-item">
                <span class="rally-point">${Math.floor(Math.random() * 30) + 70}km/h</span>
                <span class="rally-desc">Top Speed (Ball)</span>
            </div>
        `;
    }

    renderHistory() {
        this.elements.history.innerHTML = '';
        this.match.history.forEach(set => {
            const span = document.createElement('span');
            span.textContent = set;
            this.elements.history.appendChild(span);
        });
    }

    updateUI() {
        this.elements.p1Points.textContent = String(this.match.players[0].points).padStart(2, '0');
        this.elements.p2Points.textContent = String(this.match.players[1].points).padStart(2, '0');
        this.elements.p1Sets.textContent = this.match.players[0].sets;
        this.elements.p2Sets.textContent = this.match.players[1].sets;

        this.elements.p1Serve.textContent = this.match.server === 0 ? '●' : '';
        this.elements.p2Serve.textContent = this.match.server === 1 ? '●' : '';

        this.elements.p1Prob.style.width = `${this.match.winProb}%`;
        this.elements.p1Prob.textContent = `${this.match.winProb}%`;
        this.elements.p2Prob.style.width = `${100 - this.match.winProb}%`;
        this.elements.p2Prob.textContent = `${100 - this.match.winProb}%`;

        // Stats
        this.elements.p1Aces.textContent = this.match.players[0].stats.aces;
        this.elements.p2Aces.textContent = this.match.players[1].stats.aces;
        this.elements.p1Fh.textContent = this.match.players[0].stats.fhWinners;
        this.elements.p2Fh.textContent = this.match.players[1].stats.fhWinners;
        this.elements.p1Bh.textContent = this.match.players[0].stats.bhWinners;
        this.elements.p2Bh.textContent = this.match.players[1].stats.bhWinners;
        this.elements.p1Err.textContent = this.match.players[0].stats.unforced;
        this.elements.p2Err.textContent = this.match.players[1].stats.unforced;
        this.elements.p1Rally.textContent = this.match.players[0].stats.maxRally;
        this.elements.p2Rally.textContent = this.match.players[1].stats.maxRally;
    }

    initChart() {
        const ctx = this.elements.progressionCanvas.getContext('2d');

        this.progressionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: 20 }, (_, i) => i + 1),
                datasets: [{
                    label: 'Fan Zhendong Points',
                    data: this.match.progressionData,
                    borderColor: '#00b7af',
                    backgroundColor: 'rgba(0, 183, 175, 0.1)',
                    borderWidth: 4,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 15,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { family: 'Outfit' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { display: false }
                    }
                }
            }
        });
    }

    updateChart() {
        if (this.progressionChart) {
            this.progressionChart.data.datasets[0].data = [...this.match.progressionData];
            this.progressionChart.update('none');
        }
    }
}

// Start Engine
window.addEventListener('load', () => {
    new TableTennisEngine();
});
