let rows = [];

document.getElementById("upload").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  rows = XLSX.utils.sheet_to_json(sheet);

  document.getElementById("run").disabled = false;
  document.getElementById("progress").value = 0;
});

document.getElementById("run").addEventListener("click", async () => {
  const tbody = document.querySelector("#results tbody");
  tbody.innerHTML = "";

  const prog = document.getElementById("progress");
  prog.max = rows.length;

  // Process rows with dummy predictions
  rows = rows.map((row, i) => {
    const text = cleanTicket(row["Problem Description"] || "");
    const label = i % 2 === 0 ? "Fresh" : "Repeat";
    const conf = (Math.random() * 100).toFixed(2) + "%";
    prog.value = i + 1;

    return {
      ...row,
      Cleaned: text,
      Prediction: label,
      Confidence: conf,
      Selected: false,
    };
  });

  renderTable(rows);
  document.getElementById("export").disabled = false;
});

function renderTable(data) {
  const tbody = document.querySelector("#results tbody");
  tbody.innerHTML = "";
  data.forEach((r, idx) => {
    const tr = document.createElement("tr");

    // Checkbox
    const tdCheck = document.createElement("td");
    tdCheck.textContent = r.Selected ? "☑" : "☐";
    tdCheck.style.cursor = "pointer";
    tdCheck.onclick = () => { r.Selected = !r.Selected; renderTable(rows); };
    tr.appendChild(tdCheck);

    ["JTC Case ID", "Problem Description", "Prediction", "Confidence"].forEach(key => {
      const td = document.createElement("td");
      td.textContent = r[key] || "";
      td.title = key === "Problem Description" ? r[key] : ""; // tooltip
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

// Search filter
document.getElementById("search").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = rows.filter(r =>
    (r["JTC Case ID"] || "").toLowerCase().includes(q) ||
    (r["Problem Description"] || "").toLowerCase().includes(q)
  );
  renderTable(filtered);
});

// Select all repeat
document.getElementById("selectAllRepeat").addEventListener("change", (e) => {
  const checked = e.target.checked;
  rows.forEach(r => {
    if (r.Prediction === "Repeat") r.Selected = checked;
  });
  renderTable(rows);
});

// Export selected
document.getElementById("export").addEventListener("click", () => {
  const selectedIds = rows.filter(r => r.Selected).map(r => r["JTC Case ID"]);
  const filtered = rows.filter(r => selectedIds.includes(r["JTC Case ID"]));
  if (filtered.length === 0) {
    alert("No tickets selected.");
    return;
  }

  const newSheet = XLSX.utils.json_to_sheet(filtered);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, newSheet, "Exported");
  XLSX.writeFile(wb, "exported.xlsx");
});

function updateStats() {
  const total = rows.length;
  const safety = rows.filter(r => r.Prediction === "Repeat").length; // later change to "Safety"
  document.getElementById("safetyCount").textContent = safety;
  document.getElementById("totalCount").textContent = `(out of ${total} total)`;
}
