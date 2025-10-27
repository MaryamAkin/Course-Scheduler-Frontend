document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("authToken");

    if (!token) {
        window.location.href = "/Sign/sign.html";
        return;
    }

    fetch("course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Periods/instructor-upcoming", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch upcoming classes");
        }
        return response.json();
    })
    .then(data => {
        const classes = data.data || [];
        const tableBody = document.getElementById("classesTableBody");

        if (classes.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4">No upcoming classes found</td></tr>`;
            return;
        }

        const now = new Date();

classes.forEach(cls => {
    const start = new Date(cls.startTime);
    const end = new Date(cls.endTime);

    // Difference in hours from now to class start
    const timeDiff = start - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Highlight if class is within the next 24 hours
    const highlightClass = (hoursDiff > 0 && hoursDiff <= 24) ? "highlight" : "";

    const row = `
        <tr class="${highlightClass}">
            <td>${start.toLocaleDateString()}</td>
            <td>${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td>${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td>${cls.topicTitle}</td>
            <td>${cls.batchName}</td>
        </tr>`;
            tableBody.innerHTML += row;
        });
    })
    .catch(err => {
        console.error("Error fetching classes:", err);
        document.getElementById("classesTableBody").innerHTML = `<tr><td colspan="4">Error loading classes</td></tr>`;
    });

    // View all classes button click
    document.getElementById("viewAllBtn").addEventListener("click", function() {
        window.location.href = "/Instructor/all-classes.html";
    });

    // Logout functionality
    document.getElementById("logoutBtn").addEventListener("click", function() {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        window.location.href = "/Sign/sign.html";
    });
});
