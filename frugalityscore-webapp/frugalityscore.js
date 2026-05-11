let performanceData = {};

async function loadPerformanceData() {
    const response = await fetch('../frugalityscore/src/data/referencePerformance.json');
    performanceData = await response.json();

    const metricSelect = document.getElementById("metric");

    Object.keys(performanceData.performance_minmax).forEach((metric, index) => {
        const option = document.createElement("option");
        option.value = metric;
        option.textContent = metric;

        if (index === 0) option.selected = true;

        metricSelect.appendChild(option);
    });
}

// Populate CPU dropdown from CSV
async function loadCPUs() {
    const response = await fetch('../frugalityscore/src/data/CPUs.csv');
    const text = await response.text();
    const lines = text.split(/\r?\n/).slice(1);

    const selectCPU = document.getElementById("cpu-select");
    const option = document.createElement("option");

    selectCPU.appendChild(option);
    option.value = 'DEFAULT';
    option.textContent = "DEFAULT";
    option.dataset.TDP_per_core = 6; // default TDP per core
    option.selected = true
    lines.forEach((line, index) => {
        if (!line.trim()) return;
        const cols = line.split(',');
        const model = cols[0];
        const TDP_per_core = parseFloat(cols[2]) || 1; // 3rd column

        const option = document.createElement("option");
        option.value = model;
        option.textContent = model;
        option.dataset.TDP_per_core = TDP_per_core;

        selectCPU.appendChild(option);
    });
}

async function loadGPUs() {
    const response = await fetch('../frugalityscore/src/data/GPUs.csv');
    const text = await response.text();
    const lines = text.split(/\r?\n/).slice(1);

    const selectGPU = document.getElementById("gpu-select");
    const option = document.createElement("option");

    selectGPU.appendChild(option);
    option.value = 'DEFAULT';
    option.textContent = "DEFAULT";
    option.dataset.TDP_per_core = 6; // default TDP per core
    option.selected = true
    lines.forEach((line, index) => {
        if (!line.trim()) return;
        const cols = line.split(',');
        const model = cols[0];
        const TDP_per_core = parseFloat(cols[2]) || 1; // 3rd column

        const option = document.createElement("option");
        option.value = model;
        option.textContent = model;
        option.dataset.TDP_per_core = TDP_per_core;

        selectGPU.appendChild(option);
    });
}

function smf(x, [a, b]) {
    if (a === b && x === a) return 1;

    if (x <= a) return 0;
    if (x >= b) return 1;

    return (b === a) ? 1 : (x - a) / (b - a);
}

function zmf(x, [a, b]) {
    if (a === b && x === a) return 1;

    if (x <= a) return 1;
    if (x >= b) return 0;

    return (b === a) ? 1 : 1 - (x - a) / (b - a);
}

function trimf(x, [a, b, c]) {
    if (a === b && x === a) return 1;
    if (b === c && x === c) return 1;

    if (x <= a || x >= c) return 0;
    if (x === b) return 1;

    if (x < b) return (b === a) ? 1 : (x - a) / (b - a);
    return (c === b) ? 1 : (c - x) / (c - b);
}

function trapmf(x, [a, b, c, d]) {
    if (b === a && x === a) return 1;
    if (c === d && x === d) return 1;

    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;

    if (x > a && x < b) return (b === a) ? 1 : (x - a) / (b - a);
    return (d === c) ? 1 : (d - x) / (d - c);
}



function computeMembership(metric, x) {
    const funcs = performanceData.performance_functions[metric];
    const params = performanceData.performance_params[metric];

    let results = [];

    for (let i = 0; i < funcs.length; i++) {
        if (funcs[i] === "trimf") {
            results.push(trimf(x, params[i]));
        } else if (funcs[i] === "trapmf") {
            results.push(trapmf(x, params[i]));
        }
    }

    return results;
}

