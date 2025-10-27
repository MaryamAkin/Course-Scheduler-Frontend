const baseUrl = "course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/"
const params = new URLSearchParams(window.location.search);

// Check if token came from the URL (after Google login)
let tokenFromUrl = params.get("token");

if (tokenFromUrl) {
  console.log(tokenFromUrl);
  // Save token to local storage for future requests
  localStorage.setItem("authToken", tokenFromUrl);

  // Remove the token from the URL so it’s clean
  window.history.replaceState({}, document.title, "/Instructor/instructor-dashboard.html");
} else {
  // If not in URL, try loading from local storage
  let authToken = localStorage.getItem("authToken");
  console.log(authToken)
  if (!authToken) {
    // No token at all — send to login page
    window.location.href = "/Sign/sign.html";
  }
}
document.addEventListener("DOMContentLoaded", async () => {
    await loadInstructorInfo();
    await loadStats();
    await loadUpcomingClasses();
    await loadNotifications();
    setupNotificationToggle();
    setupQuickActionsToggle()// NEW: load notifications count
});

// Load instructor name & photo
async function loadInstructorInfo() {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Instructors/profile-currentuser`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
        console.error("Failed to load instructor profile");
        return;
    }

    const result = await res.json();
    const prof = result.data || [];
    document.getElementById("instructorName").textContent = prof.name || "Instructor";
    document.getElementById("instructorPhoto").src = `${baseUrl}${prof.profileImagePath}` || "https://via.placeholder.com/100";
}

// Load dashboard stats
async function loadStats() {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Instructors/instructor-stats`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
        console.error("Failed to load stats");
        return;
    }

    const data = await res.json();
    document.getElementById("totalTopics").textContent = data.totalTopics || 0;
    document.getElementById("classesThisWeek").textContent = data.classesThisWeek || 0;
    document.getElementById("totalStudents").textContent = data.totalStudents || 0;
}

// Load upcoming classes table
async function loadUpcomingClasses() {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Periods/instructor-upcoming`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
        console.error("Failed to load upcoming classes");
        return;
    }

    const data = await res.json();
    const classes = data.data || [];

    const tbody = document.getElementById("classesTableBody");
    tbody.innerHTML = "";

    if (classes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No upcoming classes</td></tr>`;
        return;
    }

    classes.forEach(c => {
        const start = new Date(c.startTime);
        const end = new Date(c.endTime);

        const row = `
            <tr>
                <td>${start.toLocaleDateString()}</td>
                <td>${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>${c.topicTitle}</td>
                <td>${c.batchName}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML("beforeend", row);
    });
}

// NEW: Load notifications count
async function loadNotifications() {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Admin/my-notifications`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
        console.error("Failed to load notifications");
        return;
    }

    const notifications = await res.json();

    const badge = document.querySelector(".notification-badge");
    const dropdown = document.getElementById("notificationDropdown");
    const list = document.getElementById("notificationList");
    const noNotif = dropdown.querySelector(".no-notifications");

    list.innerHTML = "";

    if (notifications.length === 0) {
        badge.style.display = "none";
        noNotif.style.display = "block";
        return;
    }

    badge.style.display = "inline-block";
    badge.textContent = notifications.length;
    noNotif.style.display = "none";

    notifications.forEach(n => {
        const li = document.createElement("li");
        li.textContent = n.message || "New notification";
        li.tabIndex = 0; // for accessibility

        // Optional: on click mark read or navigate somewhere
        li.addEventListener("click", () => {
            alert(`Clicked notification: ${n.message}`);
            // You can add your logic here to mark read or open details
        });

        list.appendChild(li);
    });
}

function setupNotificationToggle() {
    const bell = document.getElementById("notificationBell");
    const dropdown = document.getElementById("notificationDropdown");

    // Toggle dropdown visibility
    bell.addEventListener("click", (e) => {
        e.preventDefault();
        const isVisible = dropdown.style.display === "block";
        dropdown.style.display = isVisible ? "none" : "block";

        // Accessibility
        bell.setAttribute("aria-expanded", !isVisible);
        dropdown.setAttribute("aria-hidden", isVisible);
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!bell.contains(e.target)) {
            dropdown.style.display = "none";
            bell.setAttribute("aria-expanded", "false");
            dropdown.setAttribute("aria-hidden", "true");
        }
    });
}
function setupQuickActionsToggle() {
    const toggleBtn = document.getElementById("quickActionsToggle");
    const quickSection = document.getElementById("quickActionsSection");

    toggleBtn.addEventListener("click", () => {
        if (quickSection.style.display === "none" || quickSection.style.display === "") {
            quickSection.style.display = "block";
            toggleBtn.textContent = "Quick Actions ▲"; // Change arrow direction
        } else {
            quickSection.style.display = "none";
            toggleBtn.textContent = "Quick Actions ▼";
        }
    });
}
// Example Quick Action Handlers
document.querySelectorAll(".action-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        alert(`Action: ${btn.textContent.trim()}`);
    });
});

document.getElementById("logoutBtn").addEventListener("click", function() {
    // Example: remove JWT from localStorage
    localStorage.removeItem("authToken");

    // Optionally clear other saved user data
    // localStorage.removeItem("userId");
    // localStorage.removeItem("role");

    // Redirect to login page
    window.location.href = "/Sign/sign.html";
});