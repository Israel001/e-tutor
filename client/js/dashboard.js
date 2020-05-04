checkAuth();

const addActivity = (date, activity, time) => {
  if (document.getElementById('activities')) {
    document.getElementById('activities').insertAdjacentHTML(
      'beforeend',
      `<div class="activities full">
            <span class="date">${date}</span>- ${activity} - <span>${time}</span>
          </div>`
    );
  }
};

window.addEventListener('load', async () => {
  try {
    if (userRole === 'tutor') {
      if (document.getElementById('student-card')) {
        document.getElementById('student-card').style.display = 'block';
      }
      const studentsNumResponse = await fetch(`${baseURL}/user/${userId}/students`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const studentsNumResponseDecoded = await studentsNumResponse.json();
      if (document.getElementById('studentNum')) {
        document.getElementById('studentNum').innerText = studentsNumResponseDecoded.userStudents.length;
      }
    }

    if (userRole === 'student') {
      if (document.getElementById('tutor-card')) {
        document.getElementById('tutor-card').style.display = 'block';
      }
      const studentTutorResponse = await fetch(`${baseURL}/user/${userId}/tutor`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const studentTutorResponseDecoded = await studentTutorResponse.json();
      if (document.getElementById('tutor-card') && studentTutorResponseDecoded.userTutor !== null) {
        document.getElementById('tutor-card').insertAdjacentHTML(
          'beforeend',
          `<div class="tutor-card full">
                <img src="${studentTutorResponseDecoded.userTutor.image}" alt="">
                <p class="tutor-name">${studentTutorResponseDecoded.userTutor.name}</p>
                  <a class="view-tprofile" href="profile.html?id=${studentTutorResponseDecoded.userTutor._id}">View profile</a>
            </div>`
        );
      }
    }

    const meetingsNumResponse = await fetch(`${baseURL}/user/${userId}/meetings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const meetingsNumResponseDecoded = await meetingsNumResponse.json();
    if (document.getElementById('meetingNum')) {
      document.getElementById('meetingNum').innerText = meetingsNumResponseDecoded.meetings.length;
    }

    const issuesNumResponse = await fetch(`${baseURL}/user/${userId}/issues?pagination=false`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const issuesNumResponseDecoded = await issuesNumResponse.json();
    if (document.getElementById('issueNum')) {
      document.getElementById('issueNum').innerText = issuesNumResponseDecoded.issues.length;
    }

    const activitiesResponse = await fetch(`${baseURL}/user/${userId}/activities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const activitiesResponseDecoded = await activitiesResponse.json();
    if (activitiesResponseDecoded.activities.length > 0) {
      for (let i = 0; i < activitiesResponseDecoded.activities.length; i++) {
        if (i < 5) {
          const activity = activitiesResponseDecoded.activities[i];
          switch (activity.activity) {
            case 'createMeeting':
              addActivity(moment(activity.createdAt).format('MMMM Do YYYY'), `You created a meeting: ${activity.meeting.title}`, moment(activity.createdAt).format('h:mm:ss a'));
              break;
            case 'acceptMeeting':
              addActivity(moment(activity.createdAt).format('MMMM Do YYYY'), `You accepted a meeting: ${activity.meeting.title}`, moment(activity.createdAt).format('h:mm:ss a'));
              break;
            case 'rejectMeeting':
              addActivity(moment(activity.createdAt).format('MMMM Do YYYY'), `You rejected a meeting: ${activity.meeting.title}`, moment(activity.createdAt).format('h:mm:ss a'));
              break;
            case 'postponeMeeting':
              addActivity(moment(activity.createdAt).format('MMMM Do YYYY'), `You postponed a meeting: ${activity.meeting.title}`, moment(activity.createdAt).format('h:mm:ss a'));
              break;
            case 'cancelMeeting':
              addActivity(moment(activity.createdAt).format('MMMM Do YYYY'), `You canceled a meeting: ${activity.meeting.title}`, moment(activity.createdAt).format('h:mm:ss a'));
              break;
            case 'createIssue':
              addActivity(moment(activity.createdAt).format('MMMM Do YYYY'), `You created an issue: ${activity.issue === null ? '' : `<a href="issue-detail.html?id=${activity.issue._id}">${activity.issue.title}</a>`}`, moment(activity.createdAt).format('h:mm:ss a'));
              break;
            case 'editIssue':
              addActivity(moment(activity.createdAt).format('MMMM Do YYYY'), `You edited an issue: ${activity.issue === null ? '' : `<a href="issue-detail.html?id=${activity.issue._id}">${activity.issue.title}</a>`}`, moment(activity.createdAt).format('h:mm:ss a'));
              break;
            case 'deleteIssue':
              addActivity(moment(activity.createdAt).format('MMMM Do YYYY'), `You deleted an issue`, moment(activity.createdAt).format('h:mm:ss a'));
              break;
            case 'commentIssue':
              addActivity(moment(activity.createdAt).format('MMMM Do YYYY'), `You commented on an issue: ${activity.issue === null ? '' : `<a href="issue-detail.html?id=${activity.issue._id}">${activity.issue.title}</a>`}`, moment(activity.createdAt).format('h:mm:ss a'));
              break;
            case 'editIssueComment':
              addActivity(moment(activity.createdAt).format('MMMM Do YYYY'), `You edited your comment on an issue: ${activity.issue === null ? '' : `<a href="issue-detail.html?id=${activity.issue._id}">${activity.issue.title}</a>`}`, moment(activity.createdAt).format('h:mm:ss a'));
              break;
            case 'deleteIssueComment':
              addActivity(moment(activity.createdAt).format('MMMM Do YYYY'), `You deleted your comment on an issue: ${activity.issue === null ? '' : `<a href="issue-detail.html?id=${activity.issue._id}">${activity.issue.title}</a>`}`, moment(activity.createdAt).format('h:mm:ss a'));
              break;
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong!');
  }

  await chat();
});