function generateTraceMembershipEnergy(energy_value, cpuFactor, cores, gpuFactor, ngpu, time_low, time_medium, time_high, metric) {
    let x = [];
    let ys = [[], [], []]; // low, medium, high

    const power = cpuFactor * cores + gpuFactor * ngpu;
    const energy_low = power * time_low;
    const energy_medium = power * time_medium;
    const energy_high = power * time_high;

    const step = power * 0.5;

    let maxValue;
    if (energy_value < power * 100 && power * 100 < energy_high) {maxValue = energy_high} else if (energy_value < power * 100) {maxValue = power * 100} else {maxValue = energy_value};

    for (let energy = 0; energy <= maxValue; energy += step) {
        x.push(energy);

        let results = [];

        // results.push(trapmf(energy, [0, 0, energy_low, energy_medium]));
        results.push(zmf(energy, [energy_low, energy_medium]));
        results.push(trimf(energy, [energy_low, energy_medium, energy_high]));
        // results.push(trapmf(energy, [energy_medium, energy_high, maxValue, maxValue]));
        results.push(smf(energy, [energy_medium, energy_high]));
        ys[0].push(results[0]);
        ys[1].push(results[1]);
        ys[2].push(results[2]);
    };

    // choose labels based on number of sets
    const labels = ["low", "medium", "high"];

    return ys.map((yVals, idx) => ({
        x: x,
        y: yVals,
        mode: 'lines',
        name: labels[idx]
    }));
};

function generateTraceMembershipPerformance(minVal, maxVal, metric) {
    const funcs = performanceData.performance_functions[metric];
    let x = [];
    let ys = funcs.map(() => []);

    const step = (maxVal - minVal) / 100;

    for (let i = minVal; i <= maxVal; i+= step) {
        x.push(i);

        let memberships = computeMembership(metric, i);

        memberships.forEach((m, idx) => {
            ys[idx].push(m);
        });
    }

    // choose labels based on number of sets
    let labels;
    if (funcs.length === 3) {
        labels = ["low", "medium", "high"];
    } else if (funcs.length === 2) {
        labels = ["low", "high"];
    } else {
        labels = funcs.map((_, i) => `set ${i + 1}`);
    }

    return ys.map((yVals, idx) => ({
        x: x,
        y: yVals,
        mode: 'lines',
        name: labels[idx]
    }));
}

function computeEnergyMembership(cpuFactor, cores, gpuFactor, ngpu, time_low, time_medium, time_high, energy) {
    const power = cpuFactor * cores + gpuFactor * ngpu;
    const energy_low = power * time_low;
    const energy_medium = power * time_medium;
    const energy_high = power * time_high;

    let memberships = [];
    // memberships.push(trapmf(energy, [0, 0, energy_low, energy_medium]));
    memberships.push(zmf(energy, [energy_low, energy_medium]));
    memberships.push(trimf(energy, [energy_low, energy_medium, energy_high]));
    // memberships.push(trapmf(energy, [energy_medium, energy_high, power * 100, power * 100]));
    memberships.push(smf(energy, [energy_medium, energy_high]));

    return memberships;
}

function computePerfMembership(metric, perf) {
    const [minVal, maxVal] = performanceData.performance_minmax[metric];
    return computeMembership(metric, perf);
}

