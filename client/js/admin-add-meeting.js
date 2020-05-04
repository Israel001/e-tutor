window.addEventListener('load', async () => {
  try {
    const response = await fetch(`${baseURL}/get_all_active_users?pagination=false`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const responseData = await response.json();
    for (let i = 0; i < responseData.data.length; i++) {
      if (responseData.data[i]._id !== userId) {
        document.getElementById('meeting-members-modal-body').insertAdjacentHTML(
          'beforeend',
          `<div class="profile-student full">
              <div class="s-name">
                ${responseData.data[i].name}
              </div>
              <div class="s-image">
                <img src="${responseData.data[i].image}" alt="">
              </div>
              <div class="s-check">
                <input value="${responseData.data[i]._id}" type="checkbox" class="chk" name="meeting-members">
              </div>
            </div>`
        );
      }
    }

    let selectedMembers = [];

    Array.prototype.filter.call(document.querySelectorAll('[name="meeting-members"]'), members => {
      members.addEventListener('change', event => {
        if (event.target.checked) {
          selectedMembers.push(event.target.value);
        } else {
          selectedMembers = selectedMembers.filter(userIds => userIds !== event.target.value);
        }
      });
    });

    document.getElementById('add-meeting-btn').addEventListener('click', async event => {
      event.preventDefault();
      if (selectedMembers.length < 1) {
        alert('You have to select a participant');
      } else {
        document.getElementById('add-meeting-btn').remove();
        document.getElementById('meeting-form').insertAdjacentHTML(
          'beforeend',
          `<div id="loader" class="loader" style="margin-top: 10rem;">`
        );
        const title = document.getElementById('meeting-title').value;
        const desc = document.getElementById('meeting-desc').value;
        const date = document.getElementById('meeting-date').value;
        const data = new FormData();
        data.append('title', title);
        data.append('description', desc);
        for (let i = 0; i < selectedMembers.length; i++) {
          data.append('members[]', selectedMembers[i]);
        }
        data.append('date', date);
        data.append('url', baseClientURL);
        const createMeetingResponse = await fetch(`${baseURL}/create_meeting`, {
          method: 'POST',
          headers: {Authorization: `Bearer ${token}`},
          body: data
        });
        const createMeetingResponseData = await createMeetingResponse.json();
        if (createMeetingResponse.status !== 201) {
          setErrorMessage({
            btnArea: 'meeting-form',
            btnName: 'Add New Meeting',
            msgArea: 'form-msg',
            msg: createMeetingResponseData.message,
            btnId: 'add-meeting-btn'
          });
        } else {
          document.getElementById('form-msg').innerHTML = '';
          document.getElementById('form-msg').insertAdjacentHTML(
            'afterbegin',
            `<div class="alert alert-success">
                        <a href="javascript:void(0);" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                        <strong>Success:</strong> Meeting Created Successfully. <a href="admin-all-meeting.html" style="color: #337ab7;">View Meetings?</a>
                      </div>`
          );
          document.getElementById('loader').remove();
          document.getElementById('meeting-form').insertAdjacentHTML(
            'beforeend',
            `<button id="add-user-btn" type="submit">Add New Meeting</button>`
          );
          document.getElementById('meeting-title').value = '';
          document.getElementById('meeting-desc').value = '';
        }
      }
    });
  } catch (err) {
    console.error(err);
    alert('Something went wrong');
  }
});
