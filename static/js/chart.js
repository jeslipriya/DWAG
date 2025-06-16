function initRadarChart(categoryStats) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    // EXACT order from your second image
    const categoryOrder = ['PHYSICAL', 'AMBITION', 'SOCIAL', 'INTELLECT', 'DISCIPLINE', 'MENTAL'];
    const labels = categoryOrder;
    const dataValues = categoryOrder.map(cat => categoryStats[cat]?.percentage || 0);
    
    // Color mapping
    const colorMap = {
        'PHYSICAL': { bg: 'rgba(255, 107, 107, 0.2)', border: 'rgba(255, 107, 107, 1)' },
        'AMBITION': { bg: 'rgba(254, 202, 87, 0.2)', border: 'rgba(254, 202, 87, 1)' },
        'SOCIAL': { bg: 'rgba(29, 209, 161, 0.2)', border: 'rgba(29, 209, 161, 1)' },
        'INTELLECT': { bg: 'rgba(84, 160, 255, 0.2)', border: 'rgba(84, 160, 255, 1)' },
        'DISCIPLINE': { bg: 'rgba(95, 39, 205, 0.2)', border: 'rgba(95, 39, 205, 1)' },
        'MENTAL': { bg: 'rgba(255, 159, 243, 0.2)', border: 'rgba(255, 159, 243, 1)' }
    };

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: categoryOrder.map(cat => colorMap[cat].bg),
                borderColor: categoryOrder.map(cat => colorMap[cat].border),
                borderWidth: 2,
                pointBackgroundColor: categoryOrder.map(cat => colorMap[cat].border),
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true,
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    grid: {
                        circular: true,
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    pointLabels: {
                        color: '#ffffff',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        display: false,
                        beginAtZero: true,
                        max: 100
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.raw + '%';
                        }
                    }
                }
            },
            elements: {
                line: {
                    tension: 0
                }
            }
        }
    });
}