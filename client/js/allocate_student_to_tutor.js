window.addEventListener('load', async () => {
  for (let i = 0; i < tutorsData.data.length; i++) {
    document.getElementById('tutor-modal').insertAdjacentHTML(
      'beforeend',
      `<div class="profile-tutor full">
              <div class="t-name">${tutorsData.data[i].name}</div>
              <div class="t-image">
                <img src=${tutorsData.data[i].image} alt="">
              </div>
              <div class="t-select">
                <input type="radio" name="tutor" value=${tutorsData.data[i]._id}>
              </div>
          </div>`
    );
  }

  for (let i = 0; i < studentsData.data.length; i++) {
    document.getElementById('student-modal').insertAdjacentHTML(
      'beforeend',
      `<div class="profile-student full">
              <div class="s-name">${studentsData.data[i].name}</div>
              <div class="s-image">
                <img src=${studentsData.data[i].image} alt="">
              </div>
              <div class="s-check">
                <input type="checkbox" name="student" value=${studentsData.data[i]._id}>
              </div>
          </div>`
    );
  }

  let selectedTutor;
  let selectedStudents = [];

  Array.prototype.filter.call(document.querySelectorAll('[name="tutor"]'), tutor => {
    tutor.addEventListener('change', event => {
      selectedTutor = event.target.value;
    });
  });

  Array.prototype.filter.call(document.querySelectorAll('[name="student"]'), student => {
    student.addEventListener('change', event => {
     if (event.target.checked) {
       if (selectedStudents.length < 10) {
         selectedStudents.push(event.target.value);
       } else {
         window.alert('You can only assign 10 students to one tutor');
       }
     } else {
       selectedStudents = selectedStudents.filter(studIds => studIds !== event.target.value);
     }
    });
  });
});
