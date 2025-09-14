document.addEventListener("DOMContentLoaded", () => {
  const studentsBody = document.getElementById("students-body");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageIndicator = document.getElementById("pageIndicator");
  const totalPagesSpan = document.getElementById("totalPages");
  const searchInput = document.getElementById("searchInput");

  const API_URL = "https://localhost:7295/api/Students"; 
  const BATCH_API = "https://localhost:7295/api/Batches/all-batches";

  let students = [];
  let filteredStudents = [];
  let currentPage = 1;
  const pageSize = 5;

  // ✅ Fetch all students
  async function fetchStudents() {
    try {
      const res = await fetch(`${API_URL}/all`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      }); 
      if (!res.ok) throw new Error("Failed to fetch students");

      const data = await res.json();
      students = data.data || [];
      filteredStudents = students;
      renderPage();
    } catch (err) {
      console.error(err);
      studentsBody.innerHTML = `<tr><td colspan="5">Error loading students</td></tr>`;
    }
  }

  // ✅ Render table page
  function renderPage() {
    studentsBody.innerHTML = "";

    const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageStudents = filteredStudents.slice(start, end);

    if (pageStudents.length === 0) {
      studentsBody.innerHTML = `<tr><td colspan="5">No students found</td></tr>`;
    } else {
      pageStudents.forEach(student => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${student.fullName || student.name}</td>
          <td>${student.email}</td>
          <td>${student.batchName || "N/A"}</td>
          <td>${student.phoneNumber || "N/A"}</td>
          <td>
            <button onclick="openEditModal('${student.id}')">Edit</button>
            <button onclick="removeStudent('${student.id}')">Remove</button>
          </td>
        `;
        studentsBody.appendChild(tr);
      });
    }

    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  }

  // ✅ Remove student
  window.removeStudent = async function(id) {
    if (!confirm("Are you sure you want to remove this student?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
      });

      if (!res.ok) throw new Error("Failed to remove student");
      alert("Student removed successfully");

      students = students.filter(s => s.id !== id);
      filteredStudents = filteredStudents.filter(s => s.id !== id);
      renderPage();
    } catch (err) {
      console.error(err);
      alert("Error removing student");
    }
  };

  // ✅ Open modal + load student + batches
  window.openEditModal = async function(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    document.getElementById("editStudentId").value = student.id;
    document.getElementById("editName").value = student.name || "";
    document.getElementById("editEmail").value = student.email || "";
    // document.getElementById("editPhone").value = student.phoneNumber || "";

    // Load batches dynamically
    const batchSelect = document.getElementById("editBatch");
    batchSelect.innerHTML = "<option>Loading...</option>";
    try {
      const res = await fetch(BATCH_API, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) throw new Error("Failed to load batches");

      const batches = await res.json();
      const bat = batches.data || [];
      batchSelect.innerHTML = "";
      bat.forEach(batch => {
        const opt = document.createElement("option");
        opt.value = batch.id;
        opt.textContent = batch.name;
        if (student.batchId === batch.id) opt.selected = true;
        batchSelect.appendChild(opt);
      });
    } catch (err) {
      console.error(err);
      batchSelect.innerHTML = "<option>Error loading batches</option>";
    }

    document.getElementById("editStudentModal").style.display = "block";
  };

  // ✅ Close Modal
  window.closeEditModal = function() {
    document.getElementById("editStudentModal").style.display = "none";
  };

  // ✅ Save edits
  document.getElementById("editStudentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editStudentId").value;
    const updatedStudent = {
      name: document.getElementById("editName").value,
      email: document.getElementById("editEmail").value,
    //   phoneNumber: document.getElementById("editPhone").value,
      batchId: document.getElementById("editBatch").value
    };

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedStudent)
      });

      if (!res.ok) throw new Error("Failed to update student");
      alert("Student updated successfully");

      // Update local list
      const index = students.findIndex(s => s.id === id);
      if (index !== -1) students[index] = { ...students[index], ...updatedStudent };

      renderPage();
      closeEditModal();
    } catch (err) {
      console.error(err);
      alert("Error updating student");
    }
  });

  // ✅ Search filter
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    filteredStudents = students.filter(student =>
      student.fullName?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query)
    );
    currentPage = 1;
    renderPage();
  });

  // ✅ Pagination
  prevBtn.addEventListener("click", () => {
    currentPage--;
    renderPage();
  });

  nextBtn.addEventListener("click", () => {
    currentPage++;
    renderPage();
  });

  // ✅ Initial load
  fetchStudents();
});
