document.addEventListener("DOMContentLoaded", () => {
  fetchBatches();
});

const fetchBatches = async () => {
  try {
    const response = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Batches/all-batches");
    const batches = await response.json();

    const tableBody = document.getElementById("batchTableBody");
    tableBody.innerHTML = "";
    const bat = batches.data || [];

    if (bat.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="2">No batches found.</td></tr>`;
      return;
    }

    bat.forEach(batch => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${batch.name}</td>
        <td>
          <a href="/Batches/periods-in-batch.html?batchId=${batch.id}">View Periods</a> |
          <a href="/Batches/students-in-batch.html?batchId=${batch.id}">View Students</a> |
          <button onclick="showEditModal('${batch.id}', '${batch.name}')">Edit</button>
          <button onclick="removeBatch('${batch.id}')">Remove</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    Swal.fire("Error", "Could not fetch batches", "error");
  }
};

const removeBatch = async (batchId) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "You will not be able to recover this batch!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  });

  if (confirm.isConfirmed) {
    try {
      const res = await fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Batches/${batchId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        Swal.fire("Deleted!", "Batch has been deleted.", "success");
        fetchBatches();
      } else {
        Swal.fire("Error", "Failed to delete batch", "error");
      }
    } catch (err) {
      Swal.fire("Error", "An error occurred while deleting", "error");
    }
  }
};

const showEditModal = (id, name) => {
  document.getElementById("editBatchId").value = id;
  document.getElementById("editBatchName").value = name;
  document.getElementById("editModal").style.display = "block";
};

const closeEditModal = () => {
  document.getElementById("editModal").style.display = "none";
};

const saveBatchEdit = async () => {
  const id = document.getElementById("editBatchId").value;
  const name = document.getElementById("editBatchName").value.trim();

  if (!name) {
    Swal.fire("Validation Error", "Batch name cannot be empty", "warning");
    return;
  }

  try {
    const res = await fetch(`https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Batches/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, name }),
    });

    if (res.ok) {
      Swal.fire("Updated", "Batch updated successfully", "success");
      closeEditModal();
      fetchBatches();
    } else {
      Swal.fire("Error", "Failed to update batch", "error");
    }
  } catch (err) {
    Swal.fire("Error", "An error occurred while updating", "error");
  }
};

document.getElementById("addBatchBtn").addEventListener("click", () => {
  loadCourses(); // load courses before showing modal
  document.getElementById("addBatchModal").classList.remove("hidden");
});

function closeAddBatchModal() {
  document.getElementById("addBatchModal").classList.add("hidden");
  document.getElementById("newBatchName").value = "";
  document.getElementById("newBatchYear").value = "";
  document.getElementById("courseSelect").innerHTML = `<option value="">-- Select Course --</option>`;
}

async function loadCourses() {
  try {
    const res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Courses/all-courses");
    const courses = await res.json();
    const courseSelect = document.getElementById("courseSelect");
    const cour = courses.data || [];

    courseSelect.innerHTML = `<option value="">-- Select Course --</option>`;
    cour.forEach(course => {
      const option = document.createElement("option");
      option.value = course.id;
      option.textContent = course.title;
      courseSelect.appendChild(option);
    });
  } catch (err) {
    Swal.fire("Error", "Failed to load courses", "error");
  }
}

async function submitNewBatch() {
  const name = document.getElementById("newBatchName").value.trim();
  const year = parseInt(document.getElementById("newBatchYear").value);
  const courseId = document.getElementById("courseSelect").value;

  if (!name || !year || !courseId) {
    Swal.fire("Error", "Please fill all fields.", "error");
    return;
  }

  try {
    const res = await fetch("https://course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Batches/add-batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, year, courseId })
    });

    if (!res.ok) throw new Error("Failed to add batch");

    Swal.fire("Success", "Batch added successfully!", "success");
    closeAddBatchModal();
    fetchBatches();
  } catch (err) {
    Swal.fire("Error", err.message, "error");
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