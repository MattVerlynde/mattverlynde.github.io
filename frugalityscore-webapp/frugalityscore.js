/* ════════════════════════════════════════════════
   THEME
════════════════════════════════════════════════ */
let dark = false;
function toggleTheme() {
  dark = !dark;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.querySelector('.theme-toggle').textContent = dark ? '☀ Light' : '☽ Dark';
  refreshPlotlyTheme();
}

/* ════════════════════════════════════════════════
   DATA LOADING
════════════════════════════════════════════════ */
let performanceData = {};

async function loadPerformanceData() {
  const response = await fetch('../frugalityscore/src/data/referencePerformance.json');
  performanceData = await response.json();
  const metricSelect = document.getElementById("metric");
  Object.keys(performanceData.performance_minmax).forEach((metric, index) => {
    const option = document.createElement("option");
    // for display, the name of the metric is looked up in the performance_names mapping; the value remains the original metric key for internal use
    option.value = metric; option.textContent = performanceData.performance_names[metric];
    if (index === 0) option.selected = true;
    metricSelect.appendChild(option);
  });
}

async function loadCPUs() {
  const response = await fetch('../frugalityscore/src/data/CPUs.csv');
  const text = await response.text();
  const lines = text.split(/\r?\n/).slice(1);
  const sel = document.getElementById("cpu-select");
  const def = document.createElement("option");
  def.value='DEFAULT'; def.textContent='DEFAULT'; def.dataset.TDP_per_core=6; def.selected=true;
  sel.appendChild(def);
  lines.forEach(line => {
    if (!line.trim()) return;
    const cols = line.split(',');
    const opt = document.createElement("option");
    opt.value = cols[0]; opt.textContent = cols[0]; opt.dataset.TDP_per_core = parseFloat(cols[3])||1;
    sel.appendChild(opt);
  });
}

async function loadGPUs() {
  const response = await fetch('../frugalityscore/src/data/GPUs.csv');
  const text = await response.text();
  const lines = text.split(/\r?\n/).slice(1);
  const sel = document.getElementById("gpu-select");
  const def = document.createElement("option");
  def.value='DEFAULT'; def.textContent='DEFAULT'; def.dataset.TDP_per_core=6; def.selected=true;
  sel.appendChild(def);
  lines.forEach(line => {
    if (!line.trim()) return;
    const cols = line.split(',');
    const opt = document.createElement("option");
    opt.value = cols[0]; opt.textContent = cols[0]; opt.dataset.TDP_per_core = parseFloat(cols[3])||1;
    sel.appendChild(opt);
  });
}

/* ════════════════════════════════════════════════
   FUZZY MATH (original engine)
════════════════════════════════════════════════ */
function smf(x,[a,b])   { if(a===b&&x===a)return 1; if(x<=a)return 0; if(x>=b)return 1; return (b===a)?1:(x-a)/(b-a); }
function zmf(x,[a,b])   { if(a===b&&x===a)return 1; if(x<=a)return 1; if(x>=b)return 0; return (b===a)?1:1-(x-a)/(b-a); }
function trimf(x,[a,b,c]){ if(a===b&&x===a)return 1; if(b===c&&x===c)return 1; if(x<=a||x>=c)return 0; if(x===b)return 1; if(x<b)return(b===a)?1:(x-a)/(b-a); return(c===b)?1:(c-x)/(c-b); }
function trapmf(x,[a,b,c,d]){ if(b===a&&x===a)return 1; if(c===d&&x===d)return 1; if(x<=a||x>=d)return 0; if(x>=b&&x<=c)return 1; if(x>a&&x<b)return(b===a)?1:(x-a)/(b-a); return(d===c)?1:(d-x)/(d-c); }

function computeMembership(metric, x) {
  const funcs = performanceData.performance_functions[metric];
  const params = performanceData.performance_params[metric];
  return funcs.map((f,i) => f==='trimf' ? trimf(x,params[i]) : trapmf(x,params[i]));
}

function computeEnergyMembership(cpuFactor,cores,gpuFactor,ngpu,tl,tm,th,energy) {
  const power = cpuFactor*cores + gpuFactor*ngpu;
  return [zmf(energy,[power*tl,power*tm]), trimf(energy,[power*tl,power*tm,power*th]), smf(energy,[power*tm,power*th])];
}

function computePerfMembership(metric, perf) { return computeMembership(metric, perf); }

/* ════════════════════════════════════════════════
   RULE MATRIX STATE
════════════════════════════════════════════════ */
const OUTPUT_KEYS   = ['very_low','low','medium','high','very_high'];
const OUTPUT_LABELS_MAP = {very_low:'very low',low:'low',medium:'medium',high:'high',very_high:'very high'};
const LEVEL_CLASS   = {very_low:'lvl-vl',low:'lvl-lo',medium:'lvl-me',high:'lvl-hi',very_high:'lvl-vh'};
const LEVEL_COLORS  = {
  very_low: {bg:'#f2c2fe',text:'#440154'},
  low:      {bg:'#b8c4e0',text:'#3b528b'},
  medium:   {bg:'#a8eae7',text:'#21918c'},
  high:     {bg:'#bbe7bc',text:'#4DC151'},
  very_high:{bg:'#fff7c1',text:'#eeca00'}
};

