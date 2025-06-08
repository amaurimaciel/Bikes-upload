(function() {
  // Utility to create the side panel
  function createPanel() {
    let panel = document.getElementById('bike-assistant-panel');
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'bike-assistant-panel';
    panel.style.position = 'fixed';
    panel.style.top = '0';
    panel.style.right = '0';
    panel.style.width = '400px';
    panel.style.height = '100%';
    panel.style.background = 'white';
    panel.style.borderLeft = '1px solid #ccc';
    panel.style.zIndex = 9999;
    panel.style.overflowY = 'auto';
    panel.style.fontSize = '14px';
    panel.style.fontFamily = 'sans-serif';
    document.body.appendChild(panel);
    panel.innerHTML = '<h2 style="padding:10px">Bike Assistant</h2>' +
                     '<button id="bike-assistant-fetch" style="margin:10px">Analyze</button>' +
                     '<button id="bike-assistant-fill" style="margin:10px">Fill Form</button>' +
                     '<button id="bike-assistant-download" style="margin:10px">Download CSV</button>' +
                     '<pre id="bike-assistant-output" style="white-space:pre-wrap;padding:10px"></pre>';
    return panel;
  }

  // Gather data from the page
  function collectData() {
    const fields = {
      bikeId: (location.search.match(/bikeId=([^&#]+)/) || [,''])[1] ||
               (document.querySelector('img[src*="/bikes/"]') || {}).src?.match(/bikes\/(\w+)-/)?.[1] || '' ,
      brand: document.getElementById('input-brand')?.value || '',
      model: document.getElementById('input-model')?.value || '',
      color: document.getElementById('headlessui-combobox-input-:ra:')?.value || '',
      category: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.nextElementSibling?.textContent?.trim()).join(', '),
      frameType: document.getElementById('input-frameType')?.value || '',
      rackPosition: document.getElementById('input-rackPosition')?.value || '',
      rearRackMaxLoad: document.getElementById('input-Rear rack max load')?.value || '',
      year: document.getElementById('input-year')?.value || '',
      seatTube: document.getElementById('input-seatTube')?.value || '',
      size: document.getElementById('input-size')?.value || '',
      minSize: document.getElementById('input-minSize')?.value || '',
      maxSize: document.getElementById('input-maxSize')?.value || '',
      brakes: document.getElementById('headlessui-combobox-input-:r16:')?.value || '',
      tyreBrand: document.getElementById('input-tyreBrand')?.value || '',
      etrto: document.getElementById('input-etrto')?.value || '',
      wheelsSize: document.getElementById('input-wheelsSize')?.value || '',
      transmissionBrand: document.getElementById('input-transmissionBrand')?.value || '',
      transmissionModel: document.getElementById('input-transmissionModel')?.value || '',
      transmissionSpeed: document.getElementById('input-transmissionSpeed')?.value || '',
      transmissionSystem: document.getElementById('input-transmissionSystem')?.value || '',
      drivetrain: document.getElementById('input-drivetrain')?.value || '',
      mileage: document.getElementById('input-mileage')?.value || '',
      engineBrand: document.getElementById('input-engineBrand')?.value || '',
      engineModel: document.getElementById('input-engineModel')?.value || '',
      engineLocation: document.getElementById('input-engineLocation')?.value || '',
      completedCycles: document.getElementById('input-completedCycles')?.value || '',
      boschDisplayModel: document.getElementById('headlessui-combobox-input-:ro8:')?.value || '',
      boschRemoteModel: document.getElementById('headlessui-combobox-input-:roc:')?.value || '',
      batteryCapacityWh: document.getElementById('input-batteryCapacity (Wh)')?.value || '',
      batteryVolts: document.getElementById('input-batteryVolts')?.value || '',
      batteryLocation: document.getElementById('input-batteryLocation')?.value || '',
      batteryRemovability: document.getElementById('headlessui-combobox-input-:r2t:')?.value || ''
    };
    const photos = Array.from(document.querySelectorAll('a[href*="/bikes/"]')).map(a => a.href);
    return { fields, photos };
  }

  // Build prompt for API
  function buildPrompt(data) {
    return `Analyze the following bike information and suggest values for missing fields. Return a CSV with the columns: field, certainty(0-100), suggestion, source, details.\nData: ${JSON.stringify(data)}.`;
  }

  async function fetchSuggestions(data) {
    const prompt = buildPrompt(data);
    // Placeholder API call - replace with real endpoint
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer YOUR_KEY'
      },
      body: JSON.stringify({model: 'gpt-3.5-turbo', messages: [{role:'user', content: prompt}]})
    });
    const res = await response.json();
    // Expect assistant message with CSV
    const csv = res.choices?.[0]?.message?.content || '';
    return csv;
  }

  function downloadCSV(text) {
    const blob = new Blob([text], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bike.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function fillFormFromCSV(csv) {
    const lines = csv.trim().split(/\r?\n/);
    lines.forEach(line => {
      const [field, certainty, suggestion] = line.split(',').map(t => t.trim());
      const idMap = {
        bikeId: null,
        brand: 'input-brand',
        model: 'input-model',
        color: 'headlessui-combobox-input-:ra:',
        frameType: 'input-frameType',
        rackPosition: 'input-rackPosition',
        'Rear rack max load': 'input-Rear rack max load',
        year: 'input-year',
        seatTube: 'input-seatTube',
        size: 'input-size',
        minSize: 'input-minSize',
        maxSize: 'input-maxSize',
        brakes: 'headlessui-combobox-input-:r16:',
        tyreBrand: 'input-tyreBrand',
        etrto: 'input-etrto',
        wheelsSize: 'input-wheelsSize',
        transmissionBrand: 'input-transmissionBrand',
        transmissionModel: 'input-transmissionModel',
        transmissionSpeed: 'input-transmissionSpeed',
        transmissionSystem: 'input-transmissionSystem',
        drivetrain: 'input-drivetrain',
        mileage: 'input-mileage',
        engineBrand: 'input-engineBrand',
        engineModel: 'input-engineModel',
        engineLocation: 'input-engineLocation',
        completedCycles: 'input-completedCycles',
        'Bosch Display Model': 'headlessui-combobox-input-:ro8:',
        'Bosch Remote Model': 'headlessui-combobox-input-:roc:',
        'batteryCapacity (Wh)': 'input-batteryCapacity (Wh)',
        batteryVolts: 'input-batteryVolts',
        'Battery Location': 'input-batteryLocation',
        'Battery Removability': 'headlessui-combobox-input-:r2t:'
      };
      const id = idMap[field];
      if (id) {
        const el = document.getElementById(id);
        if (el) el.value = suggestion;
      }
    });
  }

  const panel = createPanel();
  document.getElementById('bike-assistant-fetch').addEventListener('click', async () => {
    const data = collectData();
    const csv = await fetchSuggestions(data);
    document.getElementById('bike-assistant-output').textContent = csv;
    panel.dataset.csv = csv;
  });
  document.getElementById('bike-assistant-fill').addEventListener('click', () => {
    if (panel.dataset.csv) fillFormFromCSV(panel.dataset.csv);
  });
  document.getElementById('bike-assistant-download').addEventListener('click', () => {
    if (panel.dataset.csv) downloadCSV(panel.dataset.csv);
  });
})();
