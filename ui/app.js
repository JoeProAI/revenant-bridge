async function apiCall(endpoint, data) {
  const res = await fetch(`/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function salvage() {
  const file = document.getElementById("stateFile").files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const result = await apiCall("salvage", { state: e.target.result });
    document.getElementById("salvageResult").textContent = `Tx ID: ${result.txId}`;
  };
  reader.readAsText(file);
}

async function revive() {
  const txId = document.getElementById("txId").value;
  const result = await apiCall("revive", { txId });
  document.getElementById("reviveResult").textContent = result.result;
}

async function pay() {
  const amount = document.getElementById("amount").value;
  const result = await apiCall("pay", { amount });
  document.getElementById("payResult").textContent = `Signature: ${result.sig}`;
}

async function testFlow() {
  const testResult = await fetch("/test-flow");
  document.getElementById("testResult").textContent = await testResult.text();
}