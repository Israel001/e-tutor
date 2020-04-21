if (!loggedIn || userRole !== 'admin') window.location = '/index.html';

const setErrorMessage = ({btnArea, btnName, btnId, msgArea, msg}) => {
  if (document.getElementById('loader')) {
    document.getElementById('loader').remove();
  }
  document.getElementById(btnArea).insertAdjacentHTML(
    'beforeend',
    `<button id=${btnId} type="submit">${btnName}</button>`
  );
  document.getElementById(msgArea).innerHTML = '';
  document.getElementById(msgArea).insertAdjacentHTML(
    'afterbegin',
    `<div class="alert alert-danger">
            <a href="javascript:void(0);" class="close" data-dismiss="alert" aria-label="close">&times;</a>
            <strong>Error:</strong> ${msg}
          </div>`
  );
};

const fetchData = async url => {
  const response = await fetch(`${baseURL}/${url}`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'}
  });
  return await response.json();
};

const displayData = async url => {
  const responseData = await fetchData(url);
  document.getElementById('users-table').innerHTML = `<tr>
        <th>No</th>
        <th>Name</th>
        <th>Email</th>
        <th>Tutor</th>
        <th>Students</th>
        <th>Role</th>
    </tr>`;
  for (let i = 0; i < responseData.data.length; i++) {
    document.getElementById('users-table').insertAdjacentHTML(
      'beforeend',
      `<tr>
            <td>${i + 1}</td>
            <td>${responseData.data[i].name}</td>
            <td>${responseData.data[i].email}</td>
            <td>${responseData.data[i].role === 'student' ? responseData.data[i].tutor === null ? 'No Tutor Yet' : responseData.data[i].tutor : 'N/A'}</td>
            <td>
                ${responseData.data[i].role === 'tutor' ? responseData.data[i].students.length === 0 ? 'No Student Yet' : responseData.data[i].students.map(std => ` ${std.name}`) : 'N/A'}
            </td>
            <td>${responseData.data[i].role}</td>
            <td><button id=${responseData.data[i].active ? `deactivate-${responseData.data[i]._id}` : `activate-${responseData.data[i]._id}`} class="isActiveBtn btn btn-primary">${responseData.data[i].active ? 'Deactivate' : 'Activate'}</button></td>
            <td><button class="btn btn-info">View User Card</button></td>
        </tr>
        `
    );
  }
  activateOrDeactivateUser();
};

const activateOrDeactivateUser = () => {
  const isActiveBtns = document.getElementsByClassName('isActiveBtn');
  Array.prototype.filter.call(isActiveBtns, btn => {
    btn.addEventListener('click', async event => {
      const btnId = event.target.id;
      const status = btnId.split('-')[0];
      const userId = btnId.split('-')[1];
      if (status === 'activate') {
        const response = await fetch(`${baseURL}/activate/user/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.status !== 201) {
          console.error(data.message);
        } else {
          document.getElementById(btnId).innerText = 'Deactivate';
          document.getElementById(btnId).setAttribute('id', `deactivate-${userId}`);
        }
      } else if (status === 'deactivate') {
        const response = await fetch(`${baseURL}/deactivate/user/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.status !== 201) {
          console.error(data.message);
        } else {
          document.getElementById(btnId).innerText = 'Activate';
          document.getElementById(btnId).setAttribute('id', `activate-${userId}`);
        }
      }
    });
  });
};

