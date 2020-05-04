let issueId;

const addToComments = (commentId, userId, userPhoto, userName, date, comment) => {
  document.getElementById('comments').insertAdjacentHTML(
    'beforeend',
    `<div class="cmt-content full" id="${commentId}">
                <div class="img-cmt">
                  <img src="${userPhoto}" alt="">
                </div>
                <div class="cmt-right">
                  <div class="user-cmt">
                    <p><a href="profile.html?id=${userId}">${userName}</a></p>
                    <p id="comment-date-${commentId}">${date}</p>
                  </div>
                <div class="content">
                  <p id="comment-content-${commentId}">${comment}</p>
                </div>
                <a href="javascript:void(0);" id="edit-comment-${commentId}" class="edit-cmt"><i class="fa fa-edit"></i>Edit</a>
                <a href="javascript:void(0);" id="delete-comment-${commentId}" class="remove-cmt"><i class="fa fa-trash"></i>Delete</a>
              </div>
          </div>`
  );
  document.getElementById(`edit-comment-${commentId}`).addEventListener('click', async () => {
    document.getElementById('comment').value = comment;
    document.getElementById('comment-btn').style.display = 'none';
    document.getElementById('comment-form').insertAdjacentHTML(
      'beforeend',
      `<button id="comment-edit-btn" class="btn-create-issue">Update</button>`
    );
    document.getElementById('comment-edit-btn').addEventListener('click', async event => {
      event.preventDefault();
      const data = new FormData();
      data.append('comment', document.getElementById('comment').value);
      const updateCommentResponse = await fetch(`${baseURL}/issue/${issueId}/comment/${commentId}/edit`, {
        method: 'PUT',
        headers: {Authorization: `Bearer ${token}`},
        body: data
      });
      const updateCommentResponseDecoded = await updateCommentResponse.json();
      if (updateCommentResponse.status !== 200) {
        alert(updateCommentResponse.message);
      } else {
        document.getElementById('comment').value = '';
        document.getElementById(`comment-content-${commentId}`).innerText = `${updateCommentResponseDecoded.updatedComment.comment}`;
        document.getElementById(`comment-date-${commentId}`).innerText = `${moment(updateCommentResponseDecoded.updatedComment.updatedAt).format('MMMM Do YYYY, h:mm:ss a')}`
        alert('Comment Updated Successfully!');
      }
      document.getElementById('comment-edit-btn').style.display = 'none';
      document.getElementById('comment-btn').style.display = 'block';
    });
  });

  document.getElementById(`delete-comment-${commentId}`).addEventListener('click', async () => {
    const deleteCommentResponse = await fetch(`${baseURL}/issue/${issueId}/comment/${commentId}/delete`, {
      method: 'DELETE',
      headers: {Authorization: `Bearer ${token}`}
    });
    if (deleteCommentResponse.status !== 200) {
      alert(deleteCommentResponse.message);
    } else {
      document.getElementById(`${commentId}`).remove();
      alert('Comment Deleted Successfully');
    }
  });
};

window.addEventListener('load', async () => {
  try {
    issueId = window.location.href.split('=')[1];
    if (!issueId) window.history.back();
    const issueResponse = await fetch(`${baseURL}/issue/${issueId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const issueResponseDecoded = await issueResponse.json();
    document.getElementById('title-issue').innerText = `${issueResponseDecoded.data.title}`;
    document.getElementById('issue-title').innerHTML = `Title: ${issueResponseDecoded.data.title}`;
    document.getElementById('issue-author').innerHTML = `Creator: <a href="profile.html?id=${issueResponseDecoded.data.creator._id}">${issueResponseDecoded.data.creator.name}</a>`;
    document.getElementById('issue-participants').innerHTML = `Participants: ${issueResponseDecoded.data.assignTo.map(el => ` <a href="profile.html?id=${el._id}">${el.name}</a>`)}`;
    document.getElementById('issue-date').innerHTML = `Date: ${moment(issueResponseDecoded.data.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`;
    document.getElementById('issue-desc').innerHTML = `<p>${issueResponseDecoded.data.description}</p>`;
    for (let i = 0; i < issueResponseDecoded.data.files.length; i++) {
      const file = issueResponseDecoded.data.files[i];
      if (file.includes('jpg') || file.includes('jpeg') || file.includes('png') || file.includes('gif')) {
        document.getElementById('issue-files').insertAdjacentHTML(
          'beforeend',
          `<div class="file-item">
                  <a href="" data-toggle="modal" data-target="#myModal1">
                    <div class="item-thumb">
                      <img src="${file}" alt="Issue File" id="${i}">
                    </div>
                  </a>
                </div>`
        );
        document.getElementById(`${i}`).addEventListener('click', () => {
          document.getElementById('modal-image').setAttribute('src', `${document.getElementById(`${i}`).getAttribute('src')}`);
        });
      } else {
        document.getElementById('issue-files').insertAdjacentHTML(
          'beforeend',
          `<div class="file-item">
                  <a href="" data-toggle="modal" data-target="#myModal2">
                    <div class="item-thumb document-pdf" id="${i}" data-value="${file}">
                    </div>
                  </a>
                </div>`
        );
        document.getElementById(`${i}`).addEventListener('click', () => {
          const fileURL = document.getElementById(`${i}`).getAttribute('data-value');
          document.getElementById('modal-file').setAttribute('href', `${fileURL}`);
        });
      }
    }
    const issueCommentsResponse = await fetch(`${baseURL}/issue/${issueId}/comments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const issueCommentsResponseDecoded = await issueCommentsResponse.json();
    if (issueCommentsResponseDecoded.comments.length > 0) {
      for (let i = 0; i < issueCommentsResponseDecoded.comments.length; i++) {
        const comment = issueCommentsResponseDecoded.comments[i];
        addToComments(
          comment._id, comment.from._id, comment.from.image,
          comment.from.name,
          moment(comment.createdAt).format('MMMM Do YYYY, h:mm:ss a'),
          comment.comment
        );
      }
    }
    document.getElementById('comment-btn').addEventListener('click', async event => {
      event.preventDefault();
      const id = 0;
      addToComments(
        id, userId, userPhoto, userName,
        moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a'),
        document.getElementById('comment').value
      );
      const data = new FormData();
      data.append('comment', document.getElementById('comment').value);
      data.append('issueId', issueId);
      const createCommentResponse = await fetch(`${baseURL}/addComment`, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: data
      });
      const createCommentResponseDecoded = await createCommentResponse.json();
      if (createCommentResponse.status !== 201) {
        document.getElementById('comment').value = '';
        alert(createCommentResponseDecoded.message);
      } else {
        document.getElementById(`${id}`).setAttribute('id', `${createCommentResponseDecoded.data.createdComment._id}`);
        document.getElementById('comment').value = '';
      }
    });
  } catch (err) {
    console.error(err);
    alert('Something went wrong');
  }
});
