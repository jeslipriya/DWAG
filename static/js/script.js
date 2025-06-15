function drawHexagonGraph() {
    const canvas = document.getElementById('hexagonCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;
    const sides = 6;
    const angle = (2 * Math.PI) / sides;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get scores or use defaults
    const defaultScores = {
        'PHYSICAL': 0,
        'AMBITION': 0,
        'SOCIAL': 0,
        'INTELLECT': 0,
        'DISCIPLINE': 0,
        'MENTAL': 0
    };
    
    const userScores = window.userProductivityScores || defaultScores;
    
    // Colors for each category
    const colors = {
        'PHYSICAL': '#FF6B6B',
        'AMBITION': '#4ECDC4',
        'SOCIAL': '#45B7D1',
        'INTELLECT': '#FFBE0B',
        'DISCIPLINE': '#FB5607',
        'MENTAL': '#8338EC'
    };
    
    // Draw main hexagon outline
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
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw concentric hexagons (grid lines)
    for (let level = 0.2; level <= 1; level += 0.2) {
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
    
    // Draw axes lines
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const x = centerX + radius * Math.cos(angle * i - Math.PI / 2);
        const y = centerY + radius * Math.sin(angle * i - Math.PI / 2);
        
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw data area
    ctx.beginPath();
    const categories = ['PHYSICAL', 'AMBITION', 'SOCIAL', 'INTELLECT', 'DISCIPLINE', 'MENTAL'];
    
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const score = Math.min(100, Math.max(0, userScores[category] || 0));
        const scaledRadius = radius * (score / 100);
        
        const x = centerX + scaledRadius * Math.cos(angle * i - Math.PI / 2);
        const y = centerY + scaledRadius * Math.sin(angle * i - Math.PI / 2);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(187, 134, 252, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#bb86fc';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw data points and labels
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const score = Math.min(100, Math.max(0, userScores[category] || 0));
        const scaledRadius = radius * (score / 100);
        
        // Data point
        const x = centerX + scaledRadius * Math.cos(angle * i - Math.PI / 2);
        const y = centerY + scaledRadius * Math.sin(angle * i - Math.PI / 2);
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = colors[category];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Category label
        const labelX = centerX + (radius + 40) * Math.cos(angle * i - Math.PI / 2);
        const labelY = centerY + (radius + 40) * Math.sin(angle * i - Math.PI / 2);
        
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = colors[category];
        ctx.fillText(category, labelX, labelY);
        
        // Score percentage
        const scoreX = centerX + (radius + 20) * Math.cos(angle * i - Math.PI / 2);
        const scoreY = centerY + (radius + 20) * Math.sin(angle * i - Math.PI / 2);
        
        ctx.font = '14px Inter';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(`${Math.round(score)}%`, scoreX, scoreY);
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

// Make functions available globally
window.updateGraphScore = async function() {
    await fetchAndUpdateGraph();
};

// Initial draw when script loads
document.addEventListener('DOMContentLoaded', drawHexagonGraph);