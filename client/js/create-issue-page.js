let uploadTask, title, desc, fileRef, files;
const fileDownloadUrls = [];
const fileRefs = [];
const participants = [];

const createIssue = () => {
  uploadTask.snapshot.ref.getDownloadURL().then(async downloadURL => {
    fileDownloadUrls.push(downloadURL);
    fileRefs.push(fileRef);
    if (fileDownloadUrls.length === files.length) {
      const data = new FormData();
      data.append('title', title);
      data.append('description', desc);
      for (let i = 0; i < fileDownloadUrls.length; i++) {
        data.append('files[]', fileDownloadUrls[i]);
      }
      for (let i = 0; i < participants.length; i++) {
        data.append('toUserId[]', participants[i]);
      }
      const createIssueResponse = await fetch(`${baseURL}/issue/create`, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: data
      });
      const createIssueData = await createIssueResponse.json();
      if (createIssueResponse.status !== 201) {
        for (let i = 0; i < fileRefs.length; i++) {
          fileRefs[i].delete().then(() => {
            console.log('File Deleted Successfully');
          }).catch(err => {
            console.error(err);
          });
        }
        alert(createIssueData.message);
      } else {
        alert('Issue Created Successfully!');
        location.href = './issue-page.html';
      }
    }
  });
};

window.addEventListener('load', async () => {
  try {
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

    document.getElementById('create-issue-btn').addEventListener('click', async () => {
      if (participants.length < 1) {
        alert('You have to select at least 1 participant');
      } else {
        document.getElementById('create-issue-btn').remove();
        document.getElementById('create-issue-btn-area').insertAdjacentHTML(
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
                document.getElementById('create-issue-btn-area').insertAdjacentHTML(
                  'beforeend',
                  `<button id="create-issue-btn" class="btn-create-issue">Create New Issue</button>`
                );
                alert('File Uploading Failed!');
              }, createIssue);
            });
          }
        } else {
          const data = new FormData();
          data.append('title', title);
          data.append('description', desc);
          for (let i = 0; i < participants.length; i++) {
            data.append('toUserId[]', participants[i]);
          }
          const createIssueResponse = await fetch(`${baseURL}/issue/create`, {
            method: 'POST',
            headers: {Authorization: `Bearer ${token}`},
            body: data
          });
          const createIssueData = await createIssueResponse.json();
          if (createIssueResponse.status !== 201) {
            for (let i = 0; i < fileRefs.length; i++) {
              fileRefs[i].delete().then(() => {
                console.log('File Deleted Successfully');
              }).catch(err => {
                console.error(err);
              });
            }
            alert(createIssueData.message);
          } else {
            alert('Issue Created Successfully!');
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