function computeScoreMembership(perf, energy, metric, cpuFactor, cores, gpuFactor, ngpu,  time_low, time_medium, time_high) {
    const perfMembership = computePerfMembership(metric, perf);
    const energyMembership = computeEnergyMembership(cpuFactor, cores, gpuFactor, ngpu, time_low, time_medium, time_high, energy);

    // Example: score has 5 triangular memberships functions: very low, low, medium, high, very high
    // Association rules are defined as follows:
    // - If perf is low and energy is low, then score is medium
    // - If perf is medium and energy is low, then score is high
    // - If perf is high and energy is low, then score is very high
    // - If perf is low and energy is medium, then score is low
    // - If perf is medium and energy is medium, then score is medium
    // - If perf is high and energy is medium, then score is high
    // - If perf is low and energy is high, then score is very low
    // - If perf is medium and energy is high, then score is low
    // - If perf is high and energy is high, then score is medium

    const rules = [
        [0, 0, 1, 0, 0], // low perf, low energy -> medium score
        [0, 0, 0, 1, 0], // medium perf, low energy -> high score
        [0, 0, 0, 0, 1], // high perf, low energy -> very high score
        [1, 0, 0, 0, 0], // low perf, medium energy -> low score
        [0, 1, 0, 0, 0], // medium perf, medium energy -> medium score
        [0, 0, 1, 0, 0], // high perf, medium energy -> high score
        [1, 0, 0, 0, 0], // low perf, high energy -> very low score
        [0, 1, 0, 0, 0], // medium perf, high energy -> low score
        [0, 0, 1, 0, 0] // high perf, high energy -> medium score
    ];

    let scoreMembership = [0, 0, 0, 0, 0]; // very low, low, medium, high, very high
    for (let i = 0; i < perfMembership.length; i++) {
        for (let j = 0; j < energyMembership.length; j++) {
            const ruleStrength = Math.min(perfMembership[i], energyMembership[j]);
            for (let s = 0; s < scoreMembership.length; s++) {
                scoreMembership[s] = Math.max(scoreMembership[s], Math.min(ruleStrength, rules[j * energyMembership.length + i][s]));
            }
        }
    }

    return scoreMembership;
};

function computeScoreMLMembership(perf, energy_train, energy_test, metric, cpuFactor, cores, gpuFactor, ngpu,  time_low_train, time_medium_train, time_high_train, time_low_test, time_medium_test, time_high_test) {
    const perfMembership = computePerfMembership(metric, perf);
    const energyTrainMembership = computeEnergyMembership(cpuFactor, cores, gpuFactor, ngpu, time_low_train, time_medium_train, time_high_train, energy_train);
    const energyTestMembership = computeEnergyMembership(cpuFactor, cores, gpuFactor, ngpu, time_low_test, time_medium_test, time_high_test, energy_test);

    // Example: score has 5 triangular memberships functions: very low, low, medium, high, very high
    // Association rules are defined as follows:
    // - If perf is low, energy train is low and energy test is low, then score is medium
    // - If perf is medium, energy is low and energy test is low, then score is high
    // - If perf is high, energy is low and energy test is low, then score is very high
    // - If perf is low, energy is medium and energy test is low, then score is low
    // - If perf is medium, energy is medium and energy test is low, then score is medium
    // - If perf is high, energy is medium and energy test is low, then score is high
    // - If perf is low, energy is high and energy test is low, then score is very low
    // - If perf is medium, energy is high and energy test is low, then score is low
    // - If perf is high, energy is high and energy test is low, then score is medium

    // - If perf is low, energy train is low and energy test is medium, then score is low
    // - If perf is medium, energy is low and energy test is medium, then score is medium
    // - If perf is high, energy is low and energy test is medium, then score is high
    // - If perf is low, energy is medium and energy test is medium, then score is very low
    // - If perf is medium, energy is medium and energy test is medium, then score is low
    // - If perf is high, energy is medium and energy test is medium, then score is medium
    // - If perf is low, energy is high and energy test is medium, then score is very low
    // - If perf is medium, energy is high and energy test is medium, then score is very low
    // - If perf is high, energy is high and energy test is medium, then score is low

    // - If perf is low, energy train is low and energy test is high, then score is very low
    // - If perf is medium, energy is low and energy test is high, then score is low
    // - If perf is high, energy is low and energy test is high, then score is medium
    // - If perf is low, energy is medium and energy test is high, then score is very low
    // - If perf is medium, energy is medium and energy test is high, then score is very low
    // - If perf is high, energy is medium and energy test is high, then score is low
    // - If perf is low, energy is high and energy test is high, then score is very low
    // - If perf is medium, energy is high and energy test is high, then score is very low
    // - If perf is high, energy is high and energy test is high, then score is very low

    const rules = [
        [0, 0, 1, 0, 0], // low perf, low energy train, low energy test -> medium score
        [0, 0, 0, 1, 0], // medium perf, low energy train, low energy test -> high score
        [0, 0, 0, 0, 1], // high perf, low energy train, low energy test -> very high score
        [0, 1, 0, 0, 0], // low perf, medium energy train, low energy test -> low score
        [0, 0, 1, 0, 0], // medium perf, medium energy train, low energy test -> medium score
        [0, 0, 0, 1, 0], // high perf, medium energy train, low energy test -> high score
        [1, 0, 0, 0, 0], // low perf, high energy, low energy test -> very low score
        [0, 1, 0, 0, 0], // medium perf, high energy, low energy test -> low score
        [0, 0, 1, 0, 0], // high perf, high energy, low energy test -> medium score

        [0, 1, 0, 0, 0], // low perf, low energy train, medium energy test -> medium score
        [0, 0, 1, 0, 0], // medium perf, low energy train, medium energy test -> high score
        [0, 0, 0, 1, 0], // high perf, low energy train, medium energy test -> very high score
        [1, 0, 0, 0, 0], // low perf, medium energy train, medium energy test -> low score
        [0, 1, 0, 0, 0], // medium perf, medium energy train, medium energy test -> medium score
        [0, 0, 1, 0, 0], // high perf, medium energy train, medium energy test -> high score
        [1, 0, 0, 0, 0], // low perf, high energy, medium energy test -> very low score
        [1, 0, 0, 0, 0], // medium perf, high energy, medium energy test -> low score
        [0, 1, 0, 0, 0], // high perf, high energy, medium energy test -> medium score

        [1, 0, 0, 0, 0], // low perf, low energy train, high energy test -> medium score
        [0, 1, 0, 0, 0], // medium perf, low energy train, high energy test -> high score
        [0, 0, 1, 0, 0], // high perf, low energy train, high energy test -> very high score
        [1, 0, 0, 0, 0], // low perf, medium energy train, high energy test -> low score
        [1, 0, 0, 0, 0], // medium perf, medium energy train, high energy test -> medium score
        [0, 1, 0, 0, 0], // high perf, medium energy train, high energy test -> high score
        [1, 0, 0, 0, 0], // low perf, high energy, high energy test -> very low score
        [1, 0, 0, 0, 0], // medium perf, high energy, high energy test -> low score
        [1, 0, 0, 0, 0] // high perf, high energy, high energy test -> medium score
    ];

    let scoreMembership = [0, 0, 0, 0, 0]; // very low, low, medium, high, very high
    for (let i = 0; i < perfMembership.length; i++) {
        for (let j = 0; j < energyTrainMembership.length; j++) {
            for (let k = 0; k < energyTestMembership.length; k++) {
                const ruleStrength = Math.min(perfMembership[i], energyTrainMembership[j], energyTestMembership[k]);
                for (let s = 0; s < scoreMembership.length; s++) {
                    scoreMembership[s] = Math.max(scoreMembership[s], Math.min(ruleStrength, rules[(k * perfMembership.length + j) * energyTrainMembership.length + i][s]));
                }
            }
        }
    }

    return scoreMembership;
};


