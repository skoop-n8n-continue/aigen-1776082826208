// Football Match Simulation Engine for Digital Signage
class FootballEngine {
    constructor() {
        this.match = {
            time: { minutes: 62, seconds: 14 },
            score: { home: 2, away: 1 },
            stats: {
                possession: { home: 54, away: 46 },
                shots: { home: 14, away: 9 },
                onTarget: { home: 6, away: 4 },
                passes: { home: 482, away: 415 },
                corners: { home: 5, away: 3 },
                fouls: { home: 8, away: 11 },
                yellowCards: { home: 1, away: 2 },
                redCards: { home: 0, away: 0 }
            },
            events: [
                { time: "58'", desc: "🟨 Yellow Card - Rodri (Man City)", type: 'normal' },
                { time: "42'", desc: "⚽ GOAL! Vini Jr. (Real Madrid)", type: 'goal' },
                { time: "28'", desc: "⚽ GOAL! Erling Haaland (Man City)", type: 'goal' },
                { time: "12'", desc: "⚽ GOAL! Jude Bellingham (Real Madrid)", type: 'goal' }
            ],
            momentumData: Array.from({ length: 63 }, () => Math.floor(Math.random() * 60) - 30)
        };

        this.elements = {
            matchTime: document.getElementById('match-time'),
            homeScore: document.getElementById('home-score'),
            awayScore: document.getElementById('away-score'),
            homePossession: document.getElementById('home-possession'),
            awayPossession: document.getElementById('away-possession'),
            barPossessionHome: document.getElementById('bar-possession-home'),
            barPossessionAway: document.getElementById('bar-possession-away'),
            homeShots: document.getElementById('home-shots'),
            awayShots: document.getElementById('away-shots'),
            homeOnTarget: document.getElementById('home-on-target'),
            awayOnTarget: document.getElementById('away-shots-on-target'),
            homePasses: document.getElementById('home-passes'),
            awayPasses: document.getElementById('away-passes'),
            homeCorners: document.getElementById('home-corners'),
            awayCorners: document.getElementById('away-corners'),
            homeFouls: document.getElementById('home-fouls'),
            awayFouls: document.getElementById('away-fouls'),
            eventFeed: document.getElementById('event-feed'),
            clock: document.getElementById('current-time'),
            date: document.getElementById('current-date'),
            momentumCanvas: document.getElementById('momentumChart')
        };

        this.momentumChart = null;
        this.init();
    }

    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);

        this.initChart();
        this.updateUI();

        // Increment match time
        setInterval(() => this.tickMatchTime(), 1000);

        // Randomly simulate stats updates
        setInterval(() => this.simulateAction(), 8000);
    }

    updateClock() {
        const now = new Date();
        this.elements.clock.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.elements.date.textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
    }

    tickMatchTime() {
        this.match.time.seconds++;
        if (this.match.time.seconds >= 60) {
            this.match.time.minutes++;
            this.match.time.seconds = 0;

            // Add momentum point every minute
            const newMomentum = Math.floor(Math.random() * 60) - 30;
            this.match.momentumData.push(newMomentum);
            if (this.match.momentumData.length > 90) this.match.momentumData.shift();
            this.updateChart();
        }
        this.elements.matchTime.textContent = `${this.match.time.minutes}:${String(this.match.time.seconds).padStart(2, '0')}`;

        // Stop simulation at 90+ mins (simplified)
        if (this.match.time.minutes >= 95) {
            this.match.time.minutes = 90;
            this.match.time.seconds = 0;
        }
    }

    simulateAction() {
        // Randomly update stats
        const side = Math.random() > 0.5 ? 'home' : 'away';
        const action = Math.random();

        if (action < 0.3) {
            this.match.stats.passes[side] += Math.floor(Math.random() * 5) + 1;
        } else if (action < 0.45) {
            this.match.stats.shots[side]++;
            if (Math.random() > 0.6) this.match.stats.onTarget[side]++;
        } else if (action < 0.55) {
            this.match.stats.fouls[side]++;
        } else if (action < 0.6) {
            this.match.stats.corners[side]++;
        } else if (action < 0.01) { // Very rare goal simulation
            this.addGoal(side);
        }

        // Adjust possession slightly
        const shift = Math.floor(Math.random() * 3) - 1;
        this.match.stats.possession.home = Math.max(30, Math.min(70, this.match.stats.possession.home + shift));
        this.match.stats.possession.away = 100 - this.match.stats.possession.home;

        this.updateUI();
    }

    addGoal(side) {
        this.match.score[side]++;
        const teamName = side === 'home' ? 'Real Madrid' : 'Man City';
        const player = side === 'home' ? 'Rodrygo' : 'Kevin De Bruyne';
        this.addEvent(`⚽ GOAL! ${player} (${teamName})`, 'goal');
    }

    addEvent(desc, type) {
        const timeStr = `${this.match.time.minutes}'`;
        this.match.events.unshift({ time: timeStr, desc: desc, type: type });
        if (this.match.events.length > 6) this.match.events.pop();
        this.renderEvents();
    }

    renderEvents() {
        this.elements.eventFeed.innerHTML = '';
        this.match.events.forEach(event => {
            const div = document.createElement('div');
            div.className = `event-item ${event.type === 'goal' ? 'goal' : ''}`;
            div.innerHTML = `
                <span class="event-time">${event.time}</span>
                <span class="event-desc">${event.desc}</span>
            `;
            this.elements.eventFeed.appendChild(div);
        });
    }

    updateUI() {
        this.elements.homeScore.textContent = this.match.score.home;
        this.elements.awayScore.textContent = this.match.score.away;

        this.elements.homePossession.textContent = `${this.match.stats.possession.home}%`;
        this.elements.awayPossession.textContent = `${this.match.stats.possession.away}%`;
        this.elements.barPossessionHome.style.width = `${this.match.stats.possession.home}%`;
        this.elements.barPossessionAway.style.width = `${this.match.stats.possession.away}%`;

        this.elements.homeShots.textContent = this.match.stats.shots.home;
        this.elements.awayShots.textContent = this.match.stats.shots.away;
        this.elements.homeOnTarget.textContent = this.match.stats.onTarget.home;
        this.elements.awayOnTarget.textContent = this.match.stats.onTarget.away;

        this.elements.homePasses.textContent = this.match.stats.passes.home;
        this.elements.awayPasses.textContent = this.match.stats.passes.away;
        this.elements.homeCorners.textContent = this.match.stats.corners.home;
        this.elements.awayCorners.textContent = this.match.stats.corners.away;
        this.elements.homeFouls.textContent = this.match.stats.fouls.home;
        this.elements.awayFouls.textContent = this.match.stats.fouls.away;
    }

    initChart() {
        const ctx = this.elements.momentumCanvas.getContext('2d');
        const labels = Array.from({ length: 90 }, (_, i) => i + 1);

        this.momentumChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Momentum',
                    data: this.match.momentumData,
                    backgroundColor: (context) => {
                        const val = context.raw;
                        return val >= 0 ? 'rgba(0, 183, 175, 0.7)' : 'rgba(56, 189, 248, 0.7)';
                    },
                    borderRadius: 4,
                    borderSkipped: false
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
                        min: -50,
                        max: 50,
                        grid: { color: 'rgba(255, 255, 255, 0.1)', zeroLineColor: '#fff' },
                        ticks: { display: false }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { family: 'Outfit', size: 10 } }
                    }
                }
            }
        });
    }

    updateChart() {
        if (this.momentumChart) {
            this.momentumChart.data.datasets[0].data = [...this.match.momentumData];
            this.momentumChart.update('none');
        }
    }
}

// Start Engine
window.addEventListener('load', () => {
    new FootballEngine();
});
