const apiBaseUrl = "https://localhost:7295/api";

document.addEventListener("DOMContentLoaded", () => {
  loadCourses();

  document.getElementById("courseForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("courseId").value;
    const title = document.getElementById("courseTitle").value;
    const selectedBatchIds = Array.from(
      document.querySelectorAll("#batchCheckboxes input[type='checkbox']:checked")
    ).map(cb => cb.value);

    const payload = {
      title: title,
      batchIds: selectedBatchIds
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${apiBaseUrl}/Courses/${id}` : `${apiBaseUrl}/Courses/add-course`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      Swal.fire("Success", "Course saved successfully.", "success");
      closeModal();
      loadCourses();
    } else {
      Swal.fire("Error","Failed to save course", "error");
    }
  });
});

async function loadCourses() {
  const res = await fetch(`${apiBaseUrl}/Courses/all-courses`);
  const courses = await res.json();

  const tableBody = document.getElementById("courseTableBody");
  tableBody.innerHTML = "";
  const cours = courses.data || [];
  cours.forEach(course => {
    const row = document.createElement("tr");

    const titleCell = document.createElement("td");
    titleCell.textContent = course.title;

    const actionsCell = document.createElement("td");
    actionsCell.innerHTML = `
      <button onclick="openModalById('${course.id}', '${course.title}')">Edit</button>
      <button onclick="deleteCourse('${course.id}')">Delete</button>
      <button onclick="window.location.href='/Courses/topics-in-course.html?courseId=${course.id}'">
        View Topics
      </button> |
      <button onclick="window.location.href='/Courses/batches-in-course.html?courseId=${course.id}'">
        View Batches
      </button>

    `;

    row.appendChild(titleCell);
    row.appendChild(actionsCell);
    tableBody.appendChild(row);
  });
}

function openAddModal() {
  document.getElementById("courseModal").style.display = "flex";
  document.getElementById("modalTitle").textContent = "Add Course";
  document.getElementById("courseForm").reset();
  document.getElementById("courseId").value = "";
  document.getElementById("batchCheckboxes").innerHTML = "<p>Select Batches:</p>";
  loadBatchesWithSelection("");
}

function closeModal() {
  document.getElementById("courseModal").style.display = "none";
  document.getElementById("batchCheckboxes").innerHTML = "<p>Select Batches:</p>";
}

async function openModalById(id, title) {
  document.getElementById("courseModal").style.display = "flex";
  document.getElementById("modalTitle").textContent = "Edit Course";
  document.getElementById("courseTitle").value = title;
  document.getElementById("courseId").value = id;
  document.getElementById("batchCheckboxes").innerHTML = "<p>Select Batches:</p>";
  await loadBatchesWithSelection(id);
}

async function loadBatchesWithSelection(courseId) {
  const allBatchesRes = await fetch(`${apiBaseUrl}/Batches/all-batches`);
  const allBatches = await allBatchesRes.json();

  let selectedBatchIds = [];
  if (courseId) {
    const courseBatchesRes = await fetch(`${apiBaseUrl}/Batches/Courses/${courseId}`);
    selectedBatchIds = await courseBatchesRes.json();
    
  }
const select = selectedBatchIds.data || [];
  const container = document.getElementById("batchCheckboxes");
  const batc = allBatches.data || [];
  batc.forEach(batch => {
    const label = document.createElement("label");
    label.style.display = "block";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = batch.id;
    if (select.includes(batch.id)) {
      checkbox.checked = true;
    }
    label.appendChild(checkbox);
    label.append(` ${batch.name}`);
    container.appendChild(label);
  });
}

async function deleteCourse(id) {
  const confirmResult = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  });

  if (!confirmResult.isConfirmed) return;

  const res = await fetch(`${apiBaseUrl}/Courses/${id}`, {
    method: "DELETE"
  });

  if (res.ok) {
    Swal.fire("Deleted!", "Course has been deleted.", "success");
    loadCourses();
  } else {
    Swal.fire("Error", "Failed to delete course.", "error");
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