function generateTraceMembershipScore() {
    let x = [];
    let ys = [[], [], [], [], []]; // very low, low, medium, high, very high

    for (let score = 0; score <= 100; score += 1) {
        x.push(score);

        let results = [];

        results.push(trimf(score, [0, 0, 25]));
        results.push(trimf(score, [0, 25, 50]));
        results.push(trimf(score, [25, 50, 75]));
        results.push(trimf(score, [50, 75, 100]));
        results.push(trimf(score, [75, 100, 100]));
        ys[0].push(results[0]);
        ys[1].push(results[1]);
        ys[2].push(results[2]);
        ys[3].push(results[3]);
        ys[4].push(results[4]);

    };

    // choose labels based on number of sets
    const labels = ["1", "2", "3", "4", "5"];

    return ys.map((yVals, idx) => ({
        x: x,
        y: yVals,
        mode: 'lines',
        name: labels[idx]
    }));
};

function generateTraceMembershipScoreAggregated(scoreMembership) {
    let x = [];
    let y = []; // very low, low, medium, high, very high

    for (let score = 0; score <= 100; score += 1) {
        x.push(score);

        let results = [];

        results.push(Math.min(trimf(score, [0, 0, 25]), scoreMembership[0]));
        results.push(Math.min(trimf(score, [0, 25, 50]), scoreMembership[1]));
        results.push(Math.min(trimf(score, [25, 50, 75]), scoreMembership[2]));
        results.push(Math.min(trimf(score, [50, 75, 100]), scoreMembership[3]));
        results.push(Math.min(trimf(score, [75, 100, 100]), scoreMembership[4]));
        y.push(Math.max(...results)); // aggregate using max (OR)

    };

    return {
        x: x,
        y: y,
        mode: 'lines',
        fill: 'tozeroy',
        fillcolor: '#000000',
        hoveron: 'points+fills',
        line: {
        color: '#000000'
        },
        name: "Score aggregated"
    };
}

