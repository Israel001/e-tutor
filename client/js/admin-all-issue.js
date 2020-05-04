window.addEventListener('load', async () => {
  try {
    let page = window.location.href.split('=')[1];
    let issuesResponse;
    if (page) {
      page = parseInt(page);
      issuesResponse = await fetch(`${baseURL}/meetings?page=${page}`, {
        method: 'GET',
        headers: {Authorization: `Bearer ${token}`}
      });
    } else {
      issuesResponse = await fetch(`${baseURL}/issues`, {
        method: 'GET',
        headers: {Authorization: `Bearer ${token}`}
      });
    }
    const issuesData = await issuesResponse.json();
    document.getElementById('issues-table').insertAdjacentHTML(
      'beforeend',
      `<tr>
            <th>No</th>
            <th>Title</th>
            <th>Description</th>
            <th>Author</th>
            <th>Date</th>
          </tr>`
    );
    let index = page ? (page - 1) * 10 + 1 : 1;
    for (let i = 0; i < issuesData.data.length; i++) {
      document.getElementById('issues-table').insertAdjacentHTML(
        'beforeend',
        `
          <tr id="${issuesData.data[i]._id}">
            <td>${index}</td>
            <td>${issuesData.data[i].title.length > 20 ? issuesData.data[i].title.substring(0,20)+'...' : issuesData.data[i].title}</td>
            <td>${issuesData.data[i].description.length > 20 ? issuesData.data[i].description.substring(0,20)+'...' : issuesData.data[i].description}</td>
            <td><a id="issue-author-${issuesData.data[i].creator._id}-${i}" href="" data-target="#myModal3" data-toggle="modal">${issuesData.data[i].creator.name}</a></td>
            <td>${moment(issuesData.data[i].createdAt).format('MMMM Do YYYY, h:mm:ss a')}</td>
            <td><a class="view" href="issue-detail.html?id=${issuesData.data[i]._id}"><i class="fa fa-eye"></i>View</a></td>
            <td><a class="edit" href="admin-edit-issue.html?id=${issuesData.data[i]._id}"><i class="fa fa-edit"></i>Edit</a></td>
            <td><a class="remove" href="javascript:void(0);" id="delete-issue-${issuesData.data[i]._id}"><i class="fa fa-trash"></i>Delete</a></td>
          </tr>`
      );
      index += 1;

      document.getElementById(`delete-issue-${issuesData.data[i]._id}`).addEventListener('click', async () => {
        const deleteIssueResponse = await fetch(`${baseURL}/issue/${issuesData.data[i]._id}/delete`, {
          method: 'DELETE',
          headers: {Authorization: `Bearer ${token}`}
        });
        if (deleteIssueResponse.status === 200) {
          alert('Issue Deleted Successfully!');
          document.getElementById(`${issuesData.data[i]._id}`).remove();
        } else {
          alert(deleteIssueResponse.message);
        }
      });

      document.getElementById(`issue-author-${issuesData.data[i].creator._id}-${i}`).addEventListener('click', async () => {
        const userId = issuesData.data[i].creator._id;
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
      let numPages = Math.floor(issuesData.totalItems / 10);
      if ((issuesData.totalItems % 10) > 0) numPages += 1;
      if (numPages > 1) {
        document.querySelector('#pagination').insertAdjacentHTML(
          'beforeend',
          `<li class="page-item"><a style="cursor: pointer;" class="page-link" href="admin-all-issue.html?page=1">First</a></li>`
        );
      }
      if (numPages > 1) {
        for (let i = 0; i < numPages; i++) {
          document.querySelector('#pagination').insertAdjacentHTML(
            'beforeend',
            `<li class="${page ? page && page === i + 1 ? 'active' : '' : i + 1 === 1 ? 'active' : ''} page-item"><a style="cursor: pointer;" class="page-link" href="admin-all-issue.html?page=${i+1}">${i + 1}</a>`
          );
        }
      }
      if (numPages > 1) {
        document.querySelector('#pagination').insertAdjacentHTML(
          'beforeend',
          `<li class="page-item"><a style="cursor: pointer;" class="page-link" href="admin-all-issue.html?page=${numPages}">Last</a></li>`
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
});
