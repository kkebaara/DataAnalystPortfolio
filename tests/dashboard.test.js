/**
 * Unit tests for dashboard filter and sort logic (pure functions).
 * Run with: node tests/dashboard.test.js
 */
(function () {
    function getFilteredRows(rows, filters) {
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

    var assert = function (ok, msg) {
        if (!ok) throw new Error(msg || 'Assertion failed');
    };
    var tests = 0;
    var passed = 0;

    function test(name, fn) {
        tests++;
        try {
            fn();
            passed++;
            console.log('  \u2713 ' + name);
        } catch (e) {
            console.log('  \u2717 ' + name + ': ' + e.message);
        }
    }

    var sampleRows = [
        { id: 'c', income: 150, state: 'CA', rate: 4 },
        { id: 'a', income: 100, state: 'CA', rate: 5 },
        { id: 'b', income: 200, state: 'TX', rate: 6 }
    ];

    console.log('Dashboard logic tests\n');

    test('getFilteredRows returns all rows when state is all', function () {
        var out = getFilteredRows(sampleRows, { state: 'all', status: 'all', year: 'all' });
        assert(out.length === 3);
    });

    test('getFilteredRows filters by state CA', function () {
        var out = getFilteredRows(sampleRows, { state: 'CA', status: 'all', year: 'all' });
        assert(out.length === 2);
        assert(out.every(function (r) { return r.state === 'CA'; }));
    });

    test('getFilteredRows returns empty when no match', function () {
        var out = getFilteredRows(sampleRows, { state: 'NY', status: 'all', year: 'all' });
        assert(out.length === 0);
    });

    test('getSortedRows sorts by id (col 0) ascending', function () {
        var out = getSortedRows(sampleRows, 0, 1);
        assert(out[0].id === 'a' && out[1].id === 'b' && out[2].id === 'c');
    });

    test('getSortedRows sorts by income (col 1) descending', function () {
        var out = getSortedRows(sampleRows, 1, -1);
        assert(out[0].income === 200 && out[2].income === 100);
    });

    test('getSortedRows sorts by state (col 2)', function () {
        var out = getSortedRows(sampleRows, 2, 1);
        assert(out[0].state === 'CA');
    });

    test('getSortedRows sorts by rate (col 3)', function () {
        var out = getSortedRows(sampleRows, 3, 1);
        assert(out[0].rate === 4);
    });

    console.log('\n' + passed + '/' + tests + ' passed');
    process.exit(passed === tests ? 0 : 1);
})();
