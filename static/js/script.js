document.addEventListener('DOMContentLoaded', function() {
    // Main chart variable
    let hexagonChart = null;

    // Load Chart.js dynamically if not already loaded
    if (typeof Chart === 'undefined') {
        loadChartJS().then(() => {
            initializeChart();
        }).catch(error => {
            console.error('Failed to load Chart.js:', error);
        });
    } else {
        initializeChart();
    }

    function loadChartJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function initializeChart() {
        const ctx = document.getElementById('hexagonChart');
        if (!ctx) {
            console.error('Canvas element not found');
            return;
        }

        hexagonChart = createHexagonChart(ctx);
        updateChartData();
        
        // Set up periodic updates (every 5 seconds)
        setInterval(updateChartData, 5000);
    }
    
    function updateChartData() {
        fetch('/get_scores')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!hexagonChart) {
                    console.error('Chart not initialized');
                    return;
                }
                updateChart(hexagonChart, data);
            })
            .catch(error => {
                console.error('Error fetching scores:', error);
                // Initialize with zero data if fetch fails
                if (hexagonChart) {
                    updateChart(hexagonChart, {
                        PHYSICAL: 0,
                        AMBITION: 0,
                        SOCIAL: 0,
                        INTELLECT: 0,
                        DISCIPLINE: 0,
                        MENTAL: 0
                    });
                }
            });
    }
    
    function createHexagonChart(ctx) {
        try {
            return new Chart(ctx.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['PHYSICAL', 'AMBITION', 'SOCIAL', 'INTELLECT', 'DISCIPLINE', 'MENTAL'],
                    datasets: [{
                        label: 'Productivity',
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        pointBackgroundColor: [
                            '#FF6B6B',
                            '#4ECDC4',
                            '#45B7D1',
                            '#FFBE0B',
                            '#FB5607',
                            '#8338EC'
                        ],
                        pointBorderColor: '#fff',
                        pointHoverRadius: 5,
                        pointRadius: 4,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: {
                                display: true,
                                color: 'rgba(200, 200, 200, 0.3)'
                            },
                            suggestedMin: 0,
                            suggestedMax: 100,
                            ticks: {
                                stepSize: 20,
                                backdropColor: 'transparent',
                                color: 'rgba(200, 200, 200, 0.8)'
                            },
                            pointLabels: {
                                color: 'rgba(200, 200, 200, 0.8)',
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: 'rgba(200, 200, 200, 0.2)'
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
                                    return context.parsed.r.toFixed(0) + '%';
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
        } catch (error) {
            console.error('Error creating chart:', error);
            return null;
        }
    }
    
    function updateChart(chart, newData) {
        if (!chart || !chart.data || !chart.data.labels) {
            console.error('Invalid chart object');
            return;
        }

        try {
            const labels = chart.data.labels;
            const orderedData = labels.map(label => {
                const value = newData[label];
                return typeof value === 'number' ? value : 0;
            });
            
            chart.data.datasets[0].data = orderedData;
            chart.update();
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }
});