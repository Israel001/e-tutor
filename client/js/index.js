if (loggedIn) {
  let element = document.getElementById('auth-btn');
  element.setAttribute('href','javascript:void(0);');
  document.getElementById('auth-btn').innerText = 'Log Out';
  element.addEventListener('click', logout);
} else {
  document.querySelector('.header-down').innerHTML = '';
  document.querySelector('#chat-circle').remove();
  document.querySelector('.chat-box').remove();
  document.getElementById('auth-btn').innerText = 'Log In';
}

window.addEventListener('load', async () => {
  try {
    const response = await fetch(`${baseURL}/get_tutors`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    if (data.data.tutors.length > 0) {
      for (let i = 0; i < data.data.tutors.length; i++) {
        document.querySelector('#tutors-list').insertAdjacentHTML(
          'beforeend',
          `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                  <div class="tutor-content">
                    <img src="images/tutor.jpg" alt="">
                    <span>${data.data.tutors[0].name}</span>
                  </div>
                </div>`
        );
      }
    } else {
      document.querySelector('#tutors-list').insertAdjacentHTML(
        'beforeend',
        `<div class="col-lg-8">
                <div class="alert alert-info text-center">
                  <strong>There are currently no tutors in the system</strong>
                </div>
              </div>`
      );
    }
  } catch (err) {
    console.error(err);
  }

  if (loggedIn) {
    try {
      const groupResponse = await fetch(`${baseURL}/groups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const groupData = await groupResponse.json();
      if (groupData.data.groups.length > 0) {
        for (let i = 0; i < groupData.data.groups.length; i++) {
          document.querySelector('#friends').insertAdjacentHTML(
            'afterbegin',
            `<div class="friend">
                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" />
                <p>
                    <strong>${groupData.data.groups[i].title}</strong><br>
                    <span>${groupData.data.groups[i].members.length} members</span>
                </p>
                <div class="status available"></div>
            </div>`
          );
        }
      }
      const response = await fetch(`${baseURL}/get/${userId}/tutors_students`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.status !== 200) {
        window.alert(data.message);
      } else {
        console.log(data);
      }
    } catch (err) {
      console.error(err);
    }
  }
});