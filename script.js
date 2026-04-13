// Jumping Championship Simulation Engine for Digital Signage
class JumpingEngine {
    constructor() {
        this.athletes = [
            { name: "MUTAZ BARSHIM", country: "QATAR", flag: "🇶🇦", pb: "2.43", sb: "2.39", rank: 1 },
            { name: "GIANMARCO TAMBERI", country: "ITALY", flag: "🇮🇹", pb: "2.39", sb: "2.37", rank: 2 },
            { name: "SANGHYEOK WOO", country: "S. KOREA", flag: "🇰🇷", pb: "2.36", sb: "2.36", rank: 3 },
            { name: "ARSHAD NADEEM", country: "PAKISTAN", flag: "🇵🇰", pb: "2.35", sb: "2.34", rank: 4 },
            { name: "HAMISH KERR", country: "NEW ZEALAND", flag: "🇳🇿", pb: "2.36", sb: "2.35", rank: 5 }
        ];

        this.state = {
            currentAthleteIndex: 0,
            attempt: 1,
            height: 2.37,
            isJumping: false,
            jumpProgress: 0,
            log: [
                { name: "S. WOO", height: "2.34m", status: "CLEAR" },
                { name: "G. TAMBERI", height: "2.37m", status: "FAILED" },
                { name: "M. BARSHIM", height: "2.34m", status: "CLEAR" }
            ],
            historyData: [2.31, 2.33, 2.34, 2.36, 2.35] // Sample progression for chart
        };

        this.elements = {
            time: document.getElementById('current-time'),
            date: document.getElementById('current-date'),
            athleteName: document.getElementById('athlete-name'),
            athleteCountry: document.getElementById('athlete-country'),
            athleteFlag: document.getElementById('athlete-flag'),
            attemptNum: document.getElementById('attempt-num'),
            targetHeight: document.getElementById('target-height'),
            jumpStatus: document.getElementById('jump-status'),
            pb: document.getElementById('pb-val'),
            sb: document.getElementById('sb-val'),
            rank: document.getElementById('rank-val'),
            progressBar: document.getElementById('jump-progress'),
            logList: document.getElementById('jump-log'),
            chartCanvas: document.getElementById('heightChart')
        };

        this.chart = null;
        this.init();
    }

    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);

        this.initChart();
        this.updateUI();
        this.renderLog();

        // Start jump cycle
        this.cycle();
    }

    updateClock() {
        const now = new Date();
        this.elements.time.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.elements.date.textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
    }

    updateUI() {
        const athlete = this.athletes[this.state.currentAthleteIndex];
        this.elements.athleteName.textContent = athlete.name;
        this.elements.athleteCountry.textContent = athlete.country;
        this.elements.athleteFlag.textContent = athlete.flag;
        this.elements.attemptNum.textContent = `${this.state.attempt} / 3`;
        this.elements.targetHeight.textContent = this.state.height.toFixed(2);
        this.elements.pb.textContent = athlete.pb + 'm';
        this.elements.sb.textContent = athlete.sb + 'm';
        this.elements.rank.textContent = '#' + athlete.rank;
    }

    renderLog() {
        this.elements.logList.innerHTML = '';
        this.state.log.slice(0, 4).forEach(item => {
            const li = document.createElement('li');
            li.className = 'log-item';
            li.innerHTML = `
                <span class="log-name">${item.name}</span>
                <span class="log-height">${item.height}</span>
                <span class="log-status ${item.status.toLowerCase()}">${item.status}</span>
            `;
            this.elements.logList.appendChild(li);
        });
    }

    initChart() {
        const ctx = this.elements.chartCanvas.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Event 1', 'Event 2', 'Event 3', 'Event 4', 'Event 5'],
                datasets: [{
                    label: 'Height',
                    data: this.state.historyData,
                    borderColor: '#00b7af',
                    backgroundColor: 'rgba(0, 183, 175, 0.1)',
                    borderWidth: 4,
                    pointBackgroundColor: '#00b7af',
                    pointRadius: 6,
                    tension: 0.4,
                    fill: true
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
                        min: 2.20,
                        max: 2.50,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { family: 'Outfit' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { family: 'Outfit' } }
                    }
                }
            }
        });
    }

    async cycle() {
        while (true) {
            // Wait phase
            this.elements.jumpStatus.textContent = "WAITING";
            this.elements.jumpStatus.style.color = "white";
            this.elements.progressBar.style.width = "0%";
            await new Promise(r => setTimeout(r, 4000));

            // Preparation phase
            this.elements.jumpStatus.textContent = "PREPARING";
            this.elements.jumpStatus.style.color = "#FFD700";
            await new Promise(r => setTimeout(r, 3000));

            // Run-up / Jump phase
            this.elements.jumpStatus.textContent = "JUMPING";
            this.elements.jumpStatus.style.color = "#00b7af";

            // Animate progress bar (run-up)
            const duration = 5000;
            const start = Date.now();
            while (Date.now() - start < duration) {
                const elapsed = Date.now() - start;
                const progress = (elapsed / duration) * 100;
                this.elements.progressBar.style.width = progress + "%";
                await new Promise(r => requestAnimationFrame(r));
            }

            // Outcome phase
            const success = Math.random() > 0.4;
            const athlete = this.athletes[this.state.currentAthleteIndex];

            if (success) {
                this.elements.jumpStatus.textContent = "CLEAR";
                this.elements.jumpStatus.style.color = "#2ed573";
                this.state.log.unshift({ name: athlete.name.split(' ').map(n => n[0]).join('. '), height: this.state.height.toFixed(2) + "m", status: "CLEAR" });
                this.state.historyData.push(this.state.height);
                this.state.historyData.shift();
                this.chart.update();
            } else {
                this.elements.jumpStatus.textContent = "FAILED";
                this.elements.jumpStatus.style.color = "#ff4757";
                this.state.log.unshift({ name: athlete.name.split(' ').map(n => n[0]).join('. '), height: this.state.height.toFixed(2) + "m", status: "FAILED" });
            }

            this.renderLog();
            await new Promise(r => setTimeout(r, 5000));

            // Advance state
            if (success || this.state.attempt === 3) {
                this.state.currentAthleteIndex = (this.state.currentAthleteIndex + 1) % this.athletes.length;
                this.state.attempt = 1;
                // Slowly increase height
                if (success) this.state.height += 0.02;
            } else {
                this.state.attempt++;
            }

            this.updateUI();
        }
    }
}

// Start Engine
window.addEventListener('load', () => {
    new JumpingEngine();
});
