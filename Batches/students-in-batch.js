document.addEventListener("DOMContentLoaded", () => {
  const batchId = new URLSearchParams(window.location.search).get("batchId");
  console.log(batchId);
  fetchStudents(batchId);

  document.getElementById("addStudentBtn").addEventListener("click", () => {
    openModal();
  });

  document.getElementById("closeModal").addEventListener("click", closeModal);

  document.getElementById("studentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData();

    const studentId = document.getElementById("studentId").value;
    const name = document.getElementById("studentName").value;
    const email = document.getElementById("studentEmail").value;
    const gender = document.getElementById("studentGender").value;
    const phone = document.getElementById("studentPhone").value;
    const password = document.getElementById("studentPassword").value;
    const profileImage = document.getElementById("studentImage");

    formData.append("Name", name);
    formData.append("Email", email);
    formData.append("Gender", gender);

    if (studentId) {
      console.log(studentId);
      // Edit
      if (profileImage.files.length > 0) {
        formData.append("ProfileImage", profileImage.files[0]);
      }

      const response = await fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Students/${studentId}`, {
        method: "PUT",
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire("Updated!", result.message || "Student updated successfully.", "success");
        closeModal();
        fetchStudents(batchId);
      } else {
        Swal.fire("Error", result.message || "Could not update student.", "error");
      }
    } else {
      // Add new
      formData.append("PhoneNumber", phone);
      formData.append("FullName", name);
    formData.append("Email", email);
    formData.append("Gender", gender);
      formData.append("BatchId", batchId);
      formData.append("Password", password);
      formData.append("ProfileImageUrl", profileImage.files[0]);

      const response = await fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Students`, {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire("Added!", result.message || "Student added successfully.", "success");
        closeModal();
        fetchStudents(batchId);
      } else {
        Swal.fire("Error", result.message || "Could not add student.", "error");
      }
    }
  });
});

function openModal(student = null) {
  document.getElementById("studentModal").style.display = "flex";

  const passwordField = document.getElementById("passwordFieldWrapper");
  const phoneField = document.getElementById("phoneFieldWrapper");

  if (student) {
    document.getElementById("modalTitle").textContent = "Edit Student";
    document.getElementById("studentId").value = student.id;
    document.getElementById("studentName").value = student.name;
    document.getElementById("studentEmail").value = student.email;
    document.getElementById("studentGender").value = student.gender;
    passwordField.style.display = "none";
    phoneField.style.display = "none";
  } else {
    document.getElementById("modalTitle").textContent = "Add Student";
    document.getElementById("studentForm").reset();
    document.getElementById("studentId").value = "";
    passwordField.style.display = "block";
    phoneField.style.display = "block";
  }
}

function closeModal() {
  document.getElementById("studentModal").style.display = "none";
}

async function fetchStudents(batchId) {
  const response = await fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Batches/Students/${batchId}`);
  const result = await response.json();
  const tbody = document.getElementById("studentsTableBody");
  tbody.innerHTML = "";
  const stud = result.data || [];
  stud.forEach(student => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.gender}</td>
      <td>${student.phoneNumber || "N/A"}</td>
      <td>
        <button onclick='openModal(${JSON.stringify(student)})'>Edit</button>
        <button onclick='removeStudent("${student.id}")'>Remove</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

async function removeStudent(id) {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!"
  });

  if (confirm.isConfirmed) {
    const response = await fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Students/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (response.ok) {
      Swal.fire("Deleted!", result.message || "Student removed successfully.", "success");
      const batchId = new URLSearchParams(window.location.search).get("batchId");
      fetchStudents(batchId);
    } else {
      Swal.fire("Error", result.message || "Could not delete student.", "error");
    }
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
