// Function to get the selected room from the URL query parameter
function getSelectedRoom() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('room');
}

// Function to display the selected room
function displaySelectedRoom() {
    const selectedRoom = getSelectedRoom();
    if (selectedRoom) {
        document.getElementById('roomName').textContent = selectedRoom;
    }
}

// Function to save usage records to localStorage
function saveUsageRecords(room, records) {
    localStorage.setItem(`usageRecords_${room}`, JSON.stringify(records));
}

// Function to load usage records from localStorage
function loadUsageRecords(room) {
    const records = localStorage.getItem(`usageRecords_${room}`);
    return records ? JSON.parse(records) : [];
}

// Function to add a usage record
function addUsageRecord(room, waterUsage, electricityUsage) {
    const records = loadUsageRecords(room);
    const currentDate = new Date().toLocaleDateString('en-CA'); // Automatically record the current date
    records.push({ date: currentDate, waterUsage, electricityUsage });
    saveUsageRecords(room, records);
    renderUsageRecords(room);
}

// Function to render usage records in the table
function renderUsageRecords(room) {
    const records = loadUsageRecords(room);
    const tbody = document.querySelector('#usageRecords tbody');
    tbody.innerHTML = ''; // Clear existing rows

    records.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${new Date(record.date).toLocaleString('en-US', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
        <td>${record.waterUsage}</td>
        <td>${record.electricityUsage}</td>
        <td>
          <button class="action-button edit-button" onclick="editRecord(${index})">Edit</button>
        </td>
      `;
        tbody.appendChild(row);
    });
}

// Function to switch a row to edit mode
function editRecord(index) {
    const selectedRoom = getSelectedRoom();
    const records = loadUsageRecords(selectedRoom);
    const record = records[index];

    const row = document.querySelector(`#usageRecords tbody tr:nth-child(${index + 1})`);
    row.innerHTML = `
      <td><input type="date" class="edit-form" id="editDate" value="${record.date}"></td>
      <td><input type="number" class="edit-form" id="editWaterUsage" value="${record.waterUsage}" step="0.1"></td>
      <td><input type="number" class="edit-form" id="editElectricityUsage" value="${record.electricityUsage}" step="0.1"></td>
      <td>
        <button class="action-button save-button" onclick="saveRecord(${index})">Save</button>
        <button class="action-button cancel-button" onclick="renderUsageRecords('${selectedRoom}')">Cancel</button>
      </td>
    `;
}

// Function to save edited record
function saveRecord(index) {
    const selectedRoom = getSelectedRoom();
    const records = loadUsageRecords(selectedRoom);

    const editedDate = new Date(document.getElementById('editDate').value).toLocaleDateString('en-CA');
    const editedWaterUsage = parseFloat(document.getElementById('editWaterUsage').value);
    const editedElectricityUsage = parseFloat(document.getElementById('editElectricityUsage').value);

    if (editedDate && !isNaN(editedWaterUsage) && !isNaN(editedElectricityUsage)) {
        records[index].date = editedDate;
        records[index].waterUsage = editedWaterUsage;
        records[index].electricityUsage = editedElectricityUsage;
        saveUsageRecords(selectedRoom, records);
        renderUsageRecords(selectedRoom);
    } else {
        alert('Please enter valid date, water, and electricity usage values.');
    }
}

// Event listener for the "Add Record" button
document.getElementById('addUsageButton').addEventListener('click', () => {
    const selectedRoom = getSelectedRoom();
    const waterUsage = parseFloat(document.getElementById('waterUsage').value);
    const electricityUsage = parseFloat(document.getElementById('electricityUsage').value);

    if (!isNaN(waterUsage) && !isNaN(electricityUsage)) {
        addUsageRecord(selectedRoom, waterUsage, electricityUsage);
        document.getElementById('waterUsage').value = '';
        document.getElementById('electricityUsage').value = '';
    } else {
        alert('Please enter valid water and electricity usage values.');
    }
});

// Load and display data when the page loads
window.addEventListener('load', () => {
    displaySelectedRoom();
    const selectedRoom = getSelectedRoom();
    renderUsageRecords(selectedRoom);
});