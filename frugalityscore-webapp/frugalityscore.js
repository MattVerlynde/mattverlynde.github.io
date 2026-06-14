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
   DATA AVAILABLE
════════════════════════════════════════════════ */


const textCPU = `model,TDP,n_cores,TDP_per_core,Release_year,source
A8-7680,45,4,11.3,,https://www.techpowerup.com/cpu-specs/
A9-9425 SoC,15,2,7.5,,https://www.techpowerup.com/cpu-specs/
AMD 7552,200,48,4.2,,https://www.amd.com/system/files/documents/AMD-EPYC-7002-Series-Datasheet.pdf
AMD EPYC 7251,120,8,15.0,,https://www.amd.com/en/products/cpu/amd-epyc-7251
AMD EPYC 7343,190,16,11.9,,https://www.amd.com/en/products/cpu/amd-epyc-7343
AMD EPYC 7513,200,32,6.3,,https://www.amd.com/en/products/cpu/amd-epyc-7513
AMD EPYC 7642,225,48,4.7,,https://www.techpowerup.com/cpu-specs/epyc-7642.c2247
AMD EPYC 7763,280,64,4.4,,https://www.amd.com/en/products/cpu/amd-epyc-7763 
AMD EPYC 7773X,280,64,4.4,,https://www.amd.com/en/products/cpu/amd-epyc-7773x 
AMD EPYC 7H12,280,64,4.4,,https://www.amd.com/en/product/9131 
AMD EPYC 7V73X,280,64,4.4,,https://wccftech.com/amd-epyc-7v73x-cpu-with-3d-v-cache-tested-milan-x-offers-impressive-cache-latency-better-boost-clocks-versus-standard-milan/
Any,,,12.0,,
Athlon 3000G,35,2,17.5,,https://www.techpowerup.com/cpu-specs/
Core 2 Quad Q6600,95,4,23.8,,https://www.techpowerup.com/cpu-specs/
Core i3-10100,65,4,16.3,,https://www.techpowerup.com/cpu-specs/
Core i3-10300,62,4,15.5,,https://www.techpowerup.com/cpu-specs/
Core i3-10320,91,4,22.8,,https://www.techpowerup.com/cpu-specs/
Core i3-10350K,91,4,22.8,,https://www.techpowerup.com/cpu-specs/
Core i3-9100,65,4,16.3,,https://www.techpowerup.com/cpu-specs/
Core i3-9100F,65,4,16.3,,https://www.techpowerup.com/cpu-specs/
Core i5-10400,65,6,10.8,,https://www.techpowerup.com/cpu-specs/
Core i5-10400F,65,6,10.8,,https://www.techpowerup.com/cpu-specs/
Core i5-10500,65,6,10.8,,https://www.techpowerup.com/cpu-specs/
Core i5-10600,65,6,10.8,,https://www.techpowerup.com/cpu-specs/
Core i5-10600K,95,6,15.8,,https://www.techpowerup.com/cpu-specs/
Core i5-1145G7,28,4,7.0,,https://www.intel.co.uk/content/www/uk/en/products/sku/208660/intel-core-i51145g7-processor-8m-cache-up-to-4-40-ghz-with-ipu/specifications.html
Core i5-3570K,77,4,19.3,,https://www.techpowerup.com/cpu-specs/
Core i5-4460,84,4,21.0,,https://ark.intel.com/content/www/us/en/ark/products/80817/intel-core-i5-4460-processor-6m-cache-up-to-3-40-ghz.html
Core i5-9400,65,6,10.8,,https://www.techpowerup.com/cpu-specs/
Core i5-9400F,65,6,10.8,,https://www.techpowerup.com/cpu-specs/
Core i5-9600KF,95,6,15.8,,https://www.techpowerup.com/cpu-specs/
Core i7-10700,65,8,8.1,,https://www.techpowerup.com/cpu-specs/
Core i7-10700K,125,8,15.6,,https://www.techpowerup.com/cpu-specs/
Core i7-4790,84,4,21.0,,https://www.intel.co.uk/content/www/uk/en/products/sku/80806/intel-core-i74790-processor-8m-cache-up-to-4-00-ghz/specifications.html
Core i7-4930K,130,6,21.7,,https://www.techpowerup.com/cpu-specs/
Core i7-6700K,95,4,23.8,,https://www.techpowerup.com/cpu-specs/
Core i7-8700K,95,6,15.8,,https://www.techpowerup.com/cpu-specs/
Core i7-9700F,65,8,8.1,,https://www.techpowerup.com/cpu-specs/
Core i7-9700K,95,8,11.9,,https://www.techpowerup.com/cpu-specs/
Core i9-10900K,125,10,12.5,,https://www.techpowerup.com/cpu-specs/
Core i9-10900KF,105,10,10.5,,https://www.techpowerup.com/cpu-specs/
Core i9-10900XE,165,10,16.5,,https://www.techpowerup.com/cpu-specs/
Core i9-10920XE,165,12,13.8,,https://www.techpowerup.com/cpu-specs/
Core i9-12900K,125,16,7.8,,https://ark.intel.com/content/www/us/en/ark/products/134599/intel-core-i912900k-processor-30m-cache-up-to-5-20-ghz.html
Core i9-9900K,95,8,11.9,,https://www.techpowerup.com/cpu-specs/
FX-6300,95,6,15.8,,https://www.techpowerup.com/cpu-specs/
FX-8350,125,8,15.6,,https://www.techpowerup.com/cpu-specs/
Rasberry Pi 4,6.4,4,1.6,,https://raspberrypi.stackexchange.com/questions/114239/pi-4-maximum-power-consumption 
Ryzen 3 2200G,65,4,16.3,,https://www.techpowerup.com/cpu-specs/
Ryzen 3 3200G,65,4,16.3,,https://www.techpowerup.com/cpu-specs/
Ryzen 3 3200U,15,2,7.5,,https://www.techpowerup.com/cpu-specs/
Ryzen 5 1600,65,6,10.8,,https://www.techpowerup.com/cpu-specs/
Ryzen 5 2600,65,6,10.8,,https://www.techpowerup.com/cpu-specs/
Ryzen 5 3400G,65,4,16.3,,https://www.techpowerup.com/cpu-specs/
Ryzen 5 3500U,15,4,3.8,,https://www.techpowerup.com/cpu-specs/
Ryzen 5 3600,65,6,10.8,,https://www.techpowerup.com/cpu-specs/
Ryzen 5 3600X,95,6,15.8,,https://www.techpowerup.com/cpu-specs/
Ryzen 7 2700X,105,8,13.1,,https://www.techpowerup.com/cpu-specs/
Ryzen 7 3700X,65,8,8.1,,https://www.techpowerup.com/cpu-specs/
Ryzen 7 3800X,105,8,13.1,,https://www.techpowerup.com/cpu-specs/
Ryzen 9 3900X,125,12,10.4,,https://www.techpowerup.com/cpu-specs/
Ryzen 9 3950X,105,16,6.6,,https://www.techpowerup.com/cpu-specs/
Ryzen Threadripper 2990WX,250,32,7.8,,https://www.techpowerup.com/cpu-specs/
Ryzen Threadripper 3990X,280,64,4.4,,https://www.techpowerup.com/cpu-specs/
Xeon E5-2650 v2,95,8,11.9,,https://www.techpowerup.com/cpu-specs/xeon-e5-2650-v2.c1661
Xeon E5-2660 v3,105,10,10.5,,https://ark.intel.com/content/www/us/en/ark/products/81706/intel-xeon-processor-e5-2660-v3-25m-cache-2-60-ghz.html
Xeon E5-2665,115,8,14.4,,https://ark.intel.com/content/www/us/en/ark/products/64597/intel-xeon-processor-e5-2665-20m-cache-2-40-ghz-8-00-gt-s-intel-qpi.html
Xeon E5-2670,115,8,14.4,,https://ark.intel.com/content/www/us/en/ark/products/64595/intel-xeon-processor-e5-2670-20m-cache-2-60-ghz-8-00-gt-s-intel-qpi.html
Xeon E5-2670 v2,115,10,11.5,,https://ark.intel.com/content/www/us/en/ark/products/75275/intel-xeon-processor-e5-2670-v2-25m-cache-2-50-ghz.html
Xeon E5-2680 v3,120,12,10.0,,https://www.intel.co.uk/content/www/uk/en/products/processors/xeon/e5-processors/e5-2680-v3.html
Xeon E5-2683 v4,120,16,7.5,,https://www.intel.co.uk/content/www/uk/en/products/processors/xeon/e5-processors/e5-2683-v4.html
Xeon E5-2690 v2,130,10,13.0,,https://ark.intel.com/content/www/us/en/ark/products/75279/intel-xeon-processor-e5-2690-v2-25m-cache-3-00-ghz.html
Xeon E5-2690 v3,135,12,11.3,,https://ark.intel.com/content/www/us/en/ark/products/81713/intel-xeon-processor-e5-2690-v3-30m-cache-2-60-ghz.html
Xeon E5-2695 v3,120,14,8.6,,https://www.techpowerup.com/cpu-specs/xeon-e5-2695-v3.c2894
Xeon E5-2695 v4,120,18,6.7,,https://ark.intel.com/content/www/us/en/ark/products/91316/intel-xeon-processor-e5-2695-v4-45m-cache-2-10-ghz.html
Xeon E5-2697 v4,145,18,8.1,,https://ark.intel.com/content/www/us/en/ark/products/91755/intel-xeon-processor-e5-2697-v4-45m-cache-2-30-ghz.html
Xeon E5-2699 v3,145,18,8.1,,https://ark.intel.com/content/www/us/en/ark/products/81061/intel-xeon-processor-e5-2699-v3-45m-cache-2-30-ghz.html
Xeon E5-2699 v4,145,22,6.6,,https://ark.intel.com/content/www/us/en/ark/products/91317/intel-xeon-processor-e5-2699-v4-55m-cache-2-20-ghz.html
Xeon E5-4610 v4,105,10,10.5,,https://ark.intel.com/content/www/us/en/ark/products/93812/intel-xeon-processor-e5-4610-v4-25m-cache-1-80-ghz.html
Xeon E5-4620,95,8,11.9,,https://ark.intel.com/content/www/us/en/ark/products/64607/intel-xeon-processor-e5-4620-16m-cache-2-20-ghz-7-20-gt-s-intel-qpi.html
Xeon E5-4650L,115,8,14.4,,https://ark.intel.com/content/www/us/en/ark/products/64606/intel-xeon-processor-e5-4650l-20m-cache-2-60-ghz-8-00-gt-s-intel-qpi.html
Xeon E7-4850 v2,105,12,8.8,,https://ark.intel.com/content/www/us/en/ark/products/75248/intel-xeon-processor-e7-4850-v2-24m-cache-2-30-ghz.html
Xeon E7-8867 v3,165,16,10.3,,https://ark.intel.com/content/www/us/en/ark/products/84681/intel-xeon-processor-e7-8867-v3-45m-cache-2-50-ghz.html
Xeon E7-8880 v4,150,22,6.8,,https://www.intel.co.uk/content/www/uk/en/products/processors/xeon/e7-processors/e7-8880-v4.html
Xeon Gold 6142,150,16,9.4,,https://ark.intel.com/content/www/us/en/ark/products/120487/intel-xeon-gold-6142-processor-22m-cache-2-60-ghz.html
Xeon Gold 6148,150,20,7.5,,https://ark.intel.com/content/www/us/en/ark/products/120489/intel-xeon-gold-6148-processor-27-5m-cache-2-40-ghz.html
Xeon Gold 6248,150,20,7.5,,https://ark.intel.com/content/www/us/en/ark/products/192446/intel-xeon-gold-6248-processor-27-5m-cache-2-50-ghz.html
Xeon Gold 6252,150,24,6.3,,https://ark.intel.com/content/www/us/en/ark/products/192447/intel-xeon-gold-6252-processor-35-75m-cache-2-10-ghz.html
Xeon L5640 ,60,6,10.0,,https://ark.intel.com/content/www/us/en/ark/products/47926/intel-xeon-processor-l5640-12m-cache-2-26-ghz-5-86-gt-s-intel-qpi.html
Xeon Phi 5110P,225,60,3.8,,https://ark.intel.com/content/www/us/en/ark/products/71992/intel-xeon-phi-coprocessor-5110p-8gb-1-053-ghz-60-core.html
Xeon Platinum 8260,165,24,6.9,,https://www.intel.com/content/www/us/en/products/sku/192474/intel-xeon-platinum-8260-processor-35-75m-cache-2-40-ghz/specifications.html
Xeon Platinum 8268,205,24,8.5,,https://www.intel.com/content/www/us/en/products/sku/192481/intel-xeon-platinum-8268-processor-35-75m-cache-2-90-ghz/specifications.html
Xeon Platinum 9282,400,56,7.1,,https://www.techpowerup.com/cpu-specs/
Xeon X3430,95,4,23.8,,https://ark.intel.com/content/www/us/en/ark/products/42927/intel-xeon-processor-x3430-8m-cache-2-40-ghz.html
Xeon X5660,95,6,15.8,,https://ark.intel.com/content/www/us/en/ark/products/47921/intel-xeon-processor-x5660-12m-cache-2-80-ghz-6-40-gt-s-intel-qpi.html`;

