document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("authToken"); // Assuming you store JWT in localStorage

    if (!token) {
        // No token, redirect to login
        window.location.href = "/Sign/sign.html";
        return;
    }

    fetch("https://localhost:7295/api/Topic/assigned-tome", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch topics");
        }
        return response.json();
    })
    .then(data => {
        const topics = data.data || [];
        const tableBody = document.getElementById("topicsTableBody");

        if (topics.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3">No assigned topics found</td></tr>`;
            return;
        }

        topics.forEach(topic => {
            const row = `
                <tr>
                    <td>${topic.topicTitle}</td>
                    <td>${topic.courseTitle}</td>
                    <td>${topic.duration} hrs</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    })
    .catch(err => {
        console.error("Error fetching topics:", err);
        document.getElementById("topicsTableBody").innerHTML = `<tr><td colspan="3">Error loading topics</td></tr>`;
    });

    // Logout functionality
    document.getElementById("logoutBtn").addEventListener("click", function() {
        localStorage.removeItem("authToken");
        // localStorage.removeItem("userId");
        // localStorage.removeItem("role");
        window.location.href = "/Sign/sign.html";
    });
});
