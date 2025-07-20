// frontend/script.js

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");
const userSection = document.getElementById("userSection");

let allVehicles = []; // Store all vehicles globally 

// Show login/register or welcome/logout + admin panel for admin
if (user && token) {
  userSection.innerHTML = `
  <div class="user-actions">
    <p class="welcome-msg">Welcome, <strong>${user.name}</strong></p>
    <button class="my-bookings-btn" onclick="location.href='my-bookings.html'">My Bookings</button>
    <button class="logout-btn" onclick="logout()">Logout</button>
    ${user.role === 'admin' ? `<a href="admin.html" class="btn-admin-panel">🔧 Admin Panel</a>` : ''}
  </div>

`;
} else {
  userSection.innerHTML = `
    <button class="login-btn" onclick="location.href='login.html'">Login</button>
    <button class="register-btn" onclick="location.href='register.html'">Register</button>
  `;
}

// Logout function
function logout() {
  localStorage.clear();
  window.location.reload();
}

// Load all vehicles
async function loadVehicles() {
  try {
    const res = await fetch("http://localhost:5000/api/vehicles");
    allVehicles = await res.json();

    // Custom sort order
    const sortOrder = ["Bicycle", "Scooter", "Bike", "Car", "Big Car"];
    allVehicles.sort((a, b) => {
      return sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type);
    });

    displayVehicles(allVehicles); // Display on load
  } catch (err) {
    console.error("Failed to fetch vehicles:", err);
  }
}

// Display filtered or all vehicles
function displayVehicles(vehicles) {
  // Map section IDs based on vehicle type
  const sections = {
    Bicycle: document.getElementById("bicyclesList"),
    Scooter: document.getElementById("scootersList"),
    Bike: document.getElementById("bikesList"),
    Car: document.getElementById("carsList"),
    "Big Car": document.getElementById("bigcarsList"),
  };

  // Clear previous Cards
  Object.values(sections).forEach(section => section.innerHTML = "");

  if (!vehicles.length) {
    Object.values(sections).forEach(section => {
      section.innerHTML = "<p>No vehicles found.</p>";
    });
    return;
  }

  vehicles.forEach(vehicle => {
    const card = document.createElement("div");
    card.className = "vehicle-card";

    let buttonHTML = "";
    if (vehicle.available) {
      if (token) {
        buttonHTML = `<button class="book-btn" onclick="openBookingForm('${vehicle._id}', '${vehicle.name}')">Book Now</button>`;
      } else {
        buttonHTML = `<button class="book-btn" onclick="location.href='login.html'">Book Now</button>`;
      }
    } else {
      buttonHTML = `<p class="unavailable">Not Available</p>`;
    }

    card.innerHTML = `
      <img src="${vehicle.image}" alt="${vehicle.name}" />
      <h3>${vehicle.name}</h3>
      <p><strong>Type:</strong> ${vehicle.type}</p>
      <p><strong>Price/Hour:</strong> ₹${vehicle.pricePerHour}</p>
      <p class="${vehicle.available ? 'available' : 'unavailable'}">
        ${vehicle.available ? "Available ✅" : "Not Available ❌"}
      </p>
      ${buttonHTML}
    `;

    // Append card to the correct type section
    const section = sections[vehicle.type];
    if (section) {
      section.appendChild(card);
    }
  });
}


// Filter vehicles by search input (name or type)
function filterVehicles() {
  const query = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allVehicles.filter(vehicle =>
    vehicle.name.toLowerCase().includes(query) ||
    vehicle.type.toLowerCase().includes(query)
  );

  displayVehicles(filtered);
}

// Booking modal control
let selectedVehicleId = null;

function openBookingForm(vehicleId, name) {
  selectedVehicleId = vehicleId;
  document.getElementById("bookingTitle").innerText = `Book ${name}`;
  document.getElementById("bookingModal").style.display = "block";
}

function closeBookingForm() {
  selectedVehicleId = null;
  document.getElementById("bookingModal").style.display = "none";
}

// Submit booking
async function submitBooking() {
  const start = document.getElementById("startDateTime").value;
  const end = document.getElementById("endDateTime").value;

  if (!start || !end || !selectedVehicleId) return alert("Please fill all fields.");

  try {
    const res = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        vehicleId: selectedVehicleId,
        startDateTime: start,
        endDateTime: end
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Booking Successful!");
      closeBookingForm();
      loadVehicles(); // Refresh after booking
    } else {
      alert("❌ " + data.error);
    }
  } catch (err) {
    console.error("Booking error:", err);
    alert("Something went wrong!");
  }
}


// Update booking preview with fare and duration before confirmation


const startInput = document.getElementById("startDateTime");
const endInput = document.getElementById("endDateTime");

if (startInput && endInput) {
  startInput.addEventListener("change", updateBookingPreview);
  endInput.addEventListener("change", updateBookingPreview);
}


function updateBookingPreview() {
  const start = new Date(document.getElementById("startDateTime").value);
  const end = new Date(document.getElementById("endDateTime").value);
  const durationEl = document.getElementById("bookingDuration");
  const fareEl = document.getElementById("bookingFare");

  if (isNaN(start) || isNaN(end) || !selectedVehicleId) {
    durationEl.textContent = "";
    fareEl.textContent = "";
    return;
  }

  const durationHours = Math.ceil((end - start) / (1000 * 60 * 60));
  if (durationHours <= 0) {
    durationEl.textContent = "⚠️ End time must be after start time.";
    fareEl.textContent = "";
    return;
  }

  const vehicle = allVehicles.find(v => v._id === selectedVehicleId);
  if (!vehicle) return;

  durationEl.textContent = `⏱️ Duration: ${durationHours} hour(s)`;
  fareEl.textContent = `💰 Estimated Fare: ₹${durationHours * vehicle.pricePerHour}`;
}

// ESC key to close modal
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeBookingForm();
  }
});


// Initialize flatpickr on both inputs
["#startDateTime", "#endDateTime"].forEach(selector => {
  flatpickr(selector, {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: true,
    minuteIncrement: 1,
    defaultDate: new Date(),
    plugins: [new confirmDatePlugin({ confirmText: "Select" })]
  });
});


// for Menue Options 
function toggleMenu() {
  const panel = document.getElementById("menuPanel");
  const icon = document.getElementById("menuIcon");
  
  if (!user || !token) {
    // 🔁 Redirect logout users to login page
    window.location.href = "login.html";
    return;
  }

  panel.classList.toggle("open");
  icon.style.display = panel.classList.contains("open") ? "none" : "block";
}

// Close menu on ✖ button click
document.getElementById("closeMenuBtn").addEventListener("click", () => {
  document.getElementById("menuPanel").classList.remove("open");
  document.getElementById("menuIcon").style.display = "block";
});

// Close menu when clicking outside of it
window.addEventListener("click", function (e) {
  const panel = document.getElementById("menuPanel");
  const icon = document.getElementById("menuIcon");

  if (
    panel.classList.contains("open") &&
    !panel.contains(e.target) &&
    !icon.contains(e.target)
  ) {
    panel.classList.remove("open");
    icon.style.display = "block";
  }
});



// Load everything on page load
document.addEventListener("DOMContentLoaded", loadVehicles);

