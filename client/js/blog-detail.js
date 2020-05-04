let postId;

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
      const updateCommentResponse = await fetch(`${baseURL}/post/${postId}/comment/${commentId}/edit`, {
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
        document.getElementById(`comment-date-${commentId}`).innerText = `${moment(updateCommentResponseDecoded.updatedComment.updatedAt).format('MMMM Do YYYY, h:mm:ss a')}`;
        alert('Comment Updated Successfully!');
      }
      document.getElementById('comment-edit-btn').style.display = 'none';
      document.getElementById('comment-btn').style.display = 'block';
    });
  });

  document.getElementById(`delete-comment-${commentId}`).addEventListener('click', async () => {
    const deleteCommentResponse = await fetch(`${baseURL}/post/${postId}/comment/${commentId}/delete`, {
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
    postId = window.location.href.split('=')[1];
    const response = await fetch(`${baseURL}/post/${postId}`, {
      method: 'GET',
      headers: {Authorization: `Bearer ${token}`}
    });
    const responseData = await response.json();
    document.getElementById('section-head').innerHTML = `<i class="fa fa-bars"></i> ${responseData.data.title} <small>${responseData.data.category}</small>`;
    document.getElementById('post-author').innerHTML = `by <a href="profile.html?id=${responseData.data.author._id}">${responseData.data.author.name}</a>`;
    document.getElementById('post-date').innerHTML = `<i class="fa fa-clock-o"></i> Posted on ${moment(responseData.data.createdAt).format('MMMM Do YYYY')} at ${moment(responseData.data.createdAt).format('h:mm:ss a')}`;
    document.getElementById('post-image').innerHTML = `<img src="${responseData.data.photo}" alt="">`;
    document.getElementById('post-content').innerHTML = responseData.data.body;
    document.getElementById('like-count').innerHTML = `<i class="fa fa-thumbs-up" style="cursor: pointer;" id="like-post"></i> <span id="likes-count">${responseData.data.likesCount}</span>`;
    document.getElementById('dislike-count').innerHTML = `<i class="fa fa-thumbs-down" style="cursor: pointer;" id="dislike-post"></i> <span id="dislikes-count">${responseData.data.dislikesCount}</span>`;

    let isLiked = responseData.data.likes.includes(userId);
    let isDisliked = responseData.data.dislikes.includes(userId);

    if (isLiked) document.getElementById('like-post').style.color = 'blue';
    if (isDisliked) document.getElementById('dislike-post').style.color = 'blue';

    document.getElementById('like-post').addEventListener('click', async () => {
      const response = await fetch(`${baseURL}/post/${postId}/like`, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`}
      });
      const responseData = await response.json();
      if (response.status === 201) {
        let isLiked = responseData.data.likes.includes(userId);

        if (isLiked) {
          document.getElementById('like-post').style.color = 'blue';
          document.getElementById('dislike-post').style.color = 'black';
        } else {
          document.getElementById('like-post').style.color = 'black';
        }

        document.getElementById('likes-count').innerText = responseData.data.likesCount;
        document.getElementById('dislikes-count').innerText = responseData.data.dislikesCount;
      }
    });
    document.getElementById('dislike-post').addEventListener('click', async () => {
      const response = await fetch(`${baseURL}/post/${postId}/dislike`, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`}
      });
      const responseData = await response.json();
      if (response.status === 201) {
        let isDisliked = responseData.data.dislikes.includes(userId);

        if (isDisliked) {
          document.getElementById('like-post').style.color = 'black';
          document.getElementById('dislike-post').style.color = 'blue';
        } else {
          document.getElementById('dislike-post').style.color = 'black';
        }

        document.getElementById('likes-count').innerText = responseData.data.likesCount;
        document.getElementById('dislikes-count').innerText = responseData.data.dislikesCount;
      }
    });

    const commentsResponse = await fetch(`${baseURL}/post/${postId}/comments`, {
      method: 'GET',
      headers: {Authorization: `Bearer ${token}`}
    });
    const commentsData = await commentsResponse.json();
    if (commentsData.comments.length > 0) {
      for (let i = 0; i < commentsData.comments.length; i++) {
        const comment = commentsData.comments[i];
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
      data.append('postId', postId);
      const createCommentResponse = await fetch(`${baseURL}/blog/comment`, {
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
        document.getElementById(`comment-date-${id}`).setAttribute('id', `comment-date-${createCommentResponseDecoded.data.createdComment._id}`);
        document.getElementById(`comment-content-${id}`).setAttribute('id', `comment-content-${createCommentResponseDecoded.data.createdComment._id}`);
        document.getElementById(`edit-comment-${id}`).setAttribute('id', `edit-comment-${createCommentResponseDecoded.data.createdComment._id}`);
        document.getElementById(`delete-comment-${id}`).setAttribute('id', `delete-comment-${createCommentResponseDecoded.data.createdComment._id}`);
        document.getElementById('comment').value = '';
      }
    });
  } catch (err) {
    console.error(err);
    alert('Something went wrong!');
  }
});
