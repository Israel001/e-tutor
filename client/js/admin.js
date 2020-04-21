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

const fetchData = async ({url, page, perPage }) => {
  let response;
  if (page) {
    response = await fetch(`${baseURL}/${url}?page=${page}&perPage=${perPage}`, {
      methods: 'GET',
      headers: { 'Content-Type': 'application/json '}
    });
  } else {
    response = await fetch(`${baseURL}/${url}`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    });
  }
  return await response.json();
};

const displayData = async ({url, page, perPage }) => {
  let responseData;
  if (page) {
    responseData = await fetchData({url, page, perPage});
  } else {
    responseData = await fetchData({url});
  }
  document.getElementById('users-table').innerHTML = `<tr>
        <th>No</th>
        <th>Name</th>
        <th>Email</th>
        <th>Tutor</th>
        <th>Role</th>
    </tr>`;
  let index = page ? (page - 1) * 10 + 1 : 1;
  console.log(responseData);
  for (let i = 0; i < responseData.data.length; i++) {
    document.getElementById('users-table').insertAdjacentHTML(
      'beforeend',
      `<tr>
            <td>${index}</td>
            <td>${responseData.data[i].name}</td>
            <td>${responseData.data[i].email}</td>
            <td>${responseData.data[i].role === 'student' ? responseData.data[i].tutor === null ? 'No Tutor Yet' : responseData.data[i].tutor.name : 'N/A'}</td>
            <td>${responseData.data[i].role}</td>
            <td><button id=${responseData.data[i].active ? `deactivate-${responseData.data[i]._id}` : `activate-${responseData.data[i]._id}`} class="isActiveBtn btn btn-primary">${responseData.data[i].active ? 'Deactivate' : 'Activate'}</button></td>
            <td><button id="${responseData.data[i]._id}" class="btn btn-info">View User Card</button></td>
        </tr>
        `
    );
    index += 1;
    document.getElementById(responseData.data[i]._id).addEventListener('click', async event => {
      const userInfoResponse = await fetch(`${baseURL}/get_user_info?userId=${userId}`, {
        method: 'GET'
      });
      const userInfoData = await userInfoResponse.json();
      console.log(userInfoData);
      document.getElementById('myModal3').style.display = 'block';
      document.getElementById('user-profile-info').insertAdjacentHTML(
        'beforeend',
        `<div class="profile-picture">
                <img src="images/user.jpg" alt="">
              </div>
              <div class="profile-infor">
                <p class="fullname">Donald Trump</p>
                <p class="email">donaldtrump@gmail.com</p>
                <p class="description">I'm president of USA</p>
              </div>`
      );
    });
  }
  if (!document.getElementById('pagination')) {
    document.getElementById('users').insertAdjacentHTML(
      'beforeend',
      `<div class="pagination-page full"><ul class="pagination" id="pagination"></div>`
    );
    let numPages = Math.floor(responseData.totalItems / 10);
    if ((responseData.totalItems % 10) > 0) numPages += 1;
    if (numPages > 1) {
      document.querySelector('#pagination').insertAdjacentHTML(
        'beforeend',
        `<li class="page-item"><a style="cursor: pointer;" class="page-link" id="first-page">First</a></li>`
      );
    }
    if (numPages > 1) {
      for (let i = 0; i < numPages; i++) {
        document.querySelector('#pagination').insertAdjacentHTML(
          'beforeend',
          `<li class="${page ? page && page === i + 1 ? 'active' : '' : i + 1 === 1 ? 'active' : ''} page-item"><a style="cursor: pointer;" class="page-link" id="${i + 1}">${i + 1}</a>`
        );
      }
    }
    if (numPages > 1) {
      document.querySelector('#pagination').insertAdjacentHTML(
        'beforeend',
        `<li class="page-item"><a style="cursor: pointer;" class="page-link" id="last-page">Last</a></li>`
      );
    }

    document.getElementById('first-page').addEventListener('click', () => {
      const pages = document.getElementsByClassName('page-item');
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].classList.contains('active')) {
          pages[i].classList.remove('active');
        }
      }
      pages[1].classList.add('active');
      displayData({url, page: '1', perPage: 10});
    });

    document.getElementById('last-page').addEventListener('click', () => {
      const pages = document.getElementsByClassName('page-item');
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].classList.contains('active')) {
          pages[i].classList.remove('active');
        }
      }
      pages[pages.length - 2].classList.add('active');
      displayData({url, page: `${numPages}`, perPage: 10});
    });

    Array.prototype.filter.call(document.getElementsByClassName('page-link'), page => {
      if (page.id !== 'first-page' && page.id !== 'last-page') {
        page.addEventListener('click', event => {
          const pages = document.getElementsByClassName('page-item');
          for (let i = 0; i < pages.length; i++) {
            if (pages[i].classList.contains('active')) {
              pages[i].classList.remove('active');
            }
          }
          if (!event.target.parentNode.classList.contains('active')) {
            event.target.parentNode.classList.add('active');
          }
          displayData({url, page: event.target.id, perPage: 10});
        });
      }
    });
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
    if (document.getElementById('student-num')) {
      document.getElementById('student-num').innerText = studentsData.data.length;
    }

    const tutorsResponse = await fetch(`${baseURL}/get_tutors`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    });
    const tutorsData = await tutorsResponse.json();
    if (document.getElementById('tutor-num')) {
      document.getElementById('tutor-num').innerText = tutorsData.data.length;
    }

    const issuesResponse = await fetch(`${baseURL}/issues`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const issuesData = await issuesResponse.json();
    if (document.getElementById('issue-num')) {
      document.getElementById('issue-num').innerText = issuesData.data.length;
    }

    const groupsResponse = await fetch(`${baseURL}/all_groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const groupsData = await groupsResponse.json();
    if (document.getElementById('group-num')) {
      document.getElementById('group-num').innerText = groupsData.data.length;
    }

    const meetingsResponse = await fetch(`${baseURL}/meetings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const meetingsData = await meetingsResponse.json();
    if (document.getElementById('meeting-num')) {
      document.getElementById('meeting-num').innerText = meetingsData.data.length;
    }

    if (window.location.href.includes('admin-panel.html')) {
      chart.data = [
        {
          "type": "Students",
          "count": studentsData.data.length
        },
        {
          "type": "Tutors",
          "count": tutorsData.data.length
        },
        {
          "type": "Issues",
          "count": issuesData.data.length
        },
        {
          'type': 'Groups',
          'count': groupsData.data.length
        },
        {
          'type': 'Meetings',
          'count': meetingsData.data.length
        }
      ];
    }

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
        document.getElementById('tutor-modal-next').removeAttribute('disabled');
        selectedTutor = event.target.value;
      });
    });

    Array.prototype.filter.call(document.querySelectorAll('[name="student"]'), student => {
      student.addEventListener('change', event => {
       if (event.target.checked) {
         if (selectedStudents.length < 10) {
           selectedStudents.push(event.target.value);
           document.getElementById('allocate-btn-submit').removeAttribute('disabled');
         } else {
           window.alert('You can only assign 10 students to one tutor');
         }
       } else {
         selectedStudents = selectedStudents.filter(studIds => studIds !== event.target.value);
         if (selectedStudents.length < 1) {
           document.getElementById('allocate-btn-submit').setAttribute('disabled', 'true');
         }
       }
      });
    });

    document.getElementById('allocate-btn-submit').addEventListener('click', async () => {
      document.getElementById('allocate-btn-submit').setAttribute('disabled', 'true');
      try {
        const data = new FormData();
        data.append('tutorId', selectedTutor);
        for (let i = 0; i < selectedStudents.length; i++) {
          data.append('stdId[]', selectedStudents[i]);
        }
        const assignUserResponse = await fetch(`${baseURL}/assignUser`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: data
        });
        const assignUserData = await assignUserResponse.json();
        if (assignUserResponse.status !== 201) {
          alert(assignUserData.message);
          document.getElementById('myModal2').style.display = 'none';
        } else {
          alert('Assigned Specified Students to Specified Tutor Successfully!');
          document.getElementById('myModal2').style.display = 'none';
        }
      } catch (err) {
        console.error(err);
        alert('Something went wrong!');
        document.getElementById('myModal2').style.display = 'none';
      }
    });

    const userResponse = await fetch(`${baseURL}/get_user_info?userId=${userId}`, {
      method: 'GET'
    });
    const userData = await userResponse.json();
    document.getElementById('user-profile-info').insertAdjacentHTML(
      'beforeend',
      `<div class="profile-picture" style="margin-bottom: 60px;">
              <img src="${userData.data.user.image}" alt="">
            </div>
            <div class="profile-infor">
              <p class="fullname">${userData.data.user.name}</p>
              <p class="email">${userData.data.user.email}</p>
              <p class="description">${!userData.data.user.description ? '' : userData.data.user.description}</p>
            </div>`
    );
    document.getElementById('edit-profile-btn').addEventListener('click', event => {
      event.preventDefault();
      window.location = `./edit-profile.html?id=${userId}`;
    });
  } catch (err) {
    console.error(err);
  }
});
