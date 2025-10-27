document.addEventListener("DOMContentLoaded", () => {
    const authToken = localStorage.getItem("authToken");


    // 🔥 Create the Add Availability button immediately


    const urlParams = new URLSearchParams(window.location.search);
    const instructorId = urlParams.get("id");

    if (!instructorId) {
        alert("No instructor ID provided.");
        window.location.href = "/Admin/admin-dashboard.html";
        return;
    }

    const tbody = document.getElementById("availabilityTableBody");

    // === Load Instructor Availabilities ===
    function loadAvailabilities() {
        fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Availability/${instructorId}`, {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        })
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = "";
            const availabilities = data.data || [];
            if (!availabilities.length) {
                tbody.innerHTML = "<tr><td colspan='3'>No availabilities found.</td></tr>";
                return;
            }

            availabilities.forEach(slot => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${slot.dayOfWeek}</td>
                    <td>${formatTime(slot.startTime)}</td>
                    <td>${formatTime(slot.endTime)}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Error fetching availabilities:", err);
            alert("Failed to load availabilities.");
        });
    }
    document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    
    // Clear token (adjust key name if different)
    localStorage.removeItem("authToken");

    // Optionally clear other saved data
    // localStorage.removeItem("refreshToken");
    // localStorage.removeItem("userProfile");

    // Redirect to login page
    window.location.href = "/Sign/sign.html";
    });

    loadAvailabilities();

    // === Add Availability Modal ===
    // function showAddModal() {
    //     const modalHtml = `
    //         <div class="modal" id="addAvailabilityModal">
    //             <div class="modal-content">
    //                 <h2>Add Availability</h2>

    //                 <label for="dayOfWeek">Day of Week:</label>
    //                 <select id="dayOfWeek">
    //                     <option value="">-- Select Day --</option>
    //                     <option value="Sunday">Sunday</option>
    //                     <option value="Monday">Monday</option>
    //                     <option value="Tuesday">Tuesday</option>
    //                     <option value="Wednesday">Wednesday</option>
    //                     <option value="Thursday">Thursday</option>
    //                     <option value="Friday">Friday</option>
    //                     <option value="Saturday">Saturday</option>
    //                 </select>

    //                 <label for="startTime">Start Time:</label>
    //                 <input type="time" id="startTime" />

    //                 <label for="endTime">End Time:</label>
    //                 <input type="time" id="endTime" />

    //                 <div class="modal-actions">
    //                     <button id="saveAvailabilityBtn" class="btn-primary">Save</button>
    //                     <button id="cancelModalBtn" class="btn-secondary">Cancel</button>
    //                 </div>
    //             </div>
    //         </div>
    //     `;
    //     document.body.insertAdjacentHTML("beforeend", modalHtml);

    //     document.getElementById("saveAvailabilityBtn").addEventListener("click", () => {
    //         const dayOfWeek = document.getElementById("dayOfWeek").value;
    //         const startTime = document.getElementById("startTime").value;
    //         const endTime = document.getElementById("endTime").value;

    //         if (!dayOfWeek || !startTime || !endTime) {
    //             alert("Please fill in all fields.");
    //             return;
    //         }

    //         const payload = {
    //             instructorId,
    //             dayOfWeek,
    //             startTime,
    //             endTime
    //         };

    //         fetch(`https://localhost:7295/api/Availability/add`, {
    //             method: "POST",
    //             headers: {
    //                 "Authorization": `Bearer ${authToken}`,
    //                 "Content-Type": "application/json"
    //             },
    //             body: JSON.stringify(payload)
    //         })
    //         .then(res => res.json())
    //         .then(data => {
    //             alert(data.message || "Availability added successfully!");
    //             document.getElementById("addAvailabilityModal").remove();
    //             loadAvailabilities();
    //         })
    //         .catch(err => {
    //             console.error("Error adding availability:", err);
    //             alert("Failed to add availability.");
    //         });
    //     });

    //     document.getElementById("cancelModalBtn").addEventListener("click", () => {
    //         document.getElementById("addAvailabilityModal").remove();
    //     });
    // }

    // === Logout ===
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("authToken");
        window.location.href = "/Sign/sign.html";
    });

    function formatTime(timeString) {
        const [hour, minute] = timeString.split(":");
        let h = parseInt(hour);
        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12; // Convert to 12-hour format
        return `${h}:${minute} ${ampm}`;
    }
});
