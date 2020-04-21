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
              <div class="group-card">
                <div class="image-group">
                    <img src="${groupsData.data[i].image}" alt="">
                </div>
                <div class="infor-group">
                  <p class="name">${groupsData.data[i].title}</p>
                  <p class="number"><span>${groupsData.data[i].members.length} </span> members</p> 
                </div>
                <div class="see-more">
                  <a id="${groupsData.data[i]._id}" style="cursor: pointer; text-decoration: none;" data-toggle="modal" data-target="#myModal6">View Members</a>
                </div>
              </div>
          </div>
        </div>`
    );
    document.getElementById(groupsData.data[i]._id).addEventListener('click', async event => {
      const groupInfoResponse = await fetch(`${baseURL}/group/${event.target.id}/info`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      const groupInfoData = await groupInfoResponse.json();
      for (let i = 0; i < groupInfoData.data.group.members.length; i++) {
        document.getElementById('group-members').insertAdjacentHTML(
          'beforeend',
          `<div class="profile-tutor full">
            <div class="t-name">
              ${groupInfoData.data.group.members[i].name}
            </div>
            <div class="t-image">
              <img src="${groupInfoData.data.group.members[i].image}" alt="">
            </div>
          </div>`
        );
      }
    });
  }
});
