const topicId = new URLSearchParams(window.location.search).get("topicId");
const apiUrl = "course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic";

document.addEventListener("DOMContentLoaded", () => {
    if (!topicId) {
        Swal.fire("Error", "Topic ID is missing in URL.", "error");
        return;
    }

    loadTopicTitle();
    loadInstructors();

    // Open modal
    document.getElementById("assignInstructorBtn").addEventListener("click", () => {
        document.getElementById("assignModal").style.display = "block";
        loadAvailableInstructors(); // Load instructors into the dropdown when modal opens
    });

    // Close modal
    document.getElementById("closeModal").addEventListener("click", () => {
        document.getElementById("assignModal").style.display = "none";
    });

    // Assign instructor button inside modal
    document.getElementById("assignBtn").addEventListener("click", assignInstructor);
});

async function loadInstructors() {
    try {
        const response = await fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic/instructors-assigned/${topicId}`);
        if (!response.ok) throw new Error("Failed to load instructors.");
        const instructors = await response.json();
        const instructorList = instructors.data || [];
        const tbody = document.getElementById("instructorsTableBody");
        tbody.innerHTML = "";

        if (instructorList.length === 0) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 3;
            td.textContent = "No instructors assigned to this topic.";
            td.style.textAlign = "center";
            tr.appendChild(td);
            tbody.appendChild(tr);
        } else {
            instructorList.forEach((instructor) => {
                const tr = document.createElement("tr");

                const nameTd = document.createElement("td");
                nameTd.textContent = instructor.instructorName;

                const emailTd = document.createElement("td");
                emailTd.textContent = instructor.instructorEmail;

                const actionTd = document.createElement("td");
                const removeBtn = document.createElement("button");
                removeBtn.textContent = "Remove";
                removeBtn.className = "remove-btn";
                removeBtn.addEventListener("click", () => removeInstructor(instructor.id));
                actionTd.appendChild(removeBtn);

                tr.appendChild(nameTd);
                tr.appendChild(emailTd);
                tr.appendChild(actionTd);
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Unable to load instructors.", "error");
    }
}

async function loadTopicTitle() {
    try {
        const res = await fetch(`${apiUrl}/${topicId}`);
        const result = await res.json();
        const topic = result.data;

        if (topic && topic.title && topic.courseTitle) {
            document.getElementById("topicTitleDisplay").innerText = `Topic: ${topic.title}`;
            document.getElementById("pageTitle").innerText = `Instructor for "${topic.title}" in "${topic.courseTitle}"`;
        } else {
            document.getElementById("pageTitle").innerText = "Manage Instructors (Missing data)";
        }
    } catch (err) {
        console.error("Error loading topic title:", err);
        document.getElementById("pageTitle").innerText = "Error loading topic info";
    }
}

async function removeInstructor(instructorId) {
    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to remove this instructor from the topic?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1e3a8a",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, remove",
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic/${topicId}/RemoveInstructor/${instructorId}`, {
                    method: "DELETE",
                });
                if (!response.ok) throw new Error("Failed to remove instructor.");
                Swal.fire("Removed!", "Instructor has been removed.", "success");
                loadInstructors();
            } catch (error) {
                console.error(error);
                Swal.fire("Error", "Could not remove instructor.", "error");
            }
        }
    });
}

function setupModalEvents() {
    const modal = document.getElementById("assignModal");
    const assignBtn = document.getElementById("assignInstructorBtn");
    const closeModalBtn = document.getElementById("closeModal");

    // Hide modal initially
    modal.style.display = "none";

    assignBtn.addEventListener("click", () => {
        modal.style.display = "block";
        loadAvailableInstructors(); // Load into dropdown
    });

    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Also close modal if user clicks outside modal content
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Attach assign logic
    document.getElementById("assignBtn").addEventListener("click", assignInstructor);
}
async function loadAvailableInstructors() {
    try {
        const response = await fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Instructors/instructors`);
        if (!response.ok) throw new Error("Failed to fetch instructors.");
        const result = await response.json();
        const instructors = result.data || [];

        const container = document.getElementById("instructorCheckboxes");
        container.innerHTML = ""; // Clear old content

        instructors.forEach((inst) => {
            const label = document.createElement("label");
            label.style.display = "block";
            label.style.marginBottom = "5px";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = inst.id;
            checkbox.className = "instructor-checkbox";

            label.appendChild(checkbox);
            label.append(` ${inst.name} (${inst.email})`);

            container.appendChild(label);
        });
    } catch (error) {
        console.error("Error loading available instructors:", error);
        Swal.fire("Error", "Could not load instructors list.", "error");
    }
}


async function assignInstructor() {
    const checkboxes = document.querySelectorAll(".instructor-checkbox:checked");
    const selectedIds = Array.from(checkboxes).map(cb => cb.value);

    if (selectedIds.length === 0) {
        Swal.fire("Warning", "Please select at least one instructor", "warning");
        return;
    }

    try {
        const res = await fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic/assign-instructors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                topicId,
                instructorIds: selectedIds,
            }),
        });

        if (res.ok) {
            document.getElementById("assignBtn").addEventListener("click", assignInstructor);
            Swal.fire("Assigned", "Instructors assigned successfully", "success");
            document.getElementById("assignModal").style.display = "none";
            loadInstructors();
        } else {
            Swal.fire("Error", "Failed to assign instructors", "error");
        }
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Server error occurred", "error");
    }
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