const textGPU = `model,TDP,n_cores,TDP_per_core,Release_year,source
AMD RX480,150,,150,,techpowerup.com
Any,200,1,200,,
NVIDIA A100 40GB PCIe,250,,250,,https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/a100-80gb-datasheet-update-nvidia-us-1521051-r2-web.pdf
NVIDIA A100 80GB PCIe,300,,300,,https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/PB-10577-001_v02.pdf 
NVIDIA GTX 1080,180,,180,,techpowerup.com
NVIDIA GTX 1080 Ti,250,,250,,techpowerup.com
NVIDIA GTX TITAN X,250,,250,,techpowerup.com
NVIDIA Jetson AGX Xavier,30,,30,,https://www.techpowerup.com/gpu-specs/jetson-agx-xavier.c3232
NVIDIA RTX 2080,215,,215,,techpowerup.com
NVIDIA RTX 2080 Ti,250,,250,,techpowerup.com
NVIDIA Tesla K80,300,,300,,https://www.techpowerup.com/gpu-specs/tesla-k80.c2616
NVIDIA Tesla P100,250,,250,,https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/tesla-p100/pdf/nvidia-tesla-p100-PCIe-datasheet.pdf
NVIDIA Tesla P100 PCIe,250,,250,,techpowerup.com
NVIDIA Tesla P4,75,,75,,https://www.techpowerup.com/gpu-specs/tesla-p4.c2879
NVIDIA Tesla T4,70,,70,,https://www.techpowerup.com/gpu-specs/tesla-t4.c3316
NVIDIA Tesla V100,300,,300,,techpowerup.com
NVIDIA Tesla V100S,250,,250,,https://technical.city/en/video/Tesla-V100S-PCIe-32-GB
NVIDIA Titan V,250,,250,,techpowerup.com
NVIDIA TITAN X Pascal,250,,250,,techpowerup.com
TPU v2,280,,280,,http://arxiv.org/abs/2104.10350 
TPU v3,220,,220,,https://cloud.google.com/tpu/docs/v3
TPU v4,170,,170,,https://cloud.google.com/tpu/docs/system-architecture-tpu-vm`;

