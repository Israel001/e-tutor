window.addEventListener('load', async () => {
  try {
    const studentsResponse = await fetch(`${baseURL}/user/${userId}/students`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const studentsResponseDecoded = await studentsResponse.json();
    console.log(studentsResponseDecoded.userStudents);
    if (studentsResponseDecoded.userStudents.length > 0) {
      for (let i = 0; i < studentsResponseDecoded.userStudents.length; i++) {
        document.getElementById('students-profile').insertAdjacentHTML(
          'beforeend',
          `<div class="col-lg-4 col-md-4 col-sm-4 col-xs-12">
                <div class="row">
                  <div class="student-card">
                    <div class="image-student">
                      <img src="${studentsResponseDecoded.userStudents[i].image}" alt="">
                    </div>
                  <div class="info-student">
                    <p class="student-name">${studentsResponseDecoded.userStudents[i].name}</p>
                    <a href="profile.html?id=${studentsResponseDecoded.userStudents[i]._id}">View Profile</a>
                  </div>
                </div>
              </div>
            </div>`
        );
      }
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong');
  }
});
