/**
 * Central state for dashboard: filters, cross-filter toggle, and loan data.
 * Single source of truth for table and chart logic.
 */
(function (global) {
    var state = {
        crossFilterEnabled: true,
        selectedFilters: { state: 'all', status: 'all', year: 'all' },
        sortColumn: 0,
        sortDirection: 1,
        loanData: {
            stateCounts: {
                CA: 25234, TX: 16750, NY: 15892, FL: 14123,
                IL: 8756, NJ: 7823, OH: 7234, PA: 6845, GA: 6234, NC: 5123
            },
            statusDistribution: {
                'Current': 87.89,
                'Charged Off': 9.07,
                'Late (31-120)': 1.72,
                'Grace Period': 0.90,
                'Late (16-30)': 0.42
            }
        },
        customerRows: [
            { id: 'GAtPem...cmdgrz', income: 250000, state: 'CA', rate: 6.17 },
            { id: 'IqOBd5...9452/cb', income: 241120, state: 'TX', rate: 5.99 },
            { id: '3ZrUn/...so3jcKuf', income: 237892, state: 'NY', rate: 7.75 },
            { id: 'vkhNp2...KDaQp8N', income: 235650, state: 'FL', rate: 6.82 },
            { id: 'J3xFJM...991BnP', income: 228900, state: 'IL', rate: 7.15 }
        ]
    };

    function getFilters() { return Object.assign({}, state.selectedFilters); }
    function setFilters(f) {
        if (f && typeof f === 'object') {
            if (f.state !== undefined) state.selectedFilters.state = f.state;
            if (f.status !== undefined) state.selectedFilters.status = f.status;
            if (f.year !== undefined) state.selectedFilters.year = f.year;
        }
    }
    function getCrossFilter() { return state.crossFilterEnabled; }
    function setCrossFilter(v) { state.crossFilterEnabled = !!v; }
    function getLoanData() { return state.loanData; }
    function getCustomerRows() { return state.customerRows.slice(); }
    function getSort() { return { column: state.sortColumn, direction: state.sortDirection }; }
    function setSort(col, dir) {
        state.sortColumn = col;
        state.sortDirection = dir;
    }

    global.DashboardState = {
        getFilters: getFilters,
        setFilters: setFilters,
        getCrossFilter: getCrossFilter,
        setCrossFilter: setCrossFilter,
        getLoanData: getLoanData,
        getCustomerRows: getCustomerRows,
        getSort: getSort,
        setSort: setSort
    };
})(typeof window !== 'undefined' ? window : this);
