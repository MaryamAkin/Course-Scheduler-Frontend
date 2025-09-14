function addCourse(event) {
  // Prevent form/button default submission
  if (event) event.preventDefault();

  Swal.fire({
    title: 'Add New Course',
    input: 'text',
    inputLabel: 'Course Title',
    inputPlaceholder: 'Enter course title',
    showCancelButton: true,
    confirmButtonText: 'Save',
    cancelButtonText: 'Cancel',
    inputValidator: (value) => {
      if (!value.trim()) {
        return 'Please enter a course title!';
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const title = result.value.trim();

      fetch("https://localhost:7295/api/Courses/add-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({ title })
      })
      .then(response => {
        if (!response.ok) throw new Error("Failed to add course");
        return response.json();
      })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Course Added',
          text: 'The new course has been successfully created.',
          timer: 2000,
          showConfirmButton: false
        });
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not add course. Please try again.'
        });
      });
    }
  });
}