const PRESETS = {
  normal:        { label:'Normal',          note:'Standard — balances energy and performance symmetrically.',
    m: [['very_low','low','medium'],['low','medium','high'],['medium','high','very_high']] },
  lowcost:       { label:'Low cost',        note:'Energy savings dominate; performance is secondary.',
    m: [['very_low','low','medium'],['medium','high','very_high'],['high','very_high','very_high']] },
  perf:          { label:'Performance-first',note:'High performance always lifts score regardless of energy.',
    m: [['very_low','medium','high'],['low','high','very_high'],['medium','very_high','very_high']] },
  discriminative:{ label:'Discriminative',  note:'Avoids medium scores; promotes extreme frugality outputs.',
    m: [['very_low','very_low','medium'],['very_low','medium','very_high'],['medium','very_high','very_high']] },
  balanced:      { label:'Balanced',        note:'Avoids extremes; promotes medium scores across conditions.',
    m: [['low','medium','medium'],['medium','medium','high'],['medium','high','high']] }
};

const PRESETS_ML = {
  normal:        { label:'Normal',          note:'Standard — balances energy and performance symmetrically.',
    m: [[['very_low','low','medium'],['low','medium','high'],['medium','high','very_high']],[['very_low','very_low','low'],['very_low','low','medium'],['low','medium','high']],[['very_low','very_low','very_low'],['very_low','very_low','low'],['very_low','low','medium']]] },
  lowcost:       { label:'Low cost',        note:'Energy savings dominate; performance is secondary.',
    m: [[['very_low','low','medium'],['low','medium','high'],['medium','high','very_high']],[['very_low','very_low','low'],['very_low','low','medium'],['low','medium','high']],[['very_low','very_low','very_low'],['very_low','very_low','low'],['very_low','low','medium']]] },
  perf:          { label:'Performance-first',note:'High performance always lifts score regardless of energy.',
    m: [[['very_low','low','medium'],['low','medium','high'],['medium','high','very_high']],[['very_low','very_low','low'],['very_low','low','medium'],['low','medium','high']],[['very_low','very_low','very_low'],['very_low','very_low','low'],['very_low','low','medium']]] },
  discriminative:{ label:'Discriminative',  note:'Avoids medium scores; promotes extreme frugality outputs.',
    m: [[['very_low','low','medium'],['low','medium','high'],['medium','high','very_high']],[['very_low','very_low','low'],['very_low','low','medium'],['low','medium','high']],[['very_low','very_low','very_low'],['very_low','very_low','low'],['very_low','low','medium']]] },
  balanced:      { label:'Balanced',        note:'Avoids extremes; promotes medium scores across conditions.',
    m: [[['very_low','low','medium'],['low','medium','high'],['medium','high','very_high']],[['very_low','very_low','low'],['very_low','low','medium'],['low','medium','high']],[['very_low','very_low','very_low'],['very_low','very_low','low'],['very_low','low','medium']]] }
};

let activePreset = 'normal';
let ruleMatrix = JSON.parse(JSON.stringify(PRESETS.normal.m));
let ruleMatrixML = JSON.parse(JSON.stringify(PRESETS_ML.normal.m));

function applyPreset(name) {
  activePreset = name;
  if (PRESETS[name]) ruleMatrix = JSON.parse(JSON.stringify(PRESETS[name].m));
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset===name));
  const p = PRESETS[name];
  document.getElementById('matrix-note').innerHTML = p
    ? `<strong>${p.label}</strong> — ${p.note}`
    : 'Custom rule matrix — edited manually.';
  renderMatrixML();
  updatePlot();
}

function buildPresetButtons() {
  const row = document.getElementById('preset-row');
  [...Object.keys(PRESETS),'custom'].forEach(k => {
    const b = document.createElement('button');
    b.className = 'preset-btn' + (k===activePreset?' active':'');
    b.dataset.preset = k;
    b.textContent = PRESETS[k]?.label || 'Custom';
    if (k !== 'custom') b.onclick = () => applyPreset(k);
    row.appendChild(b);
  });
}