function computeScore(perf, energy) {
    const defuzz = getSelectedDefuzzType();
    const scoreMembership = computeScoreMembership(perf, energy, document.getElementById("metric").value, parseInt(document.getElementById("cpu-power").value) || 1, parseInt(document.getElementById("cores").value) || 1, parseInt(document.getElementById("gpu-power").value) || 1, parseInt(document.getElementById("number-gpu").value) || 0, parseInt(document.getElementById("energy_low").value), parseInt(document.getElementById("energy_medium").value), parseInt(document.getElementById("energy_high").value));
    const trace_aggregated = generateTraceMembershipScoreAggregated(scoreMembership)
    const x_vals = trace_aggregated.x;
    const y_vals = trace_aggregated.y;
    let defuzzValue;
    if (defuzz === "centroid") {
        defuzzValue = centroid(x_vals, y_vals);
    } else if (defuzz === "bisector") {
        defuzzValue = bisector(x_vals, y_vals);
    } else if (defuzz === "som") {
        defuzzValue = som(x_vals, y_vals);
    } else if (defuzz === "mom") {
        defuzzValue = mom(x_vals, y_vals);
    } else if (defuzz === "lom") {
        defuzzValue = lom(x_vals, y_vals);
    } else {
        defuzzValue = 0;
    }
    return defuzzValue;
}


function centroid(x, y) {
    let num = 0, den = 0;
    for (let i = 0; i < x.length; i++) {
        num += x[i] * y[i];
        den += y[i];
    }
    return den === 0 ? 0 : num / den;
}

function bisector(x, y) {
    const totalArea = y.reduce((sum, val) => sum + val, 0);
    let cumulativeArea = 0;
    for (let i = 0; i < x.length; i++) {
        cumulativeArea += y[i];
        if (cumulativeArea >= totalArea / 2) {
            return x[i];
        }
    }
    return x[x.length - 1];
}

function som(x, y) {
    let maxMembership = Math.max(...y);
    let candidates = x.filter((_, i) => y[i] === maxMembership);
    return Math.min(...candidates);
}

function mom(x, y) {
    let maxMembership = Math.max(...y);
    let candidates = x.filter((_, i) => y[i] === maxMembership);
    return candidates.reduce((a, b) => a + b, 0) / candidates.length;
}

function lom(x, y) {
    let maxMembership = Math.max(...y);
    let candidates = x.filter((_, i) => y[i] === maxMembership);
    return Math.max(...candidates);
}

function getScoreColor(score) {
    score = Math.max(0, Math.min(100, score));

    const hue = score * 1.2; // 0 → red, 120 → green
    return `hsl(${hue}, 70%, 50%)`;
}

function updateCPUPower() {
    const selectCPU = document.getElementById("cpu-select");
    const selectedOptionCPU = selectCPU.options[selectCPU.selectedIndex];
    if (!selectedOptionCPU) return;

    const cpuFactor = parseFloat(selectedOptionCPU.dataset.TDP_per_core) || 1;
    const cpuPowerInput = document.getElementById("cpu-power");
    cpuPowerInput.value = cpuFactor;
    cpuPowerInput.nextSibling.textContent = "W";

    updatePlot()
}

function updateGPUPower() {
    const selectGPU = document.getElementById("gpu-select");
    const selectedOptionGPU = selectGPU.options[selectGPU.selectedIndex];
    if (!selectedOptionGPU) return;

    const gpuFactor = parseFloat(selectedOptionGPU.dataset.TDP_per_core) || 1;
    const gpuPowerInput = document.getElementById("gpu-power");
    gpuPowerInput.value = gpuFactor;
    gpuPowerInput.nextSibling.textContent = "W";

    updatePlot()
}