const performanceData = {
  "performance_functions": {
    "accuracy": ["trimf", "trimf", "trimf"],
    "precision": ["trimf", "trimf", "trimf"],
    "recall": ["trimf", "trimf", "trimf"],
    "f1": ["trimf", "trimf", "trimf"],
    "auc": ["trapmf", "trimf", "trimf"],
    "rand": ["trimf", "trimf", "trimf"],
    "adjusted_rand": ["trimf", "trimf", "trimf"],
    "silhouette": ["trapmf", "trimf", "trimf"],
    "calinski_harabasz": ["trapmf", "trimf", "trapmf"],
    "davies_bouldin": ["trapmf", "trimf", "trapmf"]
  },
  "performance_names": {
    "accuracy": "Accuracy",
    "precision": "Precision",
    "recall": "Recall",
    "f1": "F1-Score",
    "auc": "AUC",
    "rand": "Rand Index",
    "adjusted_rand": "Adjusted Rand Index",
    "silhouette": "Silhouette Score",
    "calinski_harabasz": "Calinski-Harabasz Index",
    "davies_bouldin": "Davies-Bouldin Index"
  },
  "performance_params": {
    "accuracy": [[0, 0, 0.5], [0, 0.5, 1], [0.5, 1, 1]],
    "precision": [[0, 0, 0.5], [0, 0.5, 1], [0.5, 1, 1]],
    "recall": [[0, 0, 0.5], [0, 0.5, 1], [0.5, 1, 1]],
    "f1": [[0, 0, 0.5], [0, 0.5, 1], [0.5, 1, 1]],
    "auc": [[0, 0, 0.5, 0.75], [0.5, 0.75, 1], [0.75, 1, 1]],
    "rand": [[0, 0, 0.5], [0, 0.5, 1], [0.5, 1, 1]],
    "adjusted_rand": [[0, 0, 0.5], [0, 0.5, 1], [0.5, 1, 1]],
    "silhouette": [[-1, -1, 0, 0.5], [0, 0.5, 1], [0.5, 1, 1]],
    "calinski_harabasz": [[0, 0, 1, 5], [1, 5, 10], [5, 10, 100, 100]],
    "davies_bouldin": [[5, 10, 100, 100], [1, 5, 10], [0, 0, 1, 5]]
  },
  "performance_minmax": {
    "accuracy": [0, 1],
    "precision": [0, 1],
    "recall": [0, 1],
    "f1": [0, 1],
    "auc": [0, 1],
    "rand": [0, 1],
    "adjusted_rand": [0, 1],
    "silhouette": [-1, 1],
    "calinski_harabasz": [0, 100],
    "davies_bouldin": [0, 100]
  }
};

