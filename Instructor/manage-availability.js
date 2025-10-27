document.addEventListener("DOMContentLoaded", () => {
    const authToken = localStorage.getItem("authToken");
    // const instructorId = localStorage.getItem("instructorId");
    const tableBody = document.getElementById("availabilityTableBody");
    let instructorId = getUserIdFromToken();
    // === Load Availabilities ===
    function loadAvailabilities() {
        fetch("course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Availability/my-availabilities", {
            headers: { "Authorization": `Bearer ${authToken}` }
        })
        .then(res => res.json())
        .then(data => {
            tableBody.innerHTML = "";
            const availabilities = data.data || [];
            if (!availabilities.length) {
                tableBody.innerHTML = "<tr><td colspan='4'>No availabilities found.</td></tr>";
                return;
            }
            availabilities.forEach(slot => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${slot.dayOfWeek}</td>
                    <td>${formatTime(slot.startTime)}</td>
                    <td>${formatTime(slot.endTime)}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${slot.id}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${slot.id}">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => {
            console.error(err);
            alert("Failed to load availabilities.");
        });
    }

    loadAvailabilities();

    // === Floating Button: Add Availability ===
    document.getElementById("addAvailabilityBtn").addEventListener("click", () => {
        openModal();
    });

    // === Open Modal ===
    function openModal(slot = null) {
        const isEdit = !!slot;
        const modalHtml = `
            <div class="modal" id="availabilityModal">
                <div class="modal-content">
                    <h2>${isEdit ? "Edit" : "Add"} Availability</h2>

                    <label for="dayOfWeek">Day of Week:</label>
                    <select id="dayOfWeek">
                        <option value="">-- Select Day --</option>
                        <option value="Sunday">Sunday</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                    </select>

                    <label for="startTime">Start Time:</label>
                    <input type="time" id="startTime" />

                    <label for="endTime">End Time:</label>
                    <input type="time" id="endTime" />

                    <div class="modal-actions">
                        <button id="saveBtn" class="btn-primary">${isEdit ? "Update" : "Save"}</button>
                        <button id="cancelBtn" class="btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById("modalContainer").innerHTML = modalHtml;

        // Pre-fill data for editing
        if (isEdit) {
            document.getElementById("dayOfWeek").value = slot.dayOfWeek;
            document.getElementById("startTime").value = slot.startTime;
            document.getElementById("endTime").value = slot.endTime;
        }

        document.getElementById("saveBtn").addEventListener("click", () => {
            const dayOfWeek = document.getElementById("dayOfWeek").value;
            const startTimeRaw = document.getElementById("startTime").value;
            const endTimeRaw= document.getElementById("endTime").value;

            if (!dayOfWeek || !startTimeRaw || !endTimeRaw) {
                alert("Please fill in all fields.");
                return;
            }
            const startTime = to24HourFormat(startTimeRaw);
            const endTime = to24HourFormat(endTimeRaw);

            const payload = {instructorId,dayOfWeek, startTime, endTime };

            const url = isEdit 
                ? `course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Availability/${slot.id}/update`
                : `course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Availability`;

            fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message || `${isEdit ? "Updated" : "Added"} successfully!`);
                closeModal();
                loadAvailabilities();
            })
            .catch(err => {
                console.error(err);
                alert(`Failed to ${isEdit ? "update" : "add"} availability.`);
            });
        });

        document.getElementById("cancelBtn").addEventListener("click", closeModal);
    }

    function closeModal() {
        document.getElementById("availabilityModal").remove();
    }

    // === Delete Availability ===
    tableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const id = e.target.dataset.id;
            if (confirm("Are you sure you want to delete this availability?")) {
                fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Availability/${id}/delete`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${authToken}` }
                })
                .then(res => res.json())
                .then(data => {
                    alert(data.message || "Deleted successfully!");
                    loadAvailabilities();
                })
                .catch(err => {
                    console.error(err);
                    alert("Failed to delete availability.");
                });
            }
        }

        // Edit availability
        if (e.target.classList.contains("edit-btn")) {
            const id = e.target.dataset.id;
            const row = e.target.closest("tr");
            const slot = {
                id,
                dayOfWeek: row.children[0].textContent,
                startTime: row.children[1].textContent,
                endTime: row.children[2].textContent
            };
            openModal(slot);
        }
    });
    function to24HourFormat(time12) {
    const [time, modifier] = time12.split(" "); // e.g., "08:00 AM"
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours < 12) {
        hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
        hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
}
function getUserIdFromToken() {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error("Token not found in localStorage");
        return null;
    }

    // Decode the JWT (without verifying)
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode payload


    return payload.sub || null; // ✅ Get userId (sub in JWT)
}

    // Helper
    function formatTime(timeString) {
        return timeString; // e.g., 08:00
    }
});
