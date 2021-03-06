let uploadTask, title, desc, fileRef, files, issueId;
const fileDownloadUrls = [];
const fileRefs = [];
const participants = [];

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
    if (issueResponseDecoded.data.creator._id !== userId) {
      document.getElementById('title').style.display = 'none';
      document.getElementById('description').style.display = 'none';
      document.getElementById('participants').style.display = 'none';
      document.getElementById('title-label').style.display = 'none';
      document.getElementById('description-label').style.display = 'none';
      document.getElementById('select-people-btn').style.display = 'none';
    }
    document.getElementById('issue').innerText = `${issueResponseDecoded.data.title}`;
    document.getElementById('issue').setAttribute('href', `issue-detail.html?id=${issueResponseDecoded.data._id}`);
    document.getElementById('title').value = `${issueResponseDecoded.data.title}`;
    document.getElementById('description').value = `${issueResponseDecoded.data.description}`;
    document.getElementById('files').insertAdjacentHTML(
      'beforeend',
      `${issueResponseDecoded.data.files.length > 0 ? issueResponseDecoded.data.files.map((el, index) => ` <a href="${el}" target="_blank">File ${index+1}</a>`) : 'No Files Selected'}`
    );
    document.getElementById('participants').insertAdjacentHTML(
      'beforeend',
      `${issueResponseDecoded.data.assignTo.map(el => ` <a id="${el._id}" href="profile.html?id=${el._id}">${el.name}</a>`)}`
    );

    for (let i = 0; i < issueResponseDecoded.data.files.length; i++) {
      fileDownloadUrls.push(issueResponseDecoded.data.files[0]);
    }
    for (let i = 0; i < issueResponseDecoded.data.assignTo.length; i++) {
      participants.push(issueResponseDecoded.data.assignTo[i]._id);
    }

    const activeTutorsResponse = await fetch(`${baseURL}/get_active_tutors?pagination=false`);
    const activeTutorsResponseDecoded = await activeTutorsResponse.json();
    if (activeTutorsResponseDecoded.data.activeTutors.length > 0) {
      for (let i = 0; i < activeTutorsResponseDecoded.data.activeTutors.length; i++) {
        document.getElementById('modal-body').insertAdjacentHTML(
          'beforeend',
          `<div class="profile-tutor full">
                  <div class="t-name">
                    ${activeTutorsResponseDecoded.data.activeTutors[i].name}
                  </div>
                  <div class="t-image">
                    <img src="${activeTutorsResponseDecoded.data.activeTutors[i].image}" alt="">
                  </div>
                  <div class="t-select">
                    <input type="checkbox" class="chk" name="tutor" value="${activeTutorsResponseDecoded.data.activeTutors[i]._id}" data-attribute="${activeTutorsResponseDecoded.data.activeTutors[i].name}">
                  </div>
              </div>`
        );
      }

      Array.prototype.filter.call(document.querySelectorAll('[name="tutor"]'), tutor => {
        if (participants.includes(tutor.value)) {
          tutor.setAttribute('checked', true);
        }
        tutor.addEventListener('change', event => {
          if (event.target.checked) {
            participants.push(event.target.value);
            document.getElementById('participants').insertAdjacentHTML(
              'beforeend',
              `<span id="${event.target.value}">${event.target.getAttribute('data-attribute')}</span>`
            );
          } else {
            participants.filter(tutorId => tutorId !== event.target.value);
            document.getElementById(event.target.value).remove();
          }
        });
      });
    }

    document.getElementById('edit-issue-btn').addEventListener('click', async () => {
      if (participants.length < 1) {
        alert('You have to select at least 1 participant');
      } else {
        document.getElementById('edit-issue-btn').remove();
        document.getElementById('edit-issue-btn-area').insertAdjacentHTML(
          'beforeend',
          `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12" id="loader">
              <div class="loader"></div>
            </div>`
        );
        title = document.getElementById('title').value;
        desc = document.getElementById('description').value;
        files = document.getElementById('inputFile').files;
        if (files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            generateBase64FromFile(files[i]).then(file => {
              const storageRef = firebase.storage().ref();
              fileRef = storageRef.child(`${new Date().getTime().toString()}-${files[i].name}`);
              uploadTask = fileRef.putString(file, 'data_url');
              uploadTask.on('state_changed', () => {
              }, error => {
                console.error(error);
                document.getElementById('loader').remove();
                document.getElementById('edit-issue-btn-area').insertAdjacentHTML(
                  'beforeend',
                  `<button id="edit-issue-btn" class="btn-create-issue">Update Issue</button>`
                );
                alert('File Uploading Failed!');
              }, () => {
                uploadTask.snapshot.ref.getDownloadURL().then(async downloadURL => {
                  fileDownloadUrls.push(downloadURL);
                  fileRefs.push(fileRef);
                  const data = new FormData();
                  data.append('title', title);
                  data.append('description', desc);
                  for (let i = 0; i < fileDownloadUrls.length; i++) {
                    data.append('files[]', fileDownloadUrls[i]);
                  }
                  for (let i = 0; i < participants.length; i++) {
                    data.append('assignTo[]', participants[i]);
                  }
                  const editIssueResponse = await fetch(`${baseURL}/issue/${issueId}/edit`, {
                    method: 'PUT',
                    headers: {Authorization: `Bearer ${token}`},
                    body: data
                  });
                  const editIssueData = await editIssueResponse.json();
                  if (editIssueResponse.status !== 201) {
                    for (let i = 0; i < fileRefs.length; i++) {
                      fileRefs[i].delete().then(() => {
                        console.log('File Deleted Successfully');
                      }).catch(err => {
                        console.error(err);
                      });
                    }
                    alert(editIssueData.message);
                  } else {
                    alert('Issue Updated Successfully!');
                    window.history.back();
                  }
                })
              })
            });
          }
        } else {
          const data = new FormData();
          data.append('title', title);
          data.append('description', desc);
          for (let i = 0; i < participants.length; i++) {
            data.append('assignTo[]', participants[i]);
          }
          const editIssueResponse = await fetch(`${baseURL}/issue/${issueId}/edit`, {
            method: 'PUT',
            headers: {Authorization: `Bearer ${token}`},
            body: data
          });
          const editIssueData = await editIssueResponse.json();
          if (editIssueResponse.status !== 201) {
            for (let i = 0; i < fileRefs.length; i++) {
              fileRefs[i].delete().then(() => {
                console.log('File Deleted Successfully');
              }).catch(err => {
                console.error(err);
              });
            }
            alert(editIssueData.message);
          } else {
            alert('Issue Updated Successfully!');
            location.href = './issue-page.html';
          }
        }
      }
    });
  } catch (err) {
    console.error(err);
    alert('Something went wrong');
  }
});
