window.addEventListener('load', async () => {
  try {
    let page = window.location.href.split('=')[1];
    let meetingsResponse;
    if (page) {
      page = parseInt(page);
      meetingsResponse = await fetch(`${baseURL}/meetings?page=${page}`, {
        method: 'GET',
        headers: {Authorization: `Bearer ${token}`}
      });
    } else {
      meetingsResponse = await fetch(`${baseURL}/meetings`, {
        method: 'GET',
        headers: {Authorization: `Bearer ${token}`}
      });
    }
    const meetingsData = await meetingsResponse.json();
    document.getElementById('meetings-table').insertAdjacentHTML(
      'beforeend',
      `<tr>
            <th>No</th>
            <th>Title</th>
            <th>Organizer</th>
            <th>Date</th>
            <th>Status</th>
          </tr>`
    );
    let index = page ? (page - 1) * 10 + 1 : 1;
    for (let i = 0; i < meetingsData.data.length; i++) {
      document.getElementById('meetings-table').insertAdjacentHTML(
        'beforeend',
        `
          <tr>
            <td>${index}</td>
            <td>${meetingsData.data[i].title.length > 50 ? meetingsData.data[i].title.substring(0,50)+'...' : meetingsData.data[i].title}</td>
            <td><a id="meeting-organizer-${meetingsData.data[i].organizer._id}-${i}" href="" data-target="#myModal3" data-toggle="modal">${meetingsData.data[i].organizer.name}</a></td>
            <td>${moment(meetingsData.data[i].date).format('MMMM Do YYYY, h:mm:ss a')}</td>
            <td>${meetingsData.data[i].status}</td>
          </tr>`
      );
      index += 1;

      document.getElementById(`meeting-organizer-${meetingsData.data[i].organizer._id}-${i}`).addEventListener('click', async () => {
        const userId = meetingsData.data[i].organizer._id;
        if (!document.getElementById(`profile-card-${userId}`)) {
          document.getElementById('user-profile-info').innerHTML = '';
          const userResponse = await fetch(`${baseURL}/get_user_info?userId=${userId}`, {
            method: 'GET',
            headers: {Authorization: `Bearer ${token}`}
          });
          const userData = await userResponse.json();
          document.getElementById('user-profile-info').insertAdjacentHTML(
            'beforeend',
            `<div id="profile-card-${userId}" class="profile-picture" style="margin-bottom: 60px;">
              <img src="${userData.data.user.image}" alt="">
            </div>
            <div class="profile-infor">
              <p class="fullname">${userData.data.user.name}</p>
              <p class="email">${userData.data.user.email}</p>
              <p class="description">${!userData.data.user.description ? '' : userData.data.user.description}</p>
              <p>${!userData.data.user.students ? '' : `<b>Students</b>: ${userData.data.user.students.length > 0 ? userData.data.user.students.map(el => el.name) : 'No Students'}`}</p>
              <p>${!userData.data.user.tutor ? '' : `<b>Tutor</b>: ${userData.data.user.tutor ? userData.data.user.tutor.name : 'No Tutor'}`}</p>
              <p><b>Created At</b>: ${moment(userData.data.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</p>
            </div>`
          );
          document.getElementById('edit-profile-btn').addEventListener('click', event => {
            event.preventDefault();
            window.location = `./edit-profile.html?id=${userId}`;
          });
        }
      });
    }
    if (!document.getElementById('pagination')) {
      document.getElementById('users').insertAdjacentHTML(
        'beforeend',
        `<div class="pagination-page full"><ul class="pagination" id="pagination"></div>`
      );
      let numPages = Math.floor(meetingsData.totalItems / 10);
      if ((meetingsData.totalItems % 10) > 0) numPages += 1;
      if (numPages > 1) {
        document.querySelector('#pagination').insertAdjacentHTML(
          'beforeend',
          `<li class="page-item"><a style="cursor: pointer;" class="page-link" href="admin-all-meeting.html?page=1">First</a></li>`
        );
      }
      if (numPages > 1) {
        for (let i = 0; i < numPages; i++) {
          document.querySelector('#pagination').insertAdjacentHTML(
            'beforeend',
            `<li class="${page ? page && page === i + 1 ? 'active' : '' : i + 1 === 1 ? 'active' : ''} page-item"><a style="cursor: pointer;" class="page-link" href="admin-all-meeting.html?page=${i+1}">${i + 1}</a>`
          );
        }
      }
      if (numPages > 1) {
        document.querySelector('#pagination').insertAdjacentHTML(
          'beforeend',
          `<li class="page-item"><a style="cursor: pointer;" class="page-link" href="admin-all-meeting.html?page=${numPages}">Last</a></li>`
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
});
