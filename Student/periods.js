const token = localStorage.getItem("authToken");
let currentPage = 1;
const pageSize = 5; // you can change how many periods to show per page

document.addEventListener("DOMContentLoaded", () => {
    loadPeriods();

    document.getElementById("prevPage").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            loadPeriods();
        }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
        currentPage++;
        loadPeriods();
    });
});

async function loadPeriods() {
    const tableBody = document.querySelector("#periodsTable tbody");

    try {
        const res = await fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Periods/student-periods?CurrentPage=${currentPage}&PageSize=${pageSize}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        const periods = data.data.items || [];

        tableBody.innerHTML = "";
        periods.forEach(period => {
            const start = new Date(period.startTime);
            const end = new Date(period.endTime);

            const dateStr = start.toLocaleDateString();
            const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const row = `
                <tr>
                    <td>${dateStr}</td>
                    <td>${startTimeStr}</td>
                    <td>${endTimeStr}</td>
                    <td>${period.instructorName || "N/A"}</td>
                    <td>${period.topicTitle || "N/A"}</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

        // Disable prev button on first page
        document.getElementById("prevPage").disabled = (currentPage === 1);

        // Disable next button if no more data
        document.getElementById("nextPage").disabled = (periods.length < pageSize);

        // Show current page
        document.getElementById("pageIndicator").textContent = `Page ${currentPage}`;

    } catch (error) {
        console.error("Error fetching periods:", error);
        tableBody.innerHTML = `<tr><td colspan="5">Error loading periods</td></tr>`;
    }
}

document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("authToken");
    window.location.href = "/Sign/sign.html";
});