function updatePlotML() {
    // Implementation for updating ML plot
}


function updatePlot() {
    const systemType = getSelectedSystemType();

    const metric = document.getElementById("metric").value;
    if (!performanceData.performance_minmax) return;
    const [minVal, maxVal] = performanceData.performance_minmax[metric];

    const cpuFactor = parseInt(document.getElementById("cpu-power").value) || 1;
    const cores = parseInt(document.getElementById("cores").value) || 1;

    const gpuFactor = parseInt(document.getElementById("gpu-power").value) || 1;
    const ngpu = parseInt(document.getElementById("number-gpu").value) || 0;

    const time_low = parseInt(document.getElementById("energy_low").value);
    const time_medium = parseInt(document.getElementById("energy_medium").value);
    const time_high = parseInt(document.getElementById("energy_high").value);

    const perf = parseFloat(document.getElementById("perf").value) || 0;
    const safePerf = Math.max(minVal, Math.min(maxVal, perf));
    const energy = parseFloat(document.getElementById("energy").value) || 0;
    const safeEnergy = Math.max(0, energy);

    // const scoreMembership = computeScoreMembership(safePerf, safeEnergy, metric, cpuFactor, cores, gpuFactor, ngpu, time_low, time_medium, time_high);

    let traces_membership = generateTraceMembershipPerformance(minVal, maxVal, metric);
    let trace_membership_energy = generateTraceMembershipEnergy(energy, cpuFactor, cores, gpuFactor, ngpu, time_low, time_medium, time_high, metric);
    let trace_membership_score = generateTraceMembershipScore();
    
    let scoreMembership;
    let trace_membership_energy_test;
    if (systemType === "ML") {
        scoreMembership = computeScoreMLMembership(safePerf, safeEnergy, safeEnergy, metric, cpuFactor, cores, gpuFactor, ngpu, time_low, time_medium, time_high, time_low, time_medium, time_high);
        trace_membership_energy_test = generateTraceMembershipEnergy(energy, cpuFactor, cores, gpuFactor, ngpu, time_low, time_medium, time_high, metric);
    } else {
        scoreMembership = computeScoreMembership(safePerf, safeEnergy, metric, cpuFactor, cores, gpuFactor, ngpu, time_low, time_medium, time_high);
    }

    let trace_membership_agg = generateTraceMembershipScoreAggregated(scoreMembership);

    const x_vals = trace_membership_agg.x;
    const y_vals = trace_membership_agg.y;
    const defuzz = getSelectedDefuzzType();
    let defuzzValue;
    if (defuzz === "centroid") {
        defuzzValue = centroid(x_vals, y_vals);
    } else if (defuzz === "bisector") {
        defuzzValue = bisector(x_vals, y_vals);
    } else if (defuzz === "som") {
        defuzzValue = som(x_vals, y_vals);
    } else if (defuzz === "mom") {
        defuzzValue = mom(x_vals, y_vals);
    } else if (defuzz === "lom") {
        defuzzValue = lom(x_vals, y_vals);
    } else {
        defuzzValue = 0;
    }

    // const layout_plot = {
    //     title: `Performance over Time (${cpu})`,
    //     xaxis: { title: "Time (s)" },
    //     yaxis: { title: "Value" }
    // };
    const layout_membership = {
        xaxis: { title: metric },
        yaxis: { title: "Membership value", range: [0, 1] },
        shapes: [
            {
                type: 'line',
                x0: safePerf,
                x1: safePerf,
                y0: 0,
                y1: 1,
                line: {
                    dash: 'dash',
                    width: 2
                }
            }
        ],
        annotations: [
            {
                x: safePerf,
                y: 1,
                text: safePerf.toFixed(2),
                showarrow: false,
                yanchor: "bottom"
            }
        ]
    };
    const layout_membership_energy = {
        xaxis: { title: "Energy (J)" },
        yaxis: { title: "Membership value", range: [0, 1] },
        shapes: [
            {
                type: 'line',
                x0: safeEnergy,
                x1: safeEnergy,
                y0: 0,
                y1: 1,
                line: {
                    dash: 'dash',
                    width: 2
                }
            }
        ],
        annotations: [
            {
                x: safeEnergy,
                y: 1,
                text: safeEnergy.toFixed(2),
                showarrow: false,
                yanchor: "bottom"
            }
        ]
    };

    const layout_membership_score = {
        xaxis: { title: "Score" },
        yaxis: { title: "Membership value", range: [0, 1] },
    };

    const layout_membership_score_annoted = {
        xaxis: { title: "Score" },
        yaxis: { title: "Membership value", range: [0, 1] },
        shapes: [
            {
                type: 'line',
                line: {
                    color: getScoreColor(defuzzValue),
                    dash: 'dash',
                    width: 2
                },
                x0: defuzzValue,
                x1: defuzzValue,
                y0: 0,
                y1: 1
            }
        ],
        annotations: [
            {
                x: defuzzValue,
                y: 1,
                text: defuzzValue.toFixed(2),
                font: {
                    color: getScoreColor(defuzzValue)
                },
                showarrow: false,
                yanchor: "bottom"
            }
        ]
    };

    // Plotly.newPlot('plot', traces, layout_plot);
    Plotly.newPlot('plot_membership', traces_membership, layout_membership);
    Plotly.newPlot('plot_membership_energy', trace_membership_energy, layout_membership_energy);
    Plotly.newPlot('plot_membership_score', [...trace_membership_score, trace_membership_agg], layout_membership_score);
    Plotly.newPlot('plot_membership_score_agg', [trace_membership_agg], layout_membership_score_annoted);

    if (systemType === "ML") {
        // Additional plot for ML system
        Plotly.newPlot('plot_membership_energy_test', trace_membership_energy_test, layout_membership_energy);
        document.getElementById("plot_membership_energy_test").style.display = "block";
    } else {
        document.getElementById("plot_membership_energy_test").style.display = "none";
    }
    const scoreEl = document.getElementById("score_display");

    scoreEl.textContent = 'Score: ' + defuzzValue.toFixed(2);

    // 🎨 apply color
    const color = getScoreColor(defuzzValue);
    scoreEl.style.backgroundColor = color;

    // optional: improve readability
    scoreEl.style.color = (defuzzValue > 50) ? "black" : "white";

}

