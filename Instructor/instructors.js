const tableBody = document.querySelector("#instructorsTable tbody");
const modal = document.getElementById("addInstructorModal");
const addBtn = document.getElementById("addInstructorBtn");
const closeBtn = document.querySelector(".close");
const form = document.getElementById("addInstructorForm");

// Fetch and display instructors
async function loadInstructors() {
    try {
        const res = await fetch("course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Instructors/instructors");
        const result = await res.json();

        tableBody.innerHTML = "";
        const instructors = result.data || [];
        instructors.forEach(instructor => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td><a class="name-link" href="instructor-profile.html?id=${instructor.id}">${instructor.name}</a></td>
                <td>${instructor.email}</td>
                <td>${instructor.phoneNumber}</td>
                <td>
                    <button onclick="removeInstructor('${instructor.id}')">🗑️ Remove</button>
                    <a href="qualified-topics.html?instructorId=${instructor.id}" class="qualified-topics-btn">📚 Qualified Topics
                    </a>

                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load instructors", "error");
    }
}

// Add instructor
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        email: document.getElementById("email").value,
        name: document.getElementById("fullName").value,
        gender: document.getElementById("gender").value,
        phoneNumber: document.getElementById("phoneNumber").value
    };

    try {
        const res = await fetch("course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Instructors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            Swal.fire("Success", "Instructor added successfully", "success");
            modal.style.display = "none";
            form.reset();
            loadInstructors();
        } else {
            Swal.fire("Error", "Failed to add instructor", "error");
        }
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Server error occurred", "error");
    }
});

// Edit instructor placeholder
function editInstructor(id) {
    Swal.fire("Edit", `Editing instructor with ID: ${id}`, "info");
}

// Remove instructor
async function removeInstructor(id) {
    const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "This will delete the instructor",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it"
    });

    if (confirm.isConfirmed) {
        try {
            const res = await fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Instructor/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                Swal.fire("Deleted", "Instructor removed", "success");
                loadInstructors();
            } else {
                Swal.fire("Error", "Failed to remove instructor", "error");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Server error occurred", "error");
        }
    }
}

// View Qualified Topics placeholder
function viewQualifiedTopics(id) {
    window.location.href = `qualified-topics.html?instructorId=${id}`;
}

// Modal controls
addBtn.addEventListener("click", () => modal.style.display = "block");
closeBtn.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
});

// Load instructors on page load
document.addEventListener("DOMContentLoaded", loadInstructors);