window.addEventListener('load', async () => {
  firebase.initializeApp(firebaseConfig);

  try {
    const userInfoResponse = await fetch(`${baseURL}/get_user_info?userId=${userId}`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    });
    const userInfoData = await userInfoResponse.json();
    document.getElementById('user-name').insertAdjacentHTML(
      'beforeend',
      `${userInfoData.data.user.name} <i class="fa fa-caret-down"></i>`
    );
    document.getElementById('logout-btn').addEventListener('click', logout);

    const studentsResponse = await fetch(`${baseURL}/get_all_students`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    });
    const studentsData = await studentsResponse.json();
    document.getElementById('student-num').innerText = studentsData.data.length;

    const tutorsResponse = await fetch(`${baseURL}/get_tutors`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    });
    const tutorsData = await tutorsResponse.json();
    document.getElementById('tutor-num').innerText = tutorsData.data.length;

    chart.data = [{
      "type": "Student",
      "count": studentsData.data.length
    }, {
      "type": "Tutor",
      "count": tutorsData.data.length
    }, {
      "type": "Issue",
      "count": 23
    }];

    await displayData('get_all_users');

    document.getElementById('display-users').addEventListener('change', async event => {
      switch (event.target.value) {
        case 'all-students': await displayData('get_all_students'); break;
        case 'all-admins': await displayData('get_all_admins'); break;
        case 'all-tutors': await displayData('get_tutors'); break;
        case 'all-alloc-studs': await displayData('get_all_allocated_students'); break;
        case 'all-unalloc-studs': await displayData('get_all_unallocated_students'); break;
        case 'all-alloc-tutors': await displayData('get_all_allocated_tutors'); break;
        case 'all-unalloc-tutors': await displayData('get_all_unallocated_tutors'); break;
        case 'all-active-users': await displayData('get_all_active_users'); break;
        case 'all-inactive-users': await displayData('get_all_inactive_users'); break;
        default: await displayData('get_all_users'); break;
      }
    });

    const forms = document.getElementsByClassName('needs-validation');
    Array.prototype.filter.call(forms, form => {
      form.addEventListener('submit', async event => {
        event.preventDefault();
        event.stopPropagation();
        if (!form.checkValidity()) {
          form.classList.add('was-validated');
        } else {
          document.getElementById('add-user-btn').remove();
          document.getElementById('add-user-form').insertAdjacentHTML(
            'beforeend',
            `<div id="loader" class="loader" style="margin-top: 3rem;">`
          );
          const name = document.getElementById('name').value;
          const email = document.getElementById('email').value;
          const role = document.getElementById('role').value;
          const image = document.getElementById('file').files[0];
          generateBase64FromImage(image).then(img => {
            const storageRef = firebase.storage().ref();
            const imageRef = storageRef.child(`${new Date().getTime().toString()}-${image.name}`);
            const uploadTask = imageRef.putString(img, 'data_url');
            uploadTask.on('state_changed', () => {}, error => {
              console.error(error);
              document.getElementById('loader').remove();
              setErrorMessage({
                btnArea: 'add-user-form',
                btnName: 'Add New User',
                msgArea: 'form-msg',
                msg: 'Image Uploading Failed!',
                btnId: 'add-user-btn'
              });
            }, () => {
              uploadTask.snapshot.ref.getDownloadURL().then(async downloadURL => {
                try {
                  const data = new FormData();
                  data.append('name', name);
                  data.append('email', email);
                  data.append('role', role);
                  data.append('password', 'password');
                  data.append('image', downloadURL);
                  const createUserResponse = await fetch(`${baseURL}/create_user`, {
                    method: 'POST',
                    headers: {Authorization: `Bearer ${token}`},
                    body: data
                  });
                  const createUserData = await createUserResponse.json();
                  if (createUserResponse.status !== 201) {
                    imageRef.delete().then(() => {
                      console.log('File Deleted Successfully');
                    }).catch(err => { console.error(err); });
                    setErrorMessage({
                      btnArea: 'add-user-form',
                      btnName: 'Add New User',
                      msgArea: 'form-msg',
                      msg: createUserData.message,
                      btnId: 'add-user-btn'
                    });
                  } else {
                    document.getElementById('form-msg').innerHTML = '';
                    document.getElementById('form-msg').insertAdjacentHTML(
                      'afterbegin',
                      `<div class="alert alert-success">
                        <a href="javascript:void(0);" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                        <strong>Success:</strong> User Created Successfully. <a href="#users" style="color: #337ab7;">View Users?</a>
                      </div>`
                    );
                    document.getElementById('loader').remove();
                    document.getElementById('add-user-form').insertAdjacentHTML(
                      'beforeend',
                      `<button id="add-user-btn" type="submit">Add New User</button>`
                    );
                    document.getElementById('name').value = '';
                    document.getElementById('email').value = '';
                    document.getElementById('role').value = '';
                    document.getElementById('file').value = '';
                  }
                } catch (err) {
                  console.error(err);
                  setErrorMessage({
                    btnArea: 'add-user-form',
                    btnName: 'Add New User',
                    msgArea: 'form-msg',
                    msg: 'Something went wrong',
                    btnId: 'add-user-btn'
                  });
                }
              });
            });
          });
        }
      });
    });

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
  } catch (err) {
    console.error(err);
  }
});
