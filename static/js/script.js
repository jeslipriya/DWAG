document.addEventListener('DOMContentLoaded', function() {
    drawHexagonGraph();
});

function drawHexagonGraph() {
    const canvas = document.getElementById('hexagonCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 150;
        const sides = 6;
        const angle = (2 * Math.PI) / sides;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Default scores set to 0
        const defaultScores = {
            'PHYSICAL': 0,
            'AMBITION': 0,
            'SOCIAL': 0,
            'INTELLECT': 0,
            'DISCIPLINE': 0,
            'MENTAL': 0
        };
        
        let userScores;
        try {
            userScores = window.userProductivityScores || defaultScores;
            // Ensure all categories exist
            Object.keys(defaultScores).forEach(key => {
                if (!(key in userScores)) {
                    userScores[key] = defaultScores[key];
                }
            });
        } catch (e) {
            console.error("Error loading scores:", e);
            userScores = defaultScores;
        }
        
        const colors = {
            'PHYSICAL': '#FF6B6B',
            'AMBITION': '#4ECDC4',
            'SOCIAL': '#45B7D1',
            'INTELLECT': '#FFBE0B',
            'DISCIPLINE': '#FB5607',
            'MENTAL': '#8338EC'
        };
        
        // Draw hexagon background
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const x = centerX + radius * Math.cos(angle * i - Math.PI / 2);
            const y = centerY + radius * Math.sin(angle * i - Math.PI / 2);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw grid lines
        for (let level = 0.25; level <= 1; level += 0.25) {
            ctx.beginPath();
            for (let i = 0; i <= sides; i++) {
                const x = centerX + (radius * level) * Math.cos(angle * i - Math.PI / 2);
                const y = centerY + (radius * level) * Math.sin(angle * i - Math.PI / 2);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // Draw axes
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const x = centerX + radius * Math.cos(angle * i - Math.PI / 2);
            const y = centerY + radius * Math.sin(angle * i - Math.PI / 2);
            
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw data points
        ctx.beginPath();
        const categories = ['PHYSICAL', 'AMBITION', 'SOCIAL', 'INTELLECT', 'DISCIPLINE', 'MENTAL'];
        
        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            const score = Math.min(100, Math.max(0, userScores[category] || 0)); // Ensure score is between 0-100
            const scaledRadius = radius * (score / 100);
            
            const x = centerX + scaledRadius * Math.cos(angle * i - Math.PI / 2);
            const y = centerY + scaledRadius * Math.sin(angle * i - Math.PI / 2);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Draw category labels
            const labelX = centerX + (radius + 30) * Math.cos(angle * i - Math.PI / 2);
            const labelY = centerY + (radius + 30) * Math.sin(angle * i - Math.PI / 2);
            
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = colors[category];
            ctx.fillText(category, labelX, labelY);
            
            // Draw score percentage
            const scoreX = centerX + (radius + 15) * Math.cos(angle * i - Math.PI / 2);
            const scoreY = centerY + (radius + 15) * Math.sin(angle * i - Math.PI / 2);
            
            ctx.font = '12px Inter';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(`${Math.round(score)}%`, scoreX, scoreY);
        }
        ctx.closePath();
        
        // Fill the data area
        ctx.fillStyle = 'rgba(187, 134, 252, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#bb86fc';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw data points as circles
        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            const score = Math.min(100, Math.max(0, userScores[category] || 0)); // Ensure score is between 0-100
            const scaledRadius = radius * (score / 100);
            
            const x = centerX + scaledRadius * Math.cos(angle * i - Math.PI / 2);
            const y = centerY + scaledRadius * Math.sin(angle * i - Math.PI / 2);
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = colors[category];
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
}

async function fetchAndUpdateGraph() {
    try {
        const response = await fetch('/get_scores');
        if (response.ok) {
            const scores = await response.json();
            window.userProductivityScores = scores;
            drawHexagonGraph();
        }
    } catch (error) {
        console.error('Error fetching scores:', error);
    }
}

// Call this after marking a task complete
window.updateGraphScore = async function(category) {
    await fetchAndUpdateGraph();
};

// Make the function available globally
window.updateGraphScore = function(category, score) {
    if (window.userProductivityScores && category in window.userProductivityScores) {
        // Ensure score is between 0-100
        window.userProductivityScores[category] = Math.min(100, Math.max(0, score));
        drawHexagonGraph();
    }
};

// Example in your task completion code
document.querySelectorAll('.complete-task-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const taskId = this.dataset.taskId;
        const response = await fetch(`/complete_task/${taskId}`);
        if (response.ok) {
            await fetchAndUpdateGraph();
            // Refresh task list or other UI elements as needed
        }
    });
});