document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("authToken");

    if (!token) {
        window.location.href = "/Sign/sign.html";
        return;
    }

    const classesPerPage = 10;
    let currentPage = 1;
    let classesList = [];

    const tableBody = document.getElementById("classesTableBody");
    const pageInfo = document.getElementById("pageInfo");
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");

    // Fetch all classes from API
    fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Periods/instructor-periods?CurrentPage=1&PageSize=10", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch all classes");
        }
        return response.json();
    })
    .then(data => {
        classesList = Array.isArray(data.data.items) ? data.data.items : [];
        renderTable();
    })
    .catch(err => {
        console.error("Error fetching classes:", err);
        tableBody.innerHTML = `<tr><td colspan="4">Error loading classes</td></tr>`;
    });

    function renderTable() {
        tableBody.innerHTML = "";
        const start = (currentPage - 1) * classesPerPage;
        const end = start + classesPerPage;
        const paginatedClasses = classesList.slice(start, end);

        if (paginatedClasses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4">No classes found</td></tr>`;
        } else {
            paginatedClasses.forEach(cls => {
                const startDateObj = new Date(cls.startTime);
                const endDateObj = new Date(cls.endTime)
                const startTime = startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endTime = endDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const row = `
                    <tr>
                        <td>${cls.date}</td>
                        <td>${startTime}</td>
                        <td>${endTime}</td>
                        <td>${cls.batchName}</td>
                        <td>${cls.topicTitle}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }
// const keep =<td>${classDate.toLocaleDateString()}</td>
        pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(classesList.length / classesPerPage)}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = end >= classesList.length;
    }

    prevPageBtn.addEventListener("click", function() {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextPageBtn.addEventListener("click", function() {
        if (currentPage * classesPerPage < classesList.length) {
            currentPage++;
            renderTable();
        }
    });

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", function() {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        window.location.href = "/Sign/sign.html";
    });
});
