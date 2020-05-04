window.addEventListener('load', async () => {
  try {
    const response = await fetch(`${baseURL}/get_all_active_users?pagination=false`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const responseData = await response.json();
    for (let i = 0; i < responseData.data.length; i++) {
      if (responseData.data[i]._id !== userId) {
        document.getElementById('issue-members-modal-body').insertAdjacentHTML(
          'beforeend',
          `<div class="profile-student full">
              <div class="s-name">
                ${responseData.data[i].name}
              </div>
              <div class="s-image">
                <img src="${responseData.data[i].image}" alt="">
              </div>
              <div class="s-check">
                <input value="${responseData.data[i]._id}" type="checkbox" class="chk" name="issue-members">
              </div>
            </div>`
        );
      }
    }

    let participants = [];

    Array.prototype.filter.call(document.querySelectorAll('[name="issue-members"]'), members => {
      members.addEventListener('change', event => {
        if (event.target.checked) {
          participants.push(event.target.value);
        } else {
          participants = participants.filter(userIds => userIds !== event.target.value);
        }
      });
    });

    document.getElementById('create-issue-btn').addEventListener('click', async event => {
      event.preventDefault();
      document.getElementById('create-issue-btn').remove();
      document.getElementById('add-issue-form').insertAdjacentHTML(
        'beforeend',
        `<div id="loader" class="loader" style="margin-top: 10rem;">`
      );
      const title = document.getElementById('issue-title').value;
      const desc = document.getElementById('issue-desc').value;
      const uploadedFiles = document.getElementById('issue-files').files;
      const fileRefs = [];
      const files = [];
      if (uploadedFiles.length > 0) {
        for (let i = 0; i < uploadedFiles.length; i++) {
          generateBase64FromFile(uploadedFiles[i]).then(file => {
            const storageRef = firebase.storage().ref();
            const fileRef = storageRef.child(`${new Date().getTime().toString()}-${uploadedFiles[i].name}`);
            const uploadTask = fileRef.putString(file, 'data_url');
            uploadTask.on('state_changed', () => {
            }, error => {
              console.error(error);
              document.getElementById('loader').remove();
              document.getElementById('add-issue-form').insertAdjacentHTML(
                'beforeend',
                `<button id="create-issue-btn" class="btn-create-issue">Create New Issue</button>`
              );
              setErrorMessage({
                btnArea: 'edit-issue-form',
                btnName: 'Update Issue',
                msgArea: 'form-msg',
                msg: 'Image Uploading Failed!',
                btnId: 'btn-edit-issue'
              });
            }, () => {
              uploadTask.snapshot.ref.getDownloadURL().then(async downloadURL => {
                files.push(downloadURL);
                fileRefs.push(fileRef);
                if (files.length === uploadedFiles.length) {
                  const data = new FormData();
                  data.append('title', title);
                  data.append('description', desc);
                  for (let i = 0; i < files.length; i++) {
                    data.append('files[]', files[i]);
                  }
                  for (let i = 0; i < participants.length; i++) {
                    data.append('toUserId[]', participants[i]);
                  }
                  const createIssueResponse = await fetch(`${baseURL}/issue/create`, {
                    method: 'POST',
                    headers: {Authorization: `Bearer ${token}`},
                    body: data
                  });
                  if (createIssueResponse.status !== 201) {
                    for (let i = 0; i < fileRefs.length; i++) {
                      fileRefs[i].delete().then(() => {
                        console.log('File Deleted Successfully');
                      }).catch(err => {
                        console.error(err);
                      });
                    }
                    setErrorMessage({
                      btnArea: 'add-issue-form',
                      btnName: 'Create New Issue',
                      msgArea: 'form-msg',
                      msg: createIssueResponse.message,
                      btnId: 'create-issue-btn'
                    });
                  } else {
                    document.getElementById('form-msg').innerHTML = '';
                    document.getElementById('form-msg').insertAdjacentHTML(
                      'afterbegin',
                      `<div class="alert alert-success">
                        <a href="javascript:void(0);" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                        <strong>Success:</strong> Issue Created Successfully. <a href="admin-all-issue.html" style="color: #337ab7;">View Issues?</a>
                      </div>`
                    );
                    document.getElementById('loader').remove();
                    document.getElementById('add-issue-form').insertAdjacentHTML(
                      'beforeend',
                      `<button id="create-issue-btn" type="submit">Create New Issue</button>`
                    );
                    document.getElementById('issue-title').value = '';
                    document.getElementById('issue-desc').value = '';
                    document.getElementById('issue-files').value = '';
                  }
                }
              });
            });
          });
        }
      }
    });
  } catch (err) {
    console.error(err);
    alert('Something went wrong!');
  }
});
