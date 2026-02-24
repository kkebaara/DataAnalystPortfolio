/**
 * Pie and bar chart initialization using Chart.js.
 * Destroys existing instances before re-creating; shows error state on failure.
 */
(function (global) {
    var pieChart = null;
    var barChart = null;

    var CHART_COLORS = {
        primary: '#007AFF',
        surface: '#2C2C2E',
        text: '#EBEBF5',
        border: '#38383A',
        series: ['#007AFF', '#30D158', '#FF9F0A', '#FF453A', '#BF5AF2', '#5AC8FA', '#AF52DE', '#A2845E']
    };

    function getCtx(canvasId) {
        var el = document.getElementById(canvasId);
        if (!el) return null;
        return el.getContext('2d');
    }

    function showChartError(containerSelector, message) {
        var container = document.querySelector(containerSelector);
        if (!container) return;
        container.innerHTML = '<div class="chart-error" role="alert">' + (message || 'Chart failed to load.') + '</div>';
    }

    function initializePieChart() {
        var canvasId = 'pieChart';
        var ctx = getCtx(canvasId);
        if (!ctx) return;

        if (typeof global.Chart === 'undefined') {
            showChartError('.chart-container', 'Chart.js not loaded.');
            return;
        }

        if (pieChart) {
            pieChart.destroy();
            pieChart = null;
        }

        var data = global.DashboardState ? global.DashboardState.getLoanData() : null;
        if (!data || !data.statusDistribution) {
            showChartError('.chart-container', 'No data.');
            return;
        }

        try {
            var labels = Object.keys(data.statusDistribution);
            var values = Object.values(data.statusDistribution);
            pieChart = new global.Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: CHART_COLORS.series.slice(0, labels.length),
                        borderColor: CHART_COLORS.border,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: CHART_COLORS.text } }
                    }
                }
            });
        } catch (e) {
            showChartError('.chart-container', 'Chart error.');
        }
    }

    function initializeBarChart() {
        var canvasId = 'barChart';
        var ctx = getCtx(canvasId);
        if (!ctx) return;

        if (typeof global.Chart === 'undefined') {
            showChartError('.bar-chart-container', 'Chart.js not loaded.');
            return;
        }

        if (barChart) {
            barChart.destroy();
            barChart = null;
        }

        var data = global.DashboardState ? global.DashboardState.getLoanData() : null;
        if (!data || !data.stateCounts) {
            showChartError('.bar-chart-container', 'No data.');
            return;
        }

        try {
            var labels = Object.keys(data.stateCounts);
            var values = Object.values(data.stateCounts);
            barChart = new global.Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Loans',
                        data: values,
                        backgroundColor: CHART_COLORS.primary,
                        borderColor: CHART_COLORS.border,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { color: CHART_COLORS.text } },
                        x: { ticks: { color: CHART_COLORS.text } }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        } catch (e) {
            showChartError('.bar-chart-container', 'Chart error.');
        }
    }

    function destroyCharts() {
        if (pieChart) { pieChart.destroy(); pieChart = null; }
        if (barChart) { barChart.destroy(); barChart = null; }
    }

    global.initializePieChart = initializePieChart;
    global.initializeBarChart = initializeBarChart;
    global.destroyCharts = destroyCharts;
})(typeof window !== 'undefined' ? window : this);
