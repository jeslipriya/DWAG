function initProgressCharts(progressData) {
    // Initialize radar chart
    initRadarChart(progressData.categoryStats);
    
    // Initialize trend chart
    initTrendChart(progressData.trendData);
    
    // Time period selector functionality
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter data based on selected period
            const period = this.dataset.period;
            filterDataByPeriod(period, progressData);
        });
    });
}

function filterDataByPeriod(period, progressData) {
    // In a real implementation, you would fetch filtered data from the server
    // For now, we'll just log the selected period
    console.log(`Filtering data for period: ${period}`);
    // You would typically make an AJAX call here to get filtered data
}

function initTrendChart(trendData) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    // Prepare datasets for each category
    const datasets = [];
    const colors = {
        'PHYSICAL': 'rgba(255, 107, 107, 1)',
        'AMBITION': 'rgba(254, 202, 87, 1)',
        'SOCIAL': 'rgba(29, 209, 161, 1)',
        'INTELLECT': 'rgba(84, 160, 255, 1)',
        'DISCIPLINE': 'rgba(95, 39, 205, 1)',
        'MENTAL': 'rgba(255, 159, 243, 1)'
    };
    
    for (const [category, data] of Object.entries(trendData)) {
        datasets.push({
            label: category,
            data: data.values,
            borderColor: colors[category],
            backgroundColor: colors[category].replace('1)', '0.2)'),
            borderWidth: 2,
            tension: 0.3,
            fill: false
        });
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.dates,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#f0f0f0'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw + '%';
                        }
                    }
                }
            }
        }
    });
}