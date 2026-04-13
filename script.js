document.addEventListener('DOMContentLoaded', () => {
    const timeDisplay = document.getElementById('time-display');
    const statusText = document.getElementById('status-text');
    const taskCount = document.getElementById('task-count');
    const bars = document.querySelectorAll('.bar');

    // Update time
    function updateTime() {
        const now = new Date();
        timeDisplay.textContent = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    setInterval(updateTime, 1000);
    updateTime();

    // Dynamic Status Messages (Addressing the "What you doing" prompt)
    const messages = [
        "OPTIMIZING WORKFLOWS",
        "SYNCING DATA STREAMS",
        "ANALYZING PARAMETERS",
        "UPDATING INTERFACES",
        "PROCESSING REQUESTS",
        "REFREASHING ASSETS",
        "CHECKING SYSTEMS",
        "STREAMING CONTENT",
        "DEPLOYING UPDATES",
        "MAPPING STRUCTURES"
    ];

    let messageIndex = 0;
    function updateStatus() {
        statusText.style.opacity = 0;
        setTimeout(() => {
            statusText.textContent = messages[messageIndex];
            statusText.style.opacity = 1;
            messageIndex = (messageIndex + 1) % messages.length;
        }, 500);
    }
    statusText.style.transition = 'opacity 0.5s ease';
    setInterval(updateStatus, 4000);
    updateStatus();

    // Randomize chart bars
    function updateCharts() {
        bars.forEach(bar => {
            const height = Math.floor(Math.random() * 60) + 20;
            bar.style.height = `${height}%`;
        });
    }
    setInterval(updateCharts, 2000);

    // Randomize task count slightly
    function updateTasks() {
        let current = parseInt(taskCount.textContent);
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        taskCount.textContent = Math.max(5, current + change);
    }
    setInterval(updateTasks, 5000);
});