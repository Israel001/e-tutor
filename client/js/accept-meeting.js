if (!loggedIn) window.location = '/index.html';

if (!window.location.href.includes('token')) window.location = '/index.html';

const meetingToken = window.location.href.split('?')[1].split('=')[1];

if (meetingToken.length < 32) window.location = '/index.html';

window.addEventListener('load', async () => {
  document.getElementById('body').insertAdjacentHTML(
    'afterbegin',
    `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12" id="loader" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <div class="loader" style="width: 50px; height: 50px;"></div>
    </div>`
  );
  const getMeetingResponse = await fetch(`${baseURL}/get_meeting?token=${meetingToken}`);
  if (getMeetingResponse.status !== 200) {
    window.location = '/index.html'
  } else {
    document.getElementById('loader').remove();
    $('#myModal').modal();
    const decodedGetMeetingResponse = await getMeetingResponse.json();
    document.getElementById('modal-body').insertAdjacentHTML(
      'beforeend',
      `<p>Title: ${decodedGetMeetingResponse.data.meeting.title}</p>
      <p>Description: ${decodedGetMeetingResponse.data.meeting.description}</p>
      <p>Date: ${moment(decodedGetMeetingResponse.data.meeting.date).format('MMMM Do YYYY, h:mm:ss a')}</p>
      <p>Organizer: ${decodedGetMeetingResponse.data.meeting.organizer.name}</p>
      <p>Members: ${decodedGetMeetingResponse.data.meeting.members.map(member => ` ${member.name}`)}</p>`
    );
    document.getElementById('accept-btn').addEventListener('click', async () => {
      document.getElementById('accept-btn').remove();
      document.getElementById('modal-footer').insertAdjacentHTML(
        'afterbegin',
        `<div id="loader" class="loader"></div>`
      );
      const response = await fetch(`${baseURL}/accept_meeting/${meetingToken}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      const decodedResponse = await response.json();
      if (response.status !== 200) {
        document.getElementById('loader').remove();
        if (decodedResponse.message) {
          alert(decodedResponse.message);
        } else {
          alert('Something went wrong! Try again later');
        }
        window.location = '/index.html';
      } else {
        document.getElementById('loader').remove();
        alert(decodedResponse.message);
        window.location = '/index.html';
      }
    });
    document.getElementById('reject-btn').addEventListener('click', async () => {
      document.getElementById('reject-btn').remove();
      document.getElementById('modal-footer').insertAdjacentHTML(
        'beforeend',
        `<div id="loader" class="loader"></div>`
      );
      const response = await fetch(`${baseURL}/reject_meeting/${meetingToken}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      const decodedResponse = await response.json();
      if (response.status !== 200) {
        document.getElementById('loader').remove();
        if (decodedResponse.message) {
          alert(decodedResponse.message);
        } else {
          alert('Something went wrong! Try again later');
        }
        window.location = '/index.html';
      } else {
        document.getElementById('loader').remove();
        alert(decodedResponse.message);
        window.location = '/index.html';
      }
    });
  }
});
