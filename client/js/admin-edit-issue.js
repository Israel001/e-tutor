window.addEventListener('load', async () => {
  try {
    const issueId = window.location.href.split('=')[1];
    const issueResponse = await fetch(`${baseURL}/issue/${issueId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const issueData = await issueResponse.json();
    document.getElementById('edit-issue-title').value = issueData.data.title;
    document.getElementById('edit-issue-desc').value = issueData.data.description;
    let participants = [];

    const response = await fetch(`${baseURL}/get_all_active_users?pagination=false`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const responseData = await response.json();
    for (let i = 0; i < responseData.data.length; i++) {
      if (responseData.data[i]._id !== userId) {
        document.getElementById('edit-issue-modal-body').insertAdjacentHTML(
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

    Array.prototype.filter.call(document.querySelectorAll('[name="issue-members"]'), members => {
      for (let i = 0; i < issueData.data.assignTo.length; i++) {
        if (issueData.data.assignTo[i]._id === members.value) {
          participants.push(members.value);
          members.setAttribute('checked', true);
        }
      }
      members.addEventListener('change', event => {
        if (event.target.checked) {
          participants.push(event.target.value);
        } else {
          participants = participants.filter(userIds => userIds !== event.target.value);
        }
      });
    });

    document.getElementById('btn-edit-issue').addEventListener('click', async event => {
      event.preventDefault();
      document.getElementById('btn-edit-issue').remove();
      document.getElementById('edit-issue-form').insertAdjacentHTML(
        'beforeend',
        `<div id="loader" class="loader" style="margin-top: 10rem;">`
      );
      const title = document.getElementById('edit-issue-title').value;
      const desc = document.getElementById('edit-issue-desc').value;
      const uploadedFiles = document.getElementById('edit-issue-files').files;
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
              document.getElementById('edit-issue-form').insertAdjacentHTML(
                'beforeend',
                `<button id="edit-issue-btn" class="btn-create-issue">Update Issue</button>`
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
                  const editIssueResponse = await fetch(`${baseURL}/issue/${issueId}/edit`, {
                    method: 'PUT',
                    headers: {Authorization: `Bearer ${token}`},
                    body: data
                  });
                  if (editIssueResponse.status !== 201) {
                    for (let i = 0; i < fileRefs.length; i++) {
                      fileRefs[i].delete().then(() => {
                        console.log('File Deleted Successfully');
                      }).catch(err => {
                        console.error(err);
                      });
                    }
                    setErrorMessage({
                      btnArea: 'edit-issue-form',
                      btnName: 'Update Issue',
                      msgArea: 'form-msg',
                      msg: editIssueResponse.message,
                      btnId: 'btn-edit-issue'
                    });
                  } else {
                    location.href = './admin-all-issue.html';
                  }
                }
              });
            });
          });
        }
      } else {
        const data = new FormData();
        data.append('title', title);
        data.append('description', desc);
        for (let i = 0; i < participants.length; i++) {
          data.append('toUserId[]', participants[i]);
        }
        const editIssueResponse = await fetch(`${baseURL}/issue/${issueId}/edit`, {
          method: 'PUT',
          headers: {Authorization: `Bearer ${token}`},
          body: data
        });
        if (editIssueResponse.status !== 201) {
          setErrorMessage({
            btnArea: 'edit-issue-form',
            btnName: 'Update Issue',
            msgArea: 'form-msg',
            msg: editIssueResponse.message,
            btnId: 'btn-edit-issue'
          });
        } else {
          location.href = './admin-all-issue.html';
        }
      }
    });
  } catch (err) {
    console.error(err);
    alert('Something went wrong!');
  }
});
