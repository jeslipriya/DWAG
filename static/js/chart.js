function initRadarChart(categoryStats) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    // Order the categories to match your desired layout
    const categories = ['PHYSICAL', 'AMBITION', 'SOCIAL', 'INTELLECT', 'DISCIPLINE', 'MENTAL'];
    const dataValues = categories.map(cat => categoryStats[cat].percentage);
    
    const backgroundColors = categories.map(category => {
        switch(category) {
            case 'PHYSICAL': return 'rgba(255, 107, 107, 0.2)';
            case 'AMBITION': return 'rgba(254, 202, 87, 0.2)';
            case 'SOCIAL': return 'rgba(29, 209, 161, 0.2)';
            case 'INTELLECT': return 'rgba(84, 160, 255, 0.2)';
            case 'DISCIPLINE': return 'rgba(95, 39, 205, 0.2)';
            case 'MENTAL': return 'rgba(255, 159, 243, 0.2)';
            default: return 'rgba(74, 144, 226, 0.2)';
        }
    });
    
    const borderColors = categories.map(category => {
        switch(category) {
            case 'PHYSICAL': return 'rgba(255, 107, 107, 1)';
            case 'AMBITION': return 'rgba(254, 202, 87, 1)';
            case 'SOCIAL': return 'rgba(29, 209, 161, 1)';
            case 'INTELLECT': return 'rgba(84, 160, 255, 1)';
            case 'DISCIPLINE': return 'rgba(95, 39, 205, 1)';
            case 'MENTAL': return 'rgba(255, 159, 243, 1)';
            default: return 'rgba(74, 144, 226, 1)';
        }
    });
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Progress',
                data: dataValues,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2,
                pointBackgroundColor: borderColors,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        lineWidth: 1
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        circular: true
                    },
                    pointLabels: {
                        color: '#f0f0f0',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        backdropColor: 'transparent'
                    },
                    ticks: {
                        display: true,
                        backdropColor: 'transparent',
                        color: 'rgba(255, 255, 255, 0.5)',
                        beginAtZero: true,
                        max: 100,
                        stepSize: 20,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
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
                    tension: 0.1
                }
            }
        }
    });
}