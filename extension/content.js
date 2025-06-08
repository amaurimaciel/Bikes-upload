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
    panel.innerHTML =
      '<h2 style="padding:10px">Bike Assistant</h2>' +
      '<button id="bike-assistant-fetch" style="margin:10px">Generate CSV</button>' +
      '<button id="bike-assistant-download" style="margin:10px">Download CSV</button>' +
      '<div style="padding:10px">' +
      '<pre id="bike-assistant-csv" style="white-space:pre-wrap;border:1px solid #ccc;padding:5px"></pre>' +
      '</div>';
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

  function buildInputCSV(data) {
    const lines = [];
    Object.entries(data.fields).forEach(([k, v]) => {
      lines.push(`${k},100,${v},page,`);
    });
    data.photos.forEach((p, idx) => {
      lines.push(`photo${idx + 1},100,${p},page,`);
    });
    return lines.join('\n');
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


  const panel = createPanel();
  document.getElementById('bike-assistant-fetch').addEventListener('click', () => {
    const data = collectData();
    const csv = buildInputCSV(data);
    document.getElementById('bike-assistant-csv').textContent = csv;
    panel.dataset.csv = csv;
  });
  document.getElementById('bike-assistant-download').addEventListener('click', () => {
    if (panel.dataset.csv) downloadCSV(panel.dataset.csv);
  });
})();
