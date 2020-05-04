window.addEventListener('load', async () => {
  try {
    let profileId;
    if (window.location.href.includes('id')) {
      profileId = window.location.href.split('?')[1].split('=')[1];
    } else {
      profileId = userId;
    }

    const profileInfoResponse = await fetch(`${baseURL}/get_user_info?userId=${profileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const profileInfoResponseDecoded = await profileInfoResponse.json();
    if (profileId === userId) {
      document.getElementById('profile-title').innerText = 'Your Profile';
    } else {
      document.getElementById('profile-title').innerText = `${profileInfoResponseDecoded.data.user.name.split(' ')[0]}'s Profile`;
    }
    document.getElementById('profile-card').insertAdjacentHTML(
      'beforeend',
      `<div class="left-card">
              <div class="image-student">
                <img src="${profileInfoResponseDecoded.data.user.image}" alt="">
              </div>
              <div class="info-student">
                <p class="student-name">${profileInfoResponseDecoded.data.user.name}</p>
                <p class="email">${profileInfoResponseDecoded.data.user.email}</p>
                ${profileId !== userId ? `<a class="chatting" href="javascript:void(0);" id="open-chat"><i class="fa fa-comment"></i>Chat</a>` : '' }
              </div>
          </div>`
    );
    document.getElementById('profile-details-card').insertAdjacentHTML(
      'beforeend',
      `<div class="about-student">
              <h1>About me</h1>
              <div class="desc-student">
                <p>${profileInfoResponseDecoded.data.user.description ? profileInfoResponseDecoded.data.user.description : 'Apparently, this user prefers to keep an air of mystery about them.'}</p>
                <p><span style="font-weight: bold; font-size: 20px;">Role</span>: ${profileInfoResponseDecoded.data.user.role.substring(0,1).toUpperCase() + profileInfoResponseDecoded.data.user.role.substring(1, profileInfoResponseDecoded.data.user.role.length)}</p>
              </div>
            </div>`
    );
    if (document.getElementById('open-chat')) {
      document.getElementById('open-chat').addEventListener('click', () => {
        $("#chat-circle").toggle('scale');
        $(".chat-box").toggle('scale');
        document.querySelector('#private').insertAdjacentHTML(
          'beforeend',
          `<div class="friend" id="${profileInfoResponseDecoded.data.user._id}">
                    <img src="${profileInfoResponseDecoded.data.user.image}" />
                      <p>
                          <strong>${profileInfoResponseDecoded.data.user.name}</strong><br>
                          <span>${profileInfoResponseDecoded.data.user.email}</span>
                      </p>
                      <div id="status-${profileInfoResponseDecoded.data.user._id}"></div>
                    </div>`
        );
        handleConversationClicked(document.getElementById(`${profileInfoResponseDecoded.data.user._id}`), $(`#${profileInfoResponseDecoded.data.user._id}`));
      });
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong');
  }
});
