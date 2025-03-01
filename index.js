// Function to save rooms to localStorage
function saveRoomsToStorage(rooms) {
  localStorage.setItem('rooms', JSON.stringify(rooms));
}

// Function to load rooms from localStorage
function loadRoomsFromStorage() {
  const rooms = localStorage.getItem('rooms');
  return rooms ? JSON.parse(rooms) : [];
}

// Function to render rooms
function renderRooms() {
  const rooms = loadRoomsFromStorage();
  const roomsContainer = document.getElementById('roomsContainer');
  roomsContainer.innerHTML = ''; // Clear existing content

  // Sort rooms by floor and then by room number
  rooms.sort((a, b) => {
    if (a.floor === b.floor) {
      return a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' });
    }
    return a.floor - b.floor;
  });

  // Group rooms by floor
  const floors = {};
  rooms.forEach(room => {
    if (!floors[room.floor]) {
      floors[room.floor] = [];
    }
    floors[room.floor].push(room);
  });

  // Render rooms by floor
  for (const floor in floors) {
    const floorGroup = document.createElement('div');
    floorGroup.className = 'floor-group';

    const floorHeading = document.createElement('h2');
    floorHeading.textContent = `Floor ${floor}`;
    floorGroup.appendChild(floorHeading);

    const roomList = document.createElement('div');
    roomList.className = 'room-list';

    floors[floor].forEach(room => {
      const roomButton = document.createElement('button');
      roomButton.className = 'room-button';
      roomButton.textContent = `Room ${room.floor}${room.number}`;

      // Add event listener to navigate to usage.html with the selected room
      roomButton.addEventListener('click', () => {
        window.location.href = `usage/usage.html?room=${room.floor}${room.number}`;
      });

      roomList.appendChild(roomButton);
    });

    floorGroup.appendChild(roomList);
    roomsContainer.appendChild(floorGroup);
  }
}

// Function to add a room
function addRoom(floor, number) {
  const rooms = loadRoomsFromStorage();
  rooms.push({ floor, number });
  saveRoomsToStorage(rooms);
  renderRooms();
}

// Function to export all room data as a CSV file, sorted by room number
function exportAllRoomsToCSV() {
  // Get all room keys from localStorage
  const roomKeys = Object.keys(localStorage).filter(key => key.startsWith('usageRecords_'));

  // Initialize an array to hold all room data
  const allRoomsData = [];

  // Loop through each room's data
  roomKeys.forEach(key => {
    const roomName = key.replace('usageRecords_', ''); // Extract room name from key
    const records = JSON.parse(localStorage.getItem(key)); // Get room records

    // Add each record to the allRoomsData array
    records.forEach(record => {
      allRoomsData.push({
        room: roomName,
        date: record.date,
        waterUsage: record.waterUsage,
        electricityUsage: record.electricityUsage,
      });
    });
  });

  // Sort allRoomsData by room number and date
  allRoomsData.sort((a, b) => {
    // Extract numeric part of the room name for sorting
    const roomNumberA = parseInt(a.room.match(/\d+/)[0], 10);
    const roomNumberB = parseInt(b.room.match(/\d+/)[0], 10);
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    const roomdiff = roomNumberA - roomNumberB;
    if (roomdiff != 0) {
      return roomdiff;
    } else {
      return dateA - dateB
    }
  });

  // Initialize CSV content with headers
  let csvContent = "Room,Date,Water Usage (m³),Electricity Usage (kWh)\n";

  // Add sorted data to the CSV content
  allRoomsData.forEach(record => {
    csvContent += `${record.room},${record.date},${record.waterUsage},${record.electricityUsage}\n`;
  });

  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'all_rooms_usage_sorted.csv'; // File name
  link.style.display = 'none';

  // Append the link to the document and trigger the download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// Add an export button to the page
function addExportButton() {
  const exportButton = document.createElement('button');
  exportButton.textContent = 'Export Data';
  exportButton.className = 'export-button';
  exportButton.onclick = exportAllRoomsToCSV;

  // Add the button to the container
  const container = document.querySelector('.container');
  container.appendChild(exportButton);
}

// Event listener for the "Add Room" button
document.getElementById('addRoomButton').addEventListener('click', () => {
  const floorNumber = document.getElementById('floorNumber').value;
  const roomNumber = document.getElementById('roomNumber').value;

  if (floorNumber && roomNumber) {
    addRoom(floorNumber, roomNumber);
    document.getElementById('floorNumber').value = '';
    document.getElementById('roomNumber').value = '';
  } else {
    alert('Please enter both floor number and room number.');
  }
});

// Load and render rooms when the page loads
window.addEventListener('load', () => {
  renderRooms();
  addExportButton();
});