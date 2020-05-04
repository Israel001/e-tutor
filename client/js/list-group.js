let selectedMembers = [];

window.addEventListener('load', async () => {
  const groupsResponse = await fetch(`${baseURL}/all_groups`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  const groupsData = await groupsResponse.json();

  for (let i = 0; i < groupsData.data.length; i++) {
    document.getElementById('groups').insertAdjacentHTML(
      'beforeend',
      `<div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
            <div class="row">
              <div class="group-card" id="group-${groupsData.data[i]._id}">
                <div class="image-group">
                    <img src="${groupsData.data[i].image}" alt="">
                </div>
                <div class="infor-group">
                  <p class="name">${groupsData.data[i].title}</p>
                  <p class="number"><span>${groupsData.data[i].members.length} </span> members</p> 
                </div>
                <div class="see-more">
                  <a id="${groupsData.data[i]._id}" style="cursor: pointer; text-decoration: none;" data-toggle="modal" data-target="#myModal6">View Members</a>
                  <a id="edit-group-${groupsData.data[i]._id}" data-toggle="modal" data-target="#myModal7" href="" class="edit"><i class="fa fa-edit"></i>Edit Group</a>
                  <a href="javascript:void(0);" id="delete-group-${groupsData.data[i]._id}" class="remove"><i class="fa fa-trash"></i>Delete Group</a>
                </div>
              </div>
          </div>
        </div>`
    );
    document.getElementById(`delete-group-${groupsData.data[i]._id}`).addEventListener('click', async () => {
      const deleteGroupResponse = await fetch(`${baseURL}/group/${groupsData.data[i]._id}/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (deleteGroupResponse.status === 200) {
        alert('Group Deleted Successfully!');
        document.getElementById(`group-${groupsData.data[i]._id}`).remove();
      } else {
        alert(deleteGroupResponse.message);
      }
    });
    document.getElementById(`edit-group-${groupsData.data[i]._id}`).addEventListener('click', async event => {
      event.preventDefault();
      const groupInfoResponse = await fetch(`${baseURL}/group/${groupsData.data[i]._id}/info`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      const groupInfoData = await groupInfoResponse.json();
      document.getElementById('edit-group-name').value = groupInfoData.data.group.title;
      const response = await fetch(`${baseURL}/get_all_active_users?pagination=false`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const responseData = await response.json();
      for (let i = 0; i < responseData.data.length; i++) {
        if (responseData.data[i]._id !== userId) {
          document.getElementById('edit-group-members-list').insertAdjacentHTML(
            'beforeend',
            `<div class="profile-student full">
              <div class="s-name">
                ${responseData.data[i].name}
              </div>
              <div class="s-image">
                <img src="${responseData.data[i].image}" alt="">
              </div>
              <div class="s-check">
                <input value="${responseData.data[i]._id}" type="checkbox" class="chk" name="edit-group-members">
              </div>
            </div>`
          );
        }
      }

      Array.prototype.filter.call(document.querySelectorAll('[name="edit-group-members"]'), members => {
        for (let j = 0; j < groupsData.data[i].members.length; j++) {
          if (groupsData.data[i].members[j]._id === members.value) {
            selectedMembers.push(members.value);
            members.setAttribute('checked', true);
          }
        }
        if (selectedMembers.length < 1) {
          document.getElementById('edit-group-btn').setAttribute('disabled', 'true');
        }  else {
          document.getElementById('edit-group-btn').removeAttribute('disabled');
        }
        members.addEventListener('change', event => {
          if (event.target.checked) {
            document.getElementById('edit-group-btn').removeAttribute('disabled');
            selectedMembers.push(event.target.value);
          } else {
            selectedMembers = selectedMembers.filter(userIds => userIds !== event.target.value);
            if (selectedMembers.length < 1) {
              document.getElementById('edit-group-btn').setAttribute('disabled', 'true');
            }  else {
              document.getElementById('edit-group-btn').removeAttribute('disabled');
            }
          }
        });
      });

      document.getElementById('edit-group-btn').addEventListener('click', async () => {
        document.getElementById('edit-group-btn').setAttribute('disabled', 'true');
        const title = document.getElementById('edit-group-name').value;
        let image = document.getElementById('fileInput').files;
        if (image.length) {
          image = image[0];
          generateBase64FromFile(image).then(img => {
            const storageRef = firebase.storage().ref();
            const imageRef = storageRef.child(`${new Date().getTime().toString()}-${image.name}`);
            const uploadTask = imageRef.putString(img, 'data_url');
            uploadTask.on('state_changed', () => {
            }, error => {
              console.error(error);
              document.getElementById('edit-group-btn').removeAttribute('disabled');
            }, () => {
              uploadTask.snapshot.ref.getDownloadURL().then(async downloadURL => {
                try {
                  const data = new FormData();
                  data.append('title', title);
                  for (let i = 0; i < selectedMembers.length; i++) {
                    data.append('members[]', selectedMembers[i]);
                  }
                  data.append('image', downloadURL);
                  const editGroupResponse = await fetch(`${baseURL}/group/${groupsData.data[i]._id}/update`, {
                    method: 'PUT',
                    headers: {Authorization: `Bearer ${token}`},
                    body: data
                  });
                  const editGroupData = await editGroupResponse.json();
                  if (editGroupResponse.status !== 201) {
                    imageRef.delete().then(() => {
                      console.log('File Deleted Successfully');
                    }).catch(err => {
                      console.error(err);
                    });
                    alert(editGroupData.message);
                  } else {
                    alert('Group Updated Successfully!');
                    location.href = './list-group.html';
                  }
                } catch (err) {
                  console.error(err);
                  alert('Something went wrong!');
                }
              });
            });
          });
        } else {
          const data = new FormData();
          data.append('title', title);
          for (let i = 0; i < selectedMembers.length; i++) {
            data.append('members[]', selectedMembers[i]);
          }
          const editGroupResponse = await fetch(`${baseURL}/group/${groupsData.data[i]._id}/update`, {
            method: 'PUT',
            headers: {Authorization: `Bearer ${token}`},
            body: data
          });
          const editGroupData = await editGroupResponse.json();
          if (editGroupResponse.status !== 201) {
            alert(editGroupData.message);
          } else {
            alert('Group Updated Successfully!');
            location.href = './list-group.html';
          }
        }
      });
    });
    document.getElementById(groupsData.data[i]._id).addEventListener('click', async event => {
      const groupInfoResponse = await fetch(`${baseURL}/group/${event.target.id}/info`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      const groupInfoData = await groupInfoResponse.json();
      for (let i = 0; i < groupInfoData.data.group.members.length; i++) {
        if (!document.getElementById(`group-member-${groupInfoData.data.group.members[i]._id}`)) {
          document.getElementById('group-members').insertAdjacentHTML(
            'beforeend',
            `<div class="profile-tutor full" id="group-member-${groupInfoData.data.group.members[i]._id}">
              <div class="t-name">
                ${groupInfoData.data.group.members[i].name}
              </div>
              <div class="t-image">
                <img src="${groupInfoData.data.group.members[i].image}" alt="">
              </div>
            </div>`
          );
        }
      }
    });
  }
});
