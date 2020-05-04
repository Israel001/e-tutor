window.addEventListener('load', async () => {
  try {
    document.getElementById('past-meetings').insertAdjacentHTML(
      'beforeend',
      `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12" id="loader">
              <div id="past-meeting-loader" class="loader"></div>
            </div>`
    );
    document.getElementById('future-meetings').insertAdjacentHTML(
      'beforeend',
      `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12" id="loader">
              <div id="future-meeting-loader" class="loader"></div>
            </div>`
    );
    const pastMeetingsResponse = await fetch(`${baseURL}/user/${userId}/past_meetings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const pastMeetingsResponseDecoded = await pastMeetingsResponse.json();
    if (pastMeetingsResponseDecoded.meetings.length > 0) {
      document.getElementById('past-meeting-loader').remove();
      for (let i = 0; i < pastMeetingsResponseDecoded.meetings.length; i++) {
        const meetingInfo = pastMeetingsResponseDecoded.meetings[i];
        document.getElementById('past-meetings').insertAdjacentHTML(
          'beforeend',
          `<div class="meeting-info full">
                  <p>Title: ${meetingInfo.title}</p>
                  <p>Date: ${moment(meetingInfo.date).format('MMMM Do YYYY, h:mm:ss a')}</p>
                  <p>Organizer: <a href="profile.html?id=${meetingInfo.organizer._id}">${meetingInfo.organizer.name}</a></p>
                  <p>Description: ${meetingInfo.description}</p>
                  <p>Members: ${meetingInfo.members.map(el => ` <a href="profile.html?id=${el._id}">${el.name}</a>`)}</p>
              </div>`
        );
      }
    } else {
      document.getElementById('past-meeting-loader').remove();
      document.getElementById('past-meetings').insertAdjacentHTML(
        'beforeend',
        `You have no past meetings`
      );
    }

    const futureMeetingsResponse = await fetch(`${baseURL}/user/${userId}/future_meetings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const futureMeetingsResponseDecoded = await futureMeetingsResponse.json();
    if (futureMeetingsResponseDecoded.meetings.length > 0) {
      document.getElementById('future-meeting-loader').remove();
      for (let i = 0; i < futureMeetingsResponseDecoded.meetings.length; i++) {
        const meetingInfo = futureMeetingsResponseDecoded.meetings[i];
        document.getElementById('future-meetings').insertAdjacentHTML(
          'beforeend',
          `<div class="meeting-info full">
                  <p>Title: ${meetingInfo.title}</p>
                  <p>Date: ${moment(meetingInfo.date).format('MMMM Do YYYY, h:mm:ss a')}</p>
                  <p>Organizer: <a href="profile.html?id=${meetingInfo.organizer._id}">${meetingInfo.organizer.name}</a></p>
                  <p>Description: ${meetingInfo.description}</p>
                  <p>Members: ${meetingInfo.members.map(el => ` <a href="profile.html?id=${el._id}">${el.name}</a>`)}</p>
              </div>`
        );
      }
    } else {
      document.getElementById('future-meeting-loader').remove();
      document.getElementById('future-meetings').insertAdjacentHTML(
        'beforeend',
        `You have no future meetings`
      );
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong');
  }
});