function renderMatrix() {
  const tbody = document.getElementById('matrix-tbody');
  tbody.innerHTML = '';
  const E_LABELS = ['E = high','E = medium','E = low'];
  for (let ei=0; ei<3; ei++) {
    const tr = document.createElement('tr');
    const th = document.createElement('td');
    th.className = 'row-label'; th.textContent = E_LABELS[ei];
    tr.appendChild(th);
    for (let pi=0; pi<3; pi++) {
      const td = document.createElement('td');
      const sel = document.createElement('select');
      sel.className = 'cell-select';
      sel.dataset.ei = ei; sel.dataset.pi = pi;
      OUTPUT_KEYS.forEach(k => {
        const opt = document.createElement('option');
        opt.value = k; opt.textContent = OUTPUT_LABELS_MAP[k];
        sel.appendChild(opt);
      });
      sel.value = ruleMatrix[ei][pi];
      styleCell(sel, ruleMatrix[ei][pi]);
      sel.addEventListener('change', function() {
        ruleMatrix[this.dataset.ei][this.dataset.pi] = this.value;
        styleCell(this, this.value);
        activePreset = 'custom';
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset==='custom'));
        document.getElementById('matrix-note').innerHTML = 'Custom rule matrix — edited manually.';
        updatePlot();
      });
      td.appendChild(sel); tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

function renderMatrixML() {
  const tbody = document.getElementById('matrix-tbody');
  tbody.innerHTML = '';
  const E_TRAIN_LABELS = ['E (train) = high','E (train) = medium','E (train) = low'];
  const E_TEST_LABELS = ['E (test) = high','E (test) = medium','E (test) = low'];
  for (let etri=0; etri<3; etri++) {
    for (let etei=0; etei<3; etei++) {
        const tr = document.createElement('tr');
        const th = document.createElement('td');
        th.className = 'row-label'; th.textContent = E_TEST_LABELS[etei];
        if (etri === 0) {
            th.textContent = E_TRAIN_LABELS[etri] + ' / ' + th.textContent;
            th.rowSpan = 3;
        }
        tr.appendChild(th);
        for (let pi=0; pi<3; pi++) {
        const td = document.createElement('td');
        const sel = document.createElement('select');
        sel.className = 'cell-select';
        sel.dataset.etei = etei; sel.dataset.etri = etri; sel.dataset.pi = pi;
        OUTPUT_KEYS.forEach(k => {
            const opt = document.createElement('option');
            opt.value = k; opt.textContent = OUTPUT_LABELS_MAP[k];
            sel.appendChild(opt);
        });
        sel.value = ruleMatrixML[etri][etei][pi];
        styleCell(sel, ruleMatrixML[etri][etei][pi]);
        sel.addEventListener('change', function() {
            ruleMatrixML[this.dataset.etri][this.dataset.etei][this.dataset.pi] = this.value;
            styleCell(this, this.value);
            activePreset = 'custom';
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset==='custom'));
            document.getElementById('matrix-note').innerHTML = 'Custom rule matrix — edited manually.';
            updatePlot();
        });
        td.appendChild(sel); tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
  }
}

function styleCell(sel, key) {
  const c = LEVEL_COLORS[key];
  sel.style.background = c.bg; sel.style.color = c.text; sel.style.borderColor = c.text+'55';
}

function getRules() {
  const eKeys = ['high','medium','low'];
  const pKeys = ['low','medium','high'];
  const rules = [];
  for (let ei=0; ei<3; ei++)
    for (let pi=0; pi<3; pi++)
      rules.push({ cond:(e,p)=>Math.min(e[eKeys[ei]],p[pKeys[pi]]), out:ruleMatrix[ei][pi], ant:`E=${eKeys[ei]} ∧ P=${pKeys[pi]}` });
  return rules;
}

function highlightFiringCells(e, p) {
  const eKeys = ['high','medium','low'];
  const pKeys = ['low','medium','high'];
  document.querySelectorAll('.cell-select').forEach(sel => {
    const str = Math.min(e[eKeys[+sel.dataset.ei]], p[pKeys[+sel.dataset.pi]]);
    sel.classList.toggle('firing', str > 0.001);
  });
}

/* ════════════════════════════════════════════════
   SCORE MF & AGGREGATION
════════════════════════════════════════════════ */
function scoreMFAt(x) {
  return [trimf(x,[0,0,25]),trimf(x,[0,25,50]),trimf(x,[25,50,75]),trimf(x,[50,75,100]),trimf(x,[75,100,100])];
}

function computeScoreMembership(rules, perfMem, energyMem) {
  const rules = [
    [0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1],
    [0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],
    [1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0]
  ];
  let sm = [0,0,0,0,0];
  for (let i=0; i<perfMem.length; i++)
    for (let j=0; j<energyMem.length; j++) {
      const str = Math.min(perfMem[i], energyMem[j]);
      for (let s=0; s<5; s++)
        sm[s] = Math.max(sm[s], Math.min(str, rules[j*energyMem.length+i][s]));
    }
  return sm;
}

function computeScoreMLMembership(rules, perfMem, energyTrainMem, energyTestMem) {
  const rules = [
    [0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],
    [0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,0,0,0],
    [1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]
  ];
  let sm = [0,0,0,0,0];
  for (let i=0; i<perfMem.length; i++)
    for (let j=0; j<energyTrainMem.length; j++)
      for (let k=0; k<energyTestMem.length; k++) {
        const str = Math.min(perfMem[i], energyTrainMem[j], energyTestMem[k]);
        const ruleIdx = (k*perfMem.length + j)*energyTrainMem.length + i;
        for (let s=0; s<5; s++)
          sm[s] = Math.max(sm[s], Math.min(str, rules[ruleIdx][s]));
      }
  return sm;
}

function aggregateOutput(scoreMem) {
  const xs = Array.from({length:101},(_,i)=>i);
  const ys = xs.map(x => {
    const mf = scoreMFAt(x);
    return Math.max(...mf.map((v,i)=>Math.min(v,scoreMem[i])));
  });
  return { xs, ys };
}

/* ════════════════════════════════════════════════
   DEFUZZIFICATION
════════════════════════════════════════════════ */
function defuzz(xs,ys,method) {
  switch(method) {
    case 'centroid': { let n=0,d=0; xs.forEach((x,i)=>{n+=x*ys[i];d+=ys[i];}); return d?n/d:0; }
    case 'bisector': { const tot=ys.reduce((a,b)=>a+b,0); let acc=0; for(let i=0;i<xs.length;i++){acc+=ys[i];if(acc>=tot/2)return xs[i];} return xs[xs.length-1]; }
    case 'som': { const mx=Math.max(...ys); return xs[ys.indexOf(mx)]; }
    case 'mom': { const mx=Math.max(...ys); const cc=xs.filter((_,i)=>ys[i]===mx); return cc.reduce((a,b)=>a+b,0)/cc.length; }
    case 'lom': { const mx=Math.max(...ys); for(let i=xs.length-1;i>=0;i--)if(ys[i]===mx)return xs[i]; return 0; }
    default: return 0;
  }
}

/* ════════════════════════════════════════════════
   RULE-BASED FIS ENGINE (using matrix)
════════════════════════════════════════════════ */
function runMatrixFIS(perfMem, energyMem) {
  const rules = getRules();
  const eKeys = ['high','medium','low'];
  const pKeys = ['low','medium','high'];
  const eMem  = {high:energyMem[2],medium:energyMem[1],low:energyMem[0]};
  const pMem  = {low:perfMem[0],medium:perfMem[1],high:perfMem[2]};
  const fired = rules.map(r => ({ strength:r.cond(eMem,pMem), out:r.out, ant:r.ant }));

  // aggregate
  const xs = Array.from({length:101},(_,i)=>i);
  const ys = xs.map(x => {
    const mf = scoreMFAt(x);
    return fired.reduce((acc,f)=>{
      const outIdx = OUTPUT_KEYS.indexOf(f.out);
      return Math.max(acc, Math.min(f.strength, mf[outIdx]));
    }, 0);
  });
  return { fired, xs, ys };
}

// function runMatrixFISML(perfMem, energyTrainMem, energyTestMem) {
//   const rules = getRules();
//   const eKeys = ['high','medium','low'];
//   const pKeys = ['low','medium','high'];
//   const eTrainMem  = {high:energyTrainMem[2],medium:energyTrainMem[1],low:energyTrainMem[0]};
//   const eTestMem   = {high:energyTestMem[2],medium:energyTestMem[1],low:energyTestMem[0]};
//   const pMem  = {low:perfMem[0],medium:perfMem[1],high:perfMem[2]};
//   const fired = rules.map(r => ({ strength:r.cond(eTrainMem,eTestMem,pMem), out:r.out, ant:r.ant }));

//   // aggregate
//   const xs = Array.from({length:101},(_,i)=>i);
//   const ys = xs.map(x => {
//     const mf = scoreMFAt(x);
//     return fired.reduce((acc,f)=>{
//       const outIdx = OUTPUT_KEYS.indexOf(f.out);
//       return Math.max(acc, Math.min(f.strength, mf[outIdx]));
//     }, 0);
//   });
//   return { fired, xs, ys };
// }

/* ════════════════════════════════════════════════
   PLOTLY HELPERS
════════════════════════════════════════════════ */
const PLOTLY_COLORS = ['#f10000','#164cff','#00ad1d','#d300fd','#00f3e7'];
const SCORE_COLORS  = ['#440154','#3b528b','#21918c','#4DC151','#eeca00'];

function plotlyLayout(xTitle, yTitle, extra={}) {
  const gridColor = dark ? '#2a2a24' : '#eae9e3';
  const fontColor = dark ? '#9a9890' : '#9a9890';
  return {
    margin:{t:10,r:10,b:40,l:40},
    xaxis:{title:{text:xTitle,font:{size:11,color:fontColor}},gridcolor:gridColor,tickfont:{size:10,color:fontColor},color:fontColor},
    yaxis:{title:{text:yTitle,font:{size:11,color:fontColor}},gridcolor:gridColor,tickfont:{size:10,color:fontColor},range:[0,1.05],color:fontColor},
    paper_bgcolor:'rgba(0,0,0,0)',
    plot_bgcolor:'rgba(0,0,0,0)',
    showlegend:true,
    legend:{font:{size:10,color:fontColor},bgcolor:'rgba(0,0,0,0)'},
    ...extra
  };
}

function refreshPlotlyTheme() { updatePlot(); }

const plotlyConfig = {responsive:true, displayModeBar:false};

function traceLine(x, y, name, color) {
  return {x,y,name,mode:'lines',line:{color,width:1.8},type:'scatter'};
}

/* ════════════════════════════════════════════════
   SCORE COLOR
════════════════════════════════════════════════ */
function getScoreInfo(s) {
  if(s<20) return {label:'very low', cls:'lvl-vl', bar:LEVEL_COLORS.very_low.text};
  if(s<40) return {label:'low',      cls:'lvl-lo', bar:LEVEL_COLORS.low.text};
  if(s<60) return {label:'medium',   cls:'lvl-me', bar:LEVEL_COLORS.medium.text};
  if(s<80) return {label:'high',     cls:'lvl-hi', bar:LEVEL_COLORS.high.text};
  return          {label:'very high',cls:'lvl-vh', bar:LEVEL_COLORS.very_high.text};
}

/* ════════════════════════════════════════════════
   SCORE CALCULATION
════════════════════════════════════════════════ */

function calcScore({ perfMem, energyMem, energyTestMem = null, defuzzMethod }) {
  let fired, xs, ys;

  if (energyTestMem) {
    // ML mode — 3-input rules from ruleMatrixML
    ({ fired, xs, ys } = runMatrixFISML(perfMem, energyMem, energyTestMem));
  } else {
    // Standard mode — 2-input rules from ruleMatrix
    ({ fired, xs, ys } = runMatrixFIS(perfMem, energyMem));
  }

  // Per-output-level membership strengths (for gauges)
  const scoreMem = OUTPUT_KEYS.map(key =>
    fired.reduce((acc, f) => f.out === key ? Math.max(acc, f.strength) : acc, 0)
  );

  const score = defuzz(xs, ys, defuzzMethod);
  return { scoreMem, xs, ys, score, fired };
}

function runMatrixFIS(perfMem, energyMem) {
  const rules = getRules();
  const eMem = { high: energyMem[2], medium: energyMem[1], low: energyMem[0] };
  const pMem = { low: perfMem[0], medium: perfMem[1], high: perfMem[2] };
  const fired = rules.map(r => ({ strength: r.cond(eMem, pMem), out: r.out, ant: r.ant }));

  const xs = Array.from({ length: 101 }, (_, i) => i);
  const ys = xs.map(x => {
    const mf = scoreMFAt(x);
    return fired.reduce((acc, f) => {
      const outIdx = OUTPUT_KEYS.indexOf(f.out);
      return Math.max(acc, Math.min(f.strength, mf[outIdx]));
    }, 0);
  });
  return { fired, xs, ys };
}

function getRulesML() {
  const eKeys = ['high', 'medium', 'low'];
  const pKeys = ['low', 'medium', 'high'];
  const rules = [];
  for (let etri = 0; etri < 3; etri++)
    for (let etei = 0; etei < 3; etei++)
      for (let pi = 0; pi < 3; pi++)
        rules.push({
          cond: (eTr, eTe, p) => Math.min(eTr[eKeys[etri]], eTe[eKeys[etei]], p[pKeys[pi]]),
          out: ruleMatrixML[etri][etei][pi],
          ant: `ETr=${eKeys[etri]} ∧ ETe=${eKeys[etei]} ∧ P=${pKeys[pi]}`
        });
  return rules;
}

function runMatrixFISML(perfMem, energyTrainMem, energyTestMem) {
  const rules = getRulesML();
  const eTrainMem = { high: energyTrainMem[2], medium: energyTrainMem[1], low: energyTrainMem[0] };
  const eTestMem  = { high: energyTestMem[2],  medium: energyTestMem[1],  low: energyTestMem[0]  };
  const pMem      = { low: perfMem[0], medium: perfMem[1], high: perfMem[2] };
  const fired = rules.map(r => ({ strength: r.cond(eTrainMem, eTestMem, pMem), out: r.out, ant: r.ant }));

  const xs = Array.from({ length: 101 }, (_, i) => i);
  const ys = xs.map(x => {
    const mf = scoreMFAt(x);
    return fired.reduce((acc, f) => {
      const outIdx = OUTPUT_KEYS.indexOf(f.out);
      return Math.max(acc, Math.min(f.strength, mf[outIdx]));
    }, 0);
  });
  return { fired, xs, ys };
}

/* ════════════════════════════════════════════════
   MAIN UPDATE
════════════════════════════════════════════════ */
function updatePlot() {
  const systemType = document.querySelector('input[name="systemType"]:checked')?.value;
  const metric     = document.getElementById("metric").value;
  if (!performanceData.performance_minmax || !metric) return;

  const [minVal,maxVal] = performanceData.performance_minmax[metric];
  const cpuFactor = parseFloat(document.getElementById("cpu-power").value)||1;
  const cores     = parseInt(document.getElementById("cores").value)||1;
  const gpuFactor = parseFloat(document.getElementById("gpu-power").value)||1;
  const ngpu      = parseInt(document.getElementById("number-gpu").value)||0;
  const tl        = parseFloat(document.getElementById("energy_low").value)||0;
  const tm        = parseFloat(document.getElementById("energy_medium").value)||0;
  const th        = parseFloat(document.getElementById("energy_high").value)||0;

  const perf   = parseFloat(document.getElementById("perf").value)||0;
  const safeP  = Math.max(minVal, Math.min(maxVal, perf));
  const energy = parseFloat(document.getElementById("energy").value)||0;
  const safeE  = Math.max(0, energy);

  const perfMem   = computePerfMembership(metric, safeP);
  const energyMem = computeEnergyMembership(cpuFactor,cores,gpuFactor,ngpu,tl,tm,th,safeE);
  const rules = getRules();

  // // ML mode
  // let scoreMem;
  // let safeEt=0, tlt=0, tmt=0, tht=0;
  // const isML = systemType==='ML';
  // document.getElementById("energy_control_test").style.display = isML?'block':'none';
  // document.getElementById("energy_input_test").style.display   = isML?'block':'none';
  // document.getElementById("mf-test-card").style.display        = isML?'block':'none';

  // if (isML) {
  //   const et = parseFloat(document.getElementById("energy_test").value)||0;
  //   safeEt = Math.max(0, et);
  //   tlt = parseFloat(document.getElementById("energy_low_test").value)||0;
  //   tmt = parseFloat(document.getElementById("energy_medium_test").value)||0;
  //   tht = parseFloat(document.getElementById("energy_high_test").value)||0;
  //   const energyTestMem = computeEnergyMembership(cpuFactor,cores,gpuFactor,ngpu,tlt,tmt,tht,safeEt);
  //   scoreMem = computeScoreMLMembership(rules, perfMem, energyMem, energyTestMem);
  // } else {
  //   scoreMem = computeScoreMembership(rules, perfMem, energyMem);
  // }

  // // Aggregate & defuzz
  // const defuzzMethod = document.getElementById("defuzz-select").value;
  // const { xs, ys } = aggregateOutput(scoreMem);
  // const score = defuzz(xs, ys, defuzzMethod);

  // // Also run matrix FIS for rule activations display
  // const matrixResult = runMatrixFIS(perfMem, energyMem);

  const defuzzMethod = document.getElementById("defuzz-select").value;
  const { scoreMem, xs, ys, score, fired } = calcScore({
    perfMem,
    energyMem,
    energyTestMem: isML
      ? computeEnergyMembership(cpuFactor, cores, gpuFactor, ngpu, tlt, tmt, tht, safeEt)
      : null,
    defuzzMethod
  });

  // ── Update score card ──
  const info = getScoreInfo(score);
  document.getElementById("score-val").textContent = score.toFixed(1);
  const badge = document.getElementById("score-badge");
  badge.textContent = info.label;
  badge.className = 'score-badge ' + info.cls;

  // ── MF cards ──
  const eLow = zmf(safeE,[tl*( cpuFactor*cores+gpuFactor*ngpu),tm*(cpuFactor*cores+gpuFactor*ngpu)]);
  document.getElementById("e-low").textContent  = energyMem[0].toFixed(2);
  document.getElementById("e-med").textContent  = energyMem[1].toFixed(2);
  document.getElementById("e-high").textContent = energyMem[2].toFixed(2);
  const pm = perfMem;
  document.getElementById("p-low").textContent  = (pm[0]||0).toFixed(2);
  document.getElementById("p-med").textContent  = (pm[1]||0).toFixed(2);
  document.getElementById("p-high").textContent = (pm[2]||0).toFixed(2);

  // ── Gauges ──
  const gaugeWrap = document.getElementById("output-gauges");
  gaugeWrap.innerHTML = '';
  const scoreLabels = ['very low','low','medium','high','very high'];
  scoreMem.forEach((v,i) => {
    const pct = Math.round(v*100);
    const c = LEVEL_COLORS[OUTPUT_KEYS[i]];
    gaugeWrap.innerHTML += `<div class="gauge-card">
      <div class="gauge-label">${scoreLabels[i]}</div>
      <div class="gauge-bar-wrap"><div class="gauge-bar" style="width:${pct}%;background:${c.text}"></div></div>
      <div class="gauge-pct">${pct}%</div>
    </div>`;
  });

  // ── Rule activations ──
  const ruleList = document.getElementById("rule-act-list");
  ruleList.innerHTML = '';
  matrixResult.fired.forEach(f => {
    const pct = Math.round(f.strength*100);
    const c   = LEVEL_COLORS[f.out];
    ruleList.innerHTML += `<div class="rule-row">
      <span class="rule-ant">${f.ant}</span>
      <div class="rule-bar-wrap"><div class="rule-bar-fill" style="width:${pct}%"></div></div>
      <span class="rule-cons" style="color:${c.text}">${pct}%</span>
    </div>`;
  });

  // highlight matrix cells
  const eMem2 = {high:energyMem[2],medium:energyMem[1],low:energyMem[0]};
  const pMem2 = {low:pm[0]||0,medium:pm[1]||0,high:pm[2]||0};
  highlightFiringCells(eMem2, pMem2);

  // ── Aggregated plot ──
  const scoreXs = Array.from({length:101},(_,i)=>i);
  const aggTrace = {
    x:scoreXs, y:ys, name:'Aggregated', mode:'lines',
    fill:'tozeroy', fillcolor: dark?'rgba(82,183,136,0.15)':'rgba(45,106,79,0.1)',
    line:{color:'#2d6a4f',width:1.8}, type:'scatter'
  };
  const defuzzLine = {
    x:[score,score], y:[0,1], name:'Defuzzified',
    mode:'lines', line:{color:'#c44536',width:2,dash:'dot'}, type:'scatter'
  };
  const aggLayout = {
    ...plotlyLayout('Score','μ'),
    yaxis:{...plotlyLayout('','μ').yaxis, range:[0,1.05]},
    annotations:[{x:score,y:1.02,text:score.toFixed(1),showarrow:false,font:{color:'#c44536',size:11},yanchor:'bottom'}]
  };
  Plotly.react('plot_agg', [aggTrace, defuzzLine], aggLayout, plotlyConfig);

  // ── MF Tab: Performance ──
  const step = (maxVal-minVal)/100;
  const perfX = Array.from({length:101},(_,i)=>minVal+i*step);
  const funcs = performanceData.performance_functions[metric];
  const mfColors = PLOTLY_COLORS;
  const perfTraces = funcs.map((f,fi) => {
    const label = funcs.length===3?['low','medium','high'][fi]:funcs.length===2?['low','high'][fi]:`set ${fi+1}`;
    return traceLine(perfX, perfX.map(x=>computeMembership(metric,x)[fi]), label, mfColors[fi]);
  });
  perfTraces.push({x:[safeP,safeP],y:[0,1],mode:'lines',line:{dash:'dash',color:'#c44536',width:1.5},showlegend:false,name:'input',type:'scatter'});
  Plotly.react('plot_membership_perf', perfTraces, plotlyLayout(performanceData.performance_names[metric],'μ'), plotlyConfig);
  document.getElementById('mf-metric-chip').textContent = performanceData.performance_names[metric];

  // ── MF Tab: Energy ──
  const power = cpuFactor*cores + gpuFactor*ngpu;
  const maxE = Math.max(safeE, power*100, power*th*1.1)||100;
  const eStp = maxE/200;
  const energyX = Array.from({length:201},(_,i)=>i*eStp);
  const eTraces = [
    traceLine(energyX, energyX.map(x=>zmf(x,[power*tl,power*tm])), 'low', mfColors[0]),
    traceLine(energyX, energyX.map(x=>trimf(x,[power*tl,power*tm,power*th])), 'medium', mfColors[1]),
    traceLine(energyX, energyX.map(x=>smf(x,[power*tm,power*th])), 'high', mfColors[2]),
  ];
  eTraces.push({x:[safeE,safeE],y:[0,1],mode:'lines',line:{dash:'dash',color:'#c44536',width:1.5},showlegend:false,type:'scatter'});
  Plotly.react('plot_membership_energy', eTraces, plotlyLayout('Energy (J)','μ'), plotlyConfig);

  // ── MF Tab: Energy test ──
  if (isML) {
    const maxEt = Math.max(safeEt, power*100, power*tht*1.1)||100;
    const eStpt = maxEt/200;
    const energyXt = Array.from({length:201},(_,i)=>i*eStpt);
    const eTestTraces = [
      traceLine(energyXt, energyXt.map(x=>zmf(x,[power*tlt,power*tmt])), 'low', mfColors[0]),
      traceLine(energyXt, energyXt.map(x=>trimf(x,[power*tlt,power*tmt,power*tht])), 'medium', mfColors[1]),
      traceLine(energyXt, energyXt.map(x=>smf(x,[power*tmt,power*tht])), 'high', mfColors[2]),
    ];
    eTestTraces.push({x:[safeEt,safeEt],y:[0,1],mode:'lines',line:{dash:'dash',color:'#c44536',width:1.5},showlegend:false,type:'scatter'});
    Plotly.react('plot_membership_energy_test', eTestTraces, plotlyLayout('Energy test (J)','μ'), plotlyConfig);
  }

  // ── MF Tab: Score output ──
  const sLabels=['very low','low','medium','high','very high'];
  const scoreTraces = sLabels.map((lbl,i) => traceLine(scoreXs, scoreXs.map(x=>scoreMFAt(x)[i]), lbl, SCORE_COLORS[i]));
  Plotly.react('plot_membership_score', scoreTraces, plotlyLayout('Score','μ'), plotlyConfig);
}

/* ════════════════════════════════════════════════
   SLIDER HELPERS
════════════════════════════════════════════════ */
function updateSliderLow(v, suf='') {
  document.getElementById("energy_low"+suf).value = v;
  document.getElementById("energyValueLow"+suf).value = v;
  if (+v > +document.getElementById("energy_medium"+suf).value) updateSliderMedium(v, suf);
  if (!document.getElementById("input-file").files.length) updatePlot();
  else readUploadFile({target:{files:[document.getElementById("input-file").files[0]]}});
}
function updateSliderMedium(v, suf='') {
  document.getElementById("energy_medium"+suf).value = v;
  document.getElementById("energyValueMedium"+suf).value = v;
  if (+v > +document.getElementById("energy_high"+suf).value) updateSliderHigh(v, suf);
  if (+v < +document.getElementById("energy_low"+suf).value)  updateSliderLow(v, suf);
  if (!document.getElementById("input-file").files.length) updatePlot();
  else readUploadFile({target:{files:[document.getElementById("input-file").files[0]]}});
}
function updateSliderHigh(v, suf='') {
  document.getElementById("energy_high"+suf).value = v;
  document.getElementById("energyValueHigh"+suf).value = v;
  const el = document.getElementById("energy_high"+suf);
  if (+v >= +el.max) el.max = +v * 1.2;
  if (+v < +document.getElementById("energy_medium"+suf).value) updateSliderMedium(v, suf);
  if (!document.getElementById("input-file").files.length) updatePlot();
  else readUploadFile({target:{files:[document.getElementById("input-file").files[0]]}});
}

/* ════════════════════════════════════════════════
   CSV UPLOAD
════════════════════════════════════════════════ */
// function computeScore(perf, energy) {
//   const metric = document.getElementById("metric").value;
//   const cpuFactor = parseFloat(document.getElementById("cpu-power").value)||1;
//   const cores     = parseInt(document.getElementById("cores").value)||1;
//   const gpuFactor = parseFloat(document.getElementById("gpu-power").value)||1;
//   const ngpu      = parseInt(document.getElementById("number-gpu").value)||0;
//   const tl=parseFloat(document.getElementById("energy_low").value)||0;
//   const tm=parseFloat(document.getElementById("energy_medium").value)||0;
//   const th=parseFloat(document.getElementById("energy_high").value)||0;
//   const pm = computePerfMembership(metric, perf);
//   const em = computeEnergyMembership(cpuFactor,cores,gpuFactor,ngpu,tl,tm,th,energy);
//   const sm = computeScoreMembership(pm, em);
//   const {xs,ys} = aggregateOutput(sm);
//   return defuzz(xs,ys,document.getElementById("defuzz-select").value);
// }

function computeScore(perf, energy) {
  const metric    = document.getElementById("metric").value;
  const cpuFactor = parseFloat(document.getElementById("cpu-power").value) || 1;
  const cores     = parseInt(document.getElementById("cores").value) || 1;
  const gpuFactor = parseFloat(document.getElementById("gpu-power").value) || 1;
  const ngpu      = parseInt(document.getElementById("number-gpu").value) || 0;
  const tl = parseFloat(document.getElementById("energy_low").value)    || 0;
  const tm = parseFloat(document.getElementById("energy_medium").value) || 0;
  const th = parseFloat(document.getElementById("energy_high").value)   || 0;

  const perfMem   = computePerfMembership(metric, perf);
  const energyMem = computeEnergyMembership(cpuFactor, cores, gpuFactor, ngpu, tl, tm, th, energy);
  const { score } = calcScore({
    perfMem,
    energyMem,
    defuzzMethod: document.getElementById("defuzz-select").value
  });
  return score;
}

function readUploadFile(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result.trim();
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return;
    const headers = lines[0].split(',').map(h=>h.trim());
    const perfIdx  = headers.indexOf("perf");
    const energyIdx= headers.indexOf("energy");
    const groupIdx = headers.indexOf("group");
    if (perfIdx===-1 || energyIdx===-1) return;

    const perfs   = lines.slice(1).map(l=>parseFloat(l.split(',')[perfIdx]));
    const energies= lines.slice(1).map(l=>parseFloat(l.split(',')[energyIdx]));
    const groups  = lines.slice(1).map(l=>l.split(',')[groupIdx]||'default');

    const lastLine = lines[lines.length-1].split(',');
    document.getElementById("perf").value   = parseFloat(lastLine[perfIdx])||0;
    document.getElementById("energy").value = parseFloat(lastLine[energyIdx])||0;
    updatePlot();

    const scores = perfs.map((p,i)=>computeScore(p,energies[i]));
    const grouped = {};
    groups.forEach((g,i)=>{ if(!grouped[g])grouped[g]=[]; grouped[g].push(scores[i]); });
    const means = Object.values(grouped).map(s=>s.reduce((a,b)=>a+b,0)/s.length);
    const stds  = Object.values(grouped).map(s=>{
      const m=s.reduce((a,b)=>a+b,0)/s.length;
      return Math.sqrt(s.map(x=>(x-m)**2).reduce((a,b)=>a+b,0)/s.length);
    });
    const barTrace = {
      x:Object.keys(grouped), y:means, type:'bar',
      marker:{color:means.map(s=>getScoreInfo(s).bar)},
      error_y:{type:'data',array:stds,visible:true,color:'var(--text3)',thickness:1.5,width:4}
    };
    document.getElementById("bar-card").style.display = 'block';
    Plotly.react('bar_scores_display', [barTrace],
      {...plotlyLayout('Group','Score'),yaxis:{...plotlyLayout('','').yaxis,range:[0,100]}},
      plotlyConfig);
  };
  reader.readAsText(file);
}

