document.addEventListener("DOMContentLoaded", () => {
  const topicId = new URLSearchParams(window.location.search).get("topicId");
  if (!topicId) {
    Swal.fire("Error", "Missing topicId in query string", "error");
    return;
  }
console.log(topicId);
  loadInstructors();
  document.getElementById("assignInstructorBtn").addEventListener("click", openAssignModal);
  document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("assignModal").style.display = "none";
  });
  document.getElementById("assignBtn").addEventListener("click", assignInstructor);

  async function loadInstructors() {
    try {
const res = await fetch(`https://localhost:7295/api/Topic/instructors-assigned/${topicId}`);
      const result = await res.json();
      const tbody = document.querySelector("#instructorsTable tbody");
      tbody.innerHTML = "";
    const instructors = result.data || [];
      instructors.forEach(instr => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><a class="profile-link" href="/Instructors/profile.html?instructorId=${instr.id}">${instr.instructorName}</a></td>
          <td>${instr.instructorEmail}</td>
          <td>
            <button onclick="removeInstructor('${instr.id}')">Remove</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not load instructors", "error");
    }
  }

  window.removeInstructor = async function (instructorId) {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will remove the instructor from the topic.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove"
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/Topics/${topicId}/Instructors/${instructorId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        Swal.fire("Removed", "Instructor removed successfully", "success");
        loadInstructors();
      } else {
        Swal.fire("Error", "Failed to remove instructor", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server error occurred", "error");
    }
  };

  async function openAssignModal() {
    document.getElementById("assignModal").style.display = "block";
    const select = document.getElementById("instructorSelect");
    select.innerHTML = "";

    try {
      const res = await fetch("https://localhost:7295/api/Instructors/instructors");
      const result = await res.json();
        const instructors = result.data || [];
      instructors.forEach(instr => {
        const option = document.createElement("option");
        option.value = instr.id;
        option.textContent = instr.name;
        select.appendChild(option);
      });
    } catch (err) {
      console.error("Error fetching instructors:", err);
      Swal.fire("Error", "Could not load instructors", "error");
    }
  }

  async function assignInstructor() {
    const instructorId = document.getElementById("instructorSelect").value;
    if (!instructorId) {
      Swal.fire("Warning", "Please select an instructor", "warning");
      return;
    }
// console.log('instructorid', instructorId)
    try {
      console.log("topicid",topicId, "instructor id",instructorId);
      const res = await fetch(`https://localhost:7295/api/Topic/assign-instructors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        topicId,
      instructorIds: [instructorId]  // wrap the single instructorId in an array
    })

      });

      if (res.ok) {
        Swal.fire("Assigned", "Instructor assigned successfully", "success");
        document.getElementById("assignModal").style.display = "none";
        loadInstructors();
      } else {
        Swal.fire("Error", "Failed to assign instructor", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server error occurred", "error");
    }
  }
});
