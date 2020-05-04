window.addEventListener('load', async () => {
  try {
    let page = window.location.href.split('=')[1];
    let commentsResponse;
    if (page) {
      page = parseInt(page);
      commentsResponse = await fetch(`${baseURL}/comments?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      commentsResponse = await fetch(`${baseURL}/comments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
    }
    const commentsResponseData = await commentsResponse.json();
    document.getElementById('comments-table').insertAdjacentHTML(
      'beforeend',
      `<tr>
                <th>No</th>
                <th>Comment</th>
                <th>Author</th>
                <th>Post / Issue</th>
                <th>Date</th>
            </tr>`
    );
    let index = page ? (page - 1) * 10 + 1 : 1;
    for (let i = 0; i < commentsResponseData.data.length; i ++) {
      document.getElementById('comments-table').insertAdjacentHTML(
        'beforeend',
        `<tr id="${commentsResponseData.data[i]._id}">
                <td>${index}</td>
                <td>${commentsResponseData.data[i].comment.length > 50 ? commentsResponseData.data[i].comment.substring(0, 50)+'...' : commentsResponseData.data[i].comment}</td>
                <td><a id="profile-${commentsResponseData.data[i].from._id}-${i}" data-toggle="modal" data-target="#myModal3" href="">${commentsResponseData.data[i].from.name}</a></td>
                <td>${commentsResponseData.data[i].issue ? `<a href="issue-detail.html?id=${commentsResponseData.data[i].issue._id}">${commentsResponseData.data[i].issue.title}</a>` : `<a href="blog-detail.html?id=${commentsResponseData.data[i].post._id}">${commentsResponseData.data[i].post.title.length > 20 ? commentsResponseData.data[i].post.title.substring(0,20)+'...' : commentsResponseData.data[i].post.title}</a>`}</td>
                <td>${moment(commentsResponseData.data[i].createdAt).format('MMMM Do YYYY, h:mm:ss a')}</td>
                <td><a class="remove" href="javascript:void(0);" id="delete-${commentsResponseData.data[i]._id}"><i class="fa fa-trash"></i>Delete</a></td>
            </tr>`
      );
      index += 1;

      document.getElementById(`delete-${commentsResponseData.data[i]._id}`).addEventListener('click', async () => {
        const deleteCommentResponse = await fetch(`${baseURL}/issue/${commentsResponseData.data[i].issue._id}/comment/${commentsResponseData.data[i]._id}/delete`, {
          method: 'DELETE',
          headers: {Authorization: `Bearer ${token}`}
        });
        if (deleteCommentResponse.status === 200) {
          alert('Comment Deleted Successfully!');
          document.getElementById(`${commentsResponseData.data[i]._id}`).remove();
        } else {
          alert(deleteCommentResponse.message);
        }
      });

      document.getElementById(`profile-${commentsResponseData.data[i].from._id}-${i}`).addEventListener('click', async () => {
        const userId = commentsResponseData.data[i].from._id;
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
      document.getElementById('comments').insertAdjacentHTML(
        'beforeend',
        `<div class="pagination-page full"><ul class="pagination" id="pagination"></div>`
      );
      let numPages = Math.floor(commentsResponseData.totalItems / 10);
      if ((commentsResponseData.totalItems % 10) > 0) numPages += 1;
      if (numPages > 1) {
        document.querySelector('#pagination').insertAdjacentHTML(
          'beforeend',
          `<li class="page-item"><a style="cursor: pointer;" class="page-link" href="admin-comment.html?page=1">First</a></li>`
        );
      }
      if (numPages > 1) {
        for (let i = 0; i < numPages; i++) {
          document.querySelector('#pagination').insertAdjacentHTML(
            'beforeend',
            `<li class="${page ? page && page === i + 1 ? 'active' : '' : i + 1 === 1 ? 'active' : ''} page-item"><a style="cursor: pointer;" class="page-link" href="admin-comment.html?page=${i+1}">${i + 1}</a>`
          );
        }
      }
      if (numPages > 1) {
        document.querySelector('#pagination').insertAdjacentHTML(
          'beforeend',
          `<li class="page-item"><a style="cursor: pointer;" class="page-link" href="admin-comment.html?page=${numPages}">Last</a></li>`
        );
      }
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong!');
  }
});