/* ════════════════════════════════════════════════
   TAB SWITCHING
════════════════════════════════════════════════ */
function switchTab(name) {
//   ['result','mf','rules','params'].forEach(t=>{
  ['result','mf','rules'].forEach(t=>{
    document.getElementById('panel-'+t).classList.toggle('active', t===name);
    document.getElementById('tab-'+t).classList.toggle('active',   t===name);
  });
}

/* ════════════════════════════════════════════════
   EVENT WIRING
════════════════════════════════════════════════ */
document.getElementById('input-file').addEventListener('change', readUploadFile);

['energy_low','energy_medium','energy_high'].forEach(id=>{
  const suf = '';
  document.getElementById(id).addEventListener('input', function(){
    if(id==='energy_low')    updateSliderLow(this.value, suf);
    if(id==='energy_medium') updateSliderMedium(this.value, suf);
    if(id==='energy_high')   updateSliderHigh(this.value, suf);
  });
});
['energyValueLow','energyValueMedium','energyValueHigh'].forEach(id=>{
  document.getElementById(id).addEventListener('input', function(){
    if(id.includes('Low'))    updateSliderLow(this.value);
    if(id.includes('Medium')) updateSliderMedium(this.value);
    if(id.includes('High'))   updateSliderHigh(this.value);
  });
});
['energy_low_test','energy_medium_test','energy_high_test'].forEach(id=>{
  document.getElementById(id).addEventListener('input', function(){
    if(id.includes('low'))    updateSliderLow(this.value,'_test');
    if(id.includes('medium')) updateSliderMedium(this.value,'_test');
    if(id.includes('high'))   updateSliderHigh(this.value,'_test');
  });
});
['energyValueLow_test','energyValueMedium_test','energyValueHigh_test'].forEach(id=>{
  document.getElementById(id).addEventListener('input', function(){
    if(id.includes('Low'))    updateSliderLow(this.value,'_test');
    if(id.includes('Medium')) updateSliderMedium(this.value,'_test');
    if(id.includes('High'))   updateSliderHigh(this.value,'_test');
  });
});

document.querySelectorAll('input[name=systemType]').forEach(r=>r.addEventListener('change',updatePlot));
document.getElementById('defuzz-select').addEventListener('change', updatePlot);
document.getElementById('cpu-select').addEventListener('change', ()=>{
  const sel=document.getElementById('cpu-select');
  document.getElementById('cpu-power').value = sel.options[sel.selectedIndex].dataset.TDP_per_core||6;
  updatePlot();
});
document.getElementById('gpu-select').addEventListener('change', ()=>{
  const sel=document.getElementById('gpu-select');
  document.getElementById('gpu-power').value = sel.options[sel.selectedIndex].dataset.TDP_per_core||6;
  updatePlot();
});
['cpu-power','cores','gpu-power','number-gpu','metric','perf','energy','energy_test']
  .forEach(id=>document.getElementById(id).addEventListener('input',updatePlot));

/* ════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════ */
buildPresetButtons();
renderMatrixML();
applyPreset('normal');

Promise.all([loadCPUs(), loadGPUs(), loadPerformanceData()])
  .then(()=>updatePlot())
  .catch(err=>console.error('Init failed:', err));