function getSelectedSystems() {
    const checkboxes = document.querySelectorAll('.left-panel input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function getSelectedSystemType() {
    const radios = document.querySelectorAll('input[name="systemType"]');
    const selected = Array.from(radios).find(r => r.checked);
    return selected ? selected.value : null;
}

function getSelectedDefuzzType() {
    const radios = document.querySelectorAll('input[name="defuzz"]');
    const selected = Array.from(radios).find(r => r.checked);
    return selected ? selected.value : null;
}

// Update slider label
// document.getElementById("time").addEventListener("input", function() {
//     document.getElementById("timeValue").textContent = this.value;
//     updatePlot();
// });

function readUploadFile(evt) {
    const file = evt.target.files[0];
    if (!file) return;
    document.getElementById("bar_scores_display").style.display = "block";

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result.trim();
        // Assuming CSV with headers: perf,energy
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) return;
        const headers = lines[0].split(',').map(h => h.trim());
        const perfIdx = headers.indexOf("perf");
        const energyIdx = headers.indexOf("energy");
        const groupIdx = headers.indexOf("group");
        if (perfIdx === -1 || energyIdx === -1) return;
        const lastLine = lines[lines.length - 1].split(',');
        const perf = parseFloat(lastLine[perfIdx]) || 0;
        const energy = parseFloat(lastLine[energyIdx]) || 0;
        document.getElementById("perf").value = perf;
        document.getElementById("energy").value = energy;
        updatePlot();
        const perfs = lines.slice(1).map(line => parseFloat(line.split(',')[perfIdx]));
        const energies = lines.slice(1).map(line => parseFloat(line.split(',')[energyIdx]));
        const groups = lines.slice(1).map(line => line.split(',')[groupIdx]);
        const trace_bar_scores = generateDisplayScore(perfs, energies, groups);
        const layout_bar_scores = {
            xaxis: { title: "Group" },
            yaxis: { title: "Score", range: [0, 100] },
            title: "Scores by Group"
        };
        Plotly.newPlot('bar_scores_display', [trace_bar_scores], layout_bar_scores);
    };
    reader.readAsText(file);
}

