/**
 * Dashboard UI: table (sort, filter, render), controls (cross-filter, refresh, export),
 * drill-down, notifications, KPI update. Depends on DashboardState and Chart.js init.
 */
(function (global) {
    var CUSTOMER_TABLE_BODY_ID = 'customerTableBody';
    var LOAN_AMOUNT_ID = 'loanAmount';

    function showNotification(message) {
        var existing = document.querySelector('.notification');
        if (existing) existing.remove();
        var notification = document.createElement('div');
        notification.className = 'notification';
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        notification.textContent = message;
        document.body.appendChild(notification);
        notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        setTimeout(function () {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(function () {
                if (notification.parentNode) notification.parentNode.removeChild(notification);
            }, 300);
        }, 2500);
    }

    function getFilteredRows() {
        if (!global.DashboardState) return [];
        var rows = global.DashboardState.getCustomerRows();
        var filters = global.DashboardState.getFilters();
        return rows.filter(function (r) {
            if (filters.state !== 'all' && r.state !== filters.state) return false;
            return true;
        });
    }

    function getSortedRows(rows, col, dir) {
        var arr = rows.slice();
        arr.sort(function (a, b) {
            var aVal = a.id, bVal = b.id;
            if (col === 1) { aVal = a.income; bVal = b.income; }
            else if (col === 2) { aVal = a.state; bVal = b.state; }
            else if (col === 3) { aVal = a.rate; bVal = b.rate; }
            if (typeof aVal === 'number' && typeof bVal === 'number') return dir * (aVal - bVal);
            var s = String(aVal).localeCompare(String(bVal));
            return dir * (s < 0 ? -1 : s > 0 ? 1 : 0);
        });
        return arr;
    }

    function formatIncome(n) {
        return '$' + Number(n).toLocaleString();
    }

    function renderTable() {
        var tbody = document.getElementById(CUSTOMER_TABLE_BODY_ID);
        if (!tbody) return;
        var filters = global.DashboardState ? global.DashboardState.getFilters() : {};
        var sort = global.DashboardState ? global.DashboardState.getSort() : { column: 0, direction: 1 };
        var rows = getFilteredRows();
        var sorted = getSortedRows(rows, sort.column, sort.direction);

        tbody.innerHTML = '';
        if (sorted.length === 0) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="4" class="empty-state">No data match your filters.</td>';
            tbody.appendChild(tr);
            return;
        }
        sorted.forEach(function (r) {
            var tr = document.createElement('tr');
            tr.setAttribute('tabindex', '0');
            tr.innerHTML =
                '<td class="customer-id">' + escapeHtml(r.id) + '</td>' +
                '<td>' + formatIncome(r.income) + '</td>' +
                '<td>' + escapeHtml(r.state) + '</td>' +
                '<td>' + r.rate + '%</td>';
            tr.onclick = function () { selectRow(tr); };
            tr.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectRow(tr); } };
            tbody.appendChild(tr);
        });
    }

    function escapeHtml(s) {
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    function selectRow(rowEl) {
        var table = document.getElementById('customerTable');
        if (!table) return;
        var rows = table.querySelectorAll('tbody tr');
        for (var i = 0; i < rows.length; i++) rows[i].classList.remove('selected');
        rowEl.classList.add('selected');
        var firstCell = rowEl.querySelector('td');
        var customerId = firstCell ? firstCell.textContent : '';
        showNotification('Selected: ' + customerId);
    }

    function sortTable(colIndex) {
        if (!global.DashboardState) return;
        var sort = global.DashboardState.getSort();
        var direction = sort.column === colIndex ? -sort.direction : 1;
        global.DashboardState.setSort(colIndex, direction);
        renderTable();
        var ths = document.querySelectorAll('#customerTable thead th');
        ths.forEach(function (th, i) {
            th.classList.remove('th-sort-asc', 'th-sort-desc');
            th.setAttribute('aria-sort', i === colIndex ? (direction === 1 ? 'ascending' : 'descending') : 'none');
            if (i === colIndex) th.classList.add(direction === 1 ? 'th-sort-asc' : 'th-sort-desc');
        });
        showNotification('Sorted by column ' + (colIndex + 1));
    }

    function applyFilters() {
        var stateFilter = document.getElementById('stateFilter');
        var statusFilter = document.getElementById('statusFilter');
        var yearFilter = document.getElementById('yearFilter');
        if (!global.DashboardState) return;
        var f = {};
        if (stateFilter) f.state = stateFilter.value || 'all';
        if (statusFilter) f.status = statusFilter.value || 'all';
        if (yearFilter) f.year = yearFilter.value || 'all';
        global.DashboardState.setFilters(f);
        renderTable();
        if (global.initializePieChart) global.initializePieChart();
        if (global.initializeBarChart) global.initializeBarChart();
        showNotification('Filters applied.');
    }

    function toggleCrossFilter() {
        if (!global.DashboardState) return;
        global.DashboardState.setCrossFilter(!global.DashboardState.getCrossFilter());
        var on = global.DashboardState.getCrossFilter();
        var buttons = document.querySelectorAll('.dashboard-controls .control-button');
        buttons.forEach(function (b) {
            var isCrossFilterBtn = (b.textContent || '').trim().toLowerCase().indexOf('cross') >= 0;
            b.classList.toggle('active', isCrossFilterBtn && on);
        });
        showNotification(on ? 'Cross-filter on.' : 'Cross-filter off.');
    }

    function refreshDashboard() {
        showNotification('Refreshing…');
        if (global.destroyCharts) global.destroyCharts();
        if (global.initializePieChart) global.initializePieChart();
        if (global.initializeBarChart) global.initializeBarChart();
        renderTable();
        showNotification('Dashboard refreshed.');
    }

    function exportData() {
        try {
            var rows = getFilteredRows();
            var sort = global.DashboardState ? global.DashboardState.getSort() : { column: 0, direction: 1 };
            var sorted = getSortedRows(rows, sort.column, sort.direction);
            var headers = ['Customer ID', 'Income', 'State', 'Rate (%)'];
            var lines = [headers.join(',')];
            sorted.forEach(function (r) {
                lines.push([r.id, r.income, r.state, r.rate].join(','));
            });
            var csv = lines.join('\n');
            var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'high-value-customers.csv';
            a.click();
            URL.revokeObjectURL(url);
            showNotification('Export complete.');
        } catch (e) {
            showNotification('Export failed.');
        }
    }

    function drillDownLoanAmount() { showNotification('Drilling down into loan details…'); }
    function drillDownStatus() { showNotification('Analyzing status breakdown…'); }
    function drillDownStates() { showNotification('Exploring geographic data…'); }

    function startDataUpdates() {
        setInterval(function () {
            if (Math.random() <= 0.8) return;
            var el = document.getElementById(LOAN_AMOUNT_ID);
            if (!el) return;
            var text = el.textContent || '';
            var num = parseFloat(text.replace(/[$B]/g, '').trim());
            if (Number.isNaN(num)) return;
            var variation = (Math.random() - 0.5) * 0.05;
            var newAmount = (num + variation).toFixed(2);
            el.textContent = newAmount + 'B';
        }, 30000);
    }

    global.sortTable = sortTable;
    global.applyFilters = applyFilters;
    global.toggleCrossFilter = toggleCrossFilter;
    global.refreshDashboard = refreshDashboard;
    global.exportData = exportData;
    global.selectRow = selectRow;
    global.drillDownLoanAmount = drillDownLoanAmount;
    global.drillDownStatus = drillDownStatus;
    global.drillDownStates = drillDownStates;
    global.renderDashboardTable = renderTable;
    global.startDataUpdates = startDataUpdates;
    global.getFilteredRows = getFilteredRows;
    global.getSortedRows = getSortedRows;
})(typeof window !== 'undefined' ? window : this);