const DataCIFAR = ``;

const MetadataCIFAR = {
  "data": DataCIFAR,
  "cpu": "",
  "ncpu": 1,
  "gpu": "",
  "ngpu": 1,
  "energy_low_train": 1,
  "energy_medium_train": 1,
  "energy_high_train": 1,
  "energy_low_test": 1,
  "energy_medium_test": 1,
  "energy_high_test": 1,
};

const DataMNIST = ``

const MetadataMNIST = {
  "data": DataMNIST,
  "cpu": "",
  "ncpu": 1,
  "gpu": "",
  "ngpu": 1,
  "energy_low_train": 1,
  "energy_medium_train": 1,
  "energy_high_train": 1,
  "energy_low_test": 1,
  "energy_medium_test": 1,
  "energy_high_test": 1,
};

const DataImageNet = ``;

const MetadataImageNet
 = {
  "data": DataImageNet,
  "cpu": "",
  "ncpu": 1,
  "gpu": "",
  "ngpu": 1,
  "energy_low_train": 1,
  "energy_medium_train": 1,
  "energy_high_train": 1,
  "energy_low_test": 1,
  "energy_medium_test": 1,
  "energy_high_test": 1,
};

/* ════════════════════════════════════════════════
   DATA LOADING
════════════════════════════════════════════════ */
let text = "";
async function loadPerformanceData() {
  // const response = await fetch('./data/referencePerformance.json');
  // performanceData = await response.json();
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
  // const response = await fetch('./data/CPUs.csv');
  // const text = await response.text();
  text = textCPU;
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
  // const response = await fetch('./data/GPUs.csv');
  // const text = await response.text();
  text = textGPU;
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
  renderMatrix();
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

// function computeScoreMembership(rules, perfMem, energyMem) {
//   const rules = [
//     [0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1],
//     [0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],
//     [1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0]
//   ];
//   let sm = [0,0,0,0,0];
//   for (let i=0; i<perfMem.length; i++)
//     for (let j=0; j<energyMem.length; j++) {
//       const str = Math.min(perfMem[i], energyMem[j]);
//       for (let s=0; s<5; s++)
//         sm[s] = Math.max(sm[s], Math.min(str, rules[j*energyMem.length+i][s]));
//     }
//   return sm;
// }

// function computeScoreMLMembership(rules, perfMem, energyTrainMem, energyTestMem) {
//   const rules = [
//     [0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],
//     [0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,0,0,0],
//     [1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]
//   ];
//   let sm = [0,0,0,0,0];
//   for (let i=0; i<perfMem.length; i++)
//     for (let j=0; j<energyTrainMem.length; j++)
//       for (let k=0; k<energyTestMem.length; k++) {
//         const str = Math.min(perfMem[i], energyTrainMem[j], energyTestMem[k]);
//         const ruleIdx = (k*perfMem.length + j)*energyTrainMem.length + i;
//         for (let s=0; s<5; s++)
//           sm[s] = Math.max(sm[s], Math.min(str, rules[ruleIdx][s]));
//       }
//   return sm;
// }

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
  // const rules = getRules();

  // // ML mode
  // let scoreMem;
  let safeEt=0, tlt=0, tmt=0, tht=0;
  const isML = systemType==='ML';
  document.getElementById("energy_control_test").style.display = isML?'block':'none';
  document.getElementById("energy_input_test").style.display   = isML?'block':'none';
  document.getElementById("mf-test-card").style.display        = isML?'block':'none';

  if (isML) {
    const et = parseFloat(document.getElementById("energy_test").value)||0;
    safeEt = Math.max(0, et);
    tlt = parseFloat(document.getElementById("energy_low_test").value)||0;
    tmt = parseFloat(document.getElementById("energy_medium_test").value)||0;
    tht = parseFloat(document.getElementById("energy_high_test").value)||0;
    // const energyTestMem = computeEnergyMembership(cpuFactor,cores,gpuFactor,ngpu,tlt,tmt,tht,safeEt);
    // scoreMem = computeScoreMLMembership(rules, perfMem, energyMem, energyTestMem);
  }// else {
  //  scoreMem = computeScoreMembership(rules, perfMem, energyMem);
  //}

  // // Aggregate & defuzz
  // const defuzzMethod = document.getElementById("defuzz-select").value;
  // const { xs, ys } = aggregateOutput(scoreMem);
  // const score = defuzz(xs, ys, defuzzMethod);

  // Also run matrix FIS for rule activations display
  const matrixResult = runMatrixFIS(perfMem, energyMem);

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

function computeScoreML(perf, energy_train, energy_test) {
  const metric    = document.getElementById("metric").value;
  const cpuFactor = parseFloat(document.getElementById("cpu-power").value) || 1;
  const cores     = parseInt(document.getElementById("cores").value) || 1;
  const gpuFactor = parseFloat(document.getElementById("gpu-power").value) || 1;
  const ngpu      = parseInt(document.getElementById("number-gpu").value) || 0;
  const tl_train = parseFloat(document.getElementById("energy_low").value)    || 0;
  const tm_train = parseFloat(document.getElementById("energy_medium").value) || 0;
  const th_train = parseFloat(document.getElementById("energy_high").value)   || 0;
  const tl_test = parseFloat(document.getElementById("energy_low_test").value)    || 0;
  const tm_test = parseFloat(document.getElementById("energy_medium_test").value) || 0;
  const th_test = parseFloat(document.getElementById("energy_high_test").value)   || 0;

  const perfMem   = computePerfMembership(metric, perf);
  const energyTrainMem = computeEnergyMembership(cpuFactor, cores, gpuFactor, ngpu, tl_train, tm_train, th_train, energy_train);
  const energyTestMem = computeEnergyMembership(cpuFactor, cores, gpuFactor, ngpu, tl_test, tm_test, th_test, energy_test);
  const { score } = calcScore({
    perfMem,
    energyTrainMem,
    energyTestMem,
    defuzzMethod: document.getElementById("defuzz-select").value
  });
  return score;
}

function readUploadFile(evt) {
  const systemType = document.querySelector('input[name="systemType"]:checked')?.value;
  const isML = systemType==='ML';
  if (isML) readUploadFileML(evt);
  else readUploadFileNML(evt);
}

function readUploadFileNML(evt) {
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

function readUploadFileML(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result.trim();
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return;
    const headers = lines[0].split(',').map(h=>h.trim());
    const perfIdx  = headers.indexOf("perf");
    const energyTrainIdx= headers.indexOf("energyTrain");
    const energyTestIdx= headers.indexOf("energyTest");
    const groupIdx = headers.indexOf("group");
    if (perfIdx===-1 || energyTrainIdx===-1 || energyTestIdx===-1) return;

    const perfs   = lines.slice(1).map(l=>parseFloat(l.split(',')[perfIdx]));
    const energiesTrain= lines.slice(1).map(l=>parseFloat(l.split(',')[energyTrainIdx]));
    const energiesTest= lines.slice(1).map(l=>parseFloat(l.split(',')[energyTestIdx]));
    const groups  = lines.slice(1).map(l=>l.split(',')[groupIdx]||'default');

    const scores = perfs.map((p,i)=>computeScoreML(p,energiesTrain[i],energiesTest[i]));
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

    const lastMeans = means[means.length-1]
    document.getElementById("perf").value   = parseFloat(lastMeans[perfIdx])||0;
    document.getElementById("energy").value = parseFloat(lastMeans[energyTrainIdx])||0;
    document.getElementById("energy_test").value = parseFloat(lastMeans[energyTestIdx])||0;
    updatePlot();

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
  ['info','result','mf','rules'].forEach(t=>{
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
renderMatrix();
applyPreset('normal');

Promise.all([loadCPUs(), loadGPUs(), loadPerformanceData()])
  .then(()=>updatePlot())
  .catch(err=>console.error('Init failed:', err));