function generateDisplayScore(perfs, energies, groups) {
    let scores = [];
    for (let index = 0; index < perfs.length; index++) {
        const perf = perfs[index];
        const energy = energies[index];
        const defuzzValue = computeScore(perf, energy);
        scores.push(defuzzValue);
    }
    return {
        x: scores,
        y: groups,
        type: 'bar',
        marker: {
            color: scores.map(s => getScoreColor(s))
        },
        orientation: 'h'
    };
}

function updateSliderLow(time) {
    document.getElementById("energy_low").value = time;
    document.getElementById("energyValueLow").value = time;
    document.getElementById("energy_low").max = document.getElementById("energy_high").max;
    if (time > parseInt(document.getElementById("energy_medium").value)) {
        updateSliderMedium(time);
    }
    updatePlot();
}

function updateSliderMedium(time) {
    document.getElementById("energy_medium").value = time;
    document.getElementById("energyValueMedium").value = time;
    document.getElementById("energy_medium").max = document.getElementById("energy_high").max;
    if (time > parseInt(document.getElementById("energy_high").value)) {
        updateSliderHigh(time);
    }
    if (time < parseInt(document.getElementById("energy_low").value)) {
        updateSliderLow(time);
    }
    updatePlot();
}

function updateSliderHigh(time) {
    document.getElementById("energy_high").value = time;
    document.getElementById("energyValueHigh").value = time;
    if (time >= parseInt(document.getElementById("energy_high").max)) {
        document.getElementById("energy_high").max = time*1.1;
    }
    if (time < parseInt(document.getElementById("energy_medium").value)) {
        updateSliderMedium(time);
    }
    updatePlot();
}

document.getElementById('input-file').addEventListener('change', readUploadFile);

// Update energy slider labels
document.getElementById("energy_low").addEventListener("input", function() {
    updateSliderLow(this.value);
});
document.getElementById("energy_medium").addEventListener("input", function() {
    updateSliderMedium(this.value);
}); 
document.getElementById("energy_high").addEventListener("input", function() {
    updateSliderHigh(this.value);
});

document.getElementById("energyValueLow").addEventListener("input", function() {
    updateSliderLow(this.value);
});
document.getElementById("energyValueMedium").addEventListener("input", function() {
    updateSliderMedium(this.value);
});
document.getElementById("energyValueHigh").addEventListener("input", function() {
    updateSliderHigh(this.value);
});

// Update on interactions
// document.querySelectorAll("input[type=checkbox]").forEach(cb => {
//     cb.addEventListener("change", updatePlot);
// });
document.querySelectorAll("input[name=systemType]").forEach(rb => {
    rb.addEventListener("change", updatePlot);
});
document.querySelectorAll("input[name=defuzz]").forEach(rb => {
    rb.addEventListener("change", updatePlot);
});

document.getElementById("cpu-select").addEventListener("change", updateCPUPower);
document.getElementById("cpu-power").addEventListener("input", updatePlot);
document.getElementById("cores").addEventListener("input", updatePlot);

document.getElementById("gpu-select").addEventListener("change", updateGPUPower);
document.getElementById("gpu-power").addEventListener("input", updatePlot);
document.getElementById("number-gpu").addEventListener("input", updatePlot);

document.getElementById("metric").addEventListener("change", updatePlot);
document.getElementById("perf").addEventListener("input", updatePlot);
document.getElementById("energy").addEventListener("input", updatePlot);

// document.getElementById("input-file").addEventListener("change", updatePlot);

// Initial plot
Promise.all([
    loadCPUs(),
    loadGPUs(),
    loadPerformanceData()
]).then(() => updatePlot());