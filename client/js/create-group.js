window.addEventListener('load', async () => {
  try {
    const response = await fetch(`${baseURL}/get_all_active_users?pagination=false`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const responseData = await response.json();
    for (let i = 0; i < responseData.data.length; i++) {
      if (responseData.data[i]._id !== userId) {
        document.getElementById('group-members-list').insertAdjacentHTML(
          'beforeend',
          `<div class="profile-student full">
              <div class="s-name">
                ${responseData.data[i].name}
              </div>
              <div class="s-image">
                <img src="${responseData.data[i].image}" alt="">
              </div>
              <div class="s-check">
                <input value="${responseData.data[i]._id}" type="checkbox" class="chk" name="group-members">
              </div>
            </div>`
        );
      }
    }

    document.getElementById('group-name').addEventListener('change', event => {
      if (event.target.value.trim().length > 0 && document.getElementById('file').files.length > 0) {
        document.getElementById('btn-next').removeAttribute('disabled');
      } else {
        document.getElementById('btn-next').setAttribute('disabled', 'true');
      }
    });

    document.getElementById('file').addEventListener('change', event => {
      if (event.target.files.length > 0 && document.getElementById('group-name').value.trim().length > 0) {
        document.getElementById('btn-next').removeAttribute('disabled');
      } else {
        document.getElementById('btn-next').setAttribute('disabled', 'true');
      }
    });

    let selectedMembers = [];

    Array.prototype.filter.call(document.querySelectorAll('[name="group-members"]'), members => {
      members.addEventListener('change', event => {
        if (event.target.checked) {
          document.getElementById('group-submit').removeAttribute('disabled');
          selectedMembers.push(event.target.value);
        } else {
          selectedMembers = selectedMembers.filter(userIds => userIds !== event.target.value);
          if (selectedMembers.length < 1) {
            document.getElementById('group-submit').setAttribute('disabled', 'true');
          }  else {
            document.getElementById('group-submit').removeAttribute('disabled');
          }
        }
      });
    });

    document.getElementById('group-submit').addEventListener('click', async () => {
      document.getElementById('group-submit').setAttribute('disabled', 'true');
      const title = document.getElementById('group-name').value;
      const image = document.getElementById('file').files[0];
      generateBase64FromFile(image).then(img => {
        const storageRef = firebase.storage().ref();
        const imageRef = storageRef.child(`${new Date().getTime().toString()}-${image.name}`);
        const uploadTask = imageRef.putString(img, 'data_url');
        uploadTask.on('state_changed', () => {}, error => {
          console.error(error);
          document.getElementById('group-submit').removeAttribute('disabled');
        }, () => {
          uploadTask.snapshot.ref.getDownloadURL().then(async downloadURL => {
            try {
              const data = new FormData();
              data.append('title', title);
              for (let i = 0; i < selectedMembers.length; i++) {
                data.append('members[]', selectedMembers[i]);
              }
              data.append('image', downloadURL);
              const createGroupResponse = await fetch(`${baseURL}/group/create`, {
                method: 'POST',
                headers: {Authorization: `Bearer ${token}`},
                body: data
              });
              const createGroupData = await createGroupResponse.json();
              if (createGroupResponse.status !== 201) {
                imageRef.delete().then(() => {
                  console.log('File Deleted Successfully');
                }).catch(err => { console.error(err); });
                alert(createGroupData.message);
              } else {
                alert('Group Created Successfully!');
                location.href = './list-group.html';
              }
            } catch (err) {
              console.error(err);
              alert('Something went wrong!');
            }
          });
        });
      });
    });
  } catch (err) {
    console.error(err);
  }
});
