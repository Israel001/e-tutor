window.addEventListener('load', async () => {
  try {
    let issuesResponse;
    let page = window.location.href.split('=')[1];
    if (page) {
      page = parseInt(page);
      issuesResponse = await fetch(`${baseURL}/user/${userId}/issues?page=${page}&perPage=3`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      issuesResponse = await fetch(`${baseURL}/user/${userId}/issues?perPage=3`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
    }
    const issuesResponseDecoded = await issuesResponse.json();
    if (issuesResponseDecoded.issues.length > 0) {
      for (let i = 0; i < issuesResponseDecoded.issues.length; i++) {
        document.getElementById('issues').insertAdjacentHTML(
          'beforeend',
          `<div class="issue-info full" id="${issuesResponseDecoded.issues[i]._id}" style="cursor: pointer;">
                  <p>Title: ${issuesResponseDecoded.issues[i].title}</p>
                  <p>Description: ${issuesResponseDecoded.issues[i].description.length > 100 ? issuesResponseDecoded.issues[i].description.substring(0, 100)+'...' : issuesResponseDecoded.issues[i].description}</p>
                  <p>Files Attached: ${issuesResponseDecoded.issues[i].files.length > 0 ? issuesResponseDecoded.issues[i].files.map((el, index) => ` <a href="${el}" target="_blank">File ${index+1}</a>`) : 'No Files Attached'}</p>
                  <p>Participants:  ${issuesResponseDecoded.issues[i].assignTo.map(el => ` <a href="profile.html?id=${el._id}">${el.name}</a>`)}</p>
                  <a class="direct-issue" href="issue-detail.html?id=${issuesResponseDecoded.issues[i]._id}"><i class="fa fa-angle-right"></i></a>
                  <a href="edit-issue-page.html?id=${issuesResponseDecoded.issues[i]._id}" class="edit-issue"><i class="fa fa-edit"></i>Edit</a>
                  ${issuesResponseDecoded.issues[i].creator._id === userId ? `<a href="" id="delete-${issuesResponseDecoded.issues[i]._id}" class="remove-issue"><i class="fa fa-trash"></i>Delete</a>` : ''}
              </div>`
        );
        document.getElementById(`${issuesResponseDecoded.issues[i]._id}`).addEventListener('click', event => {
          if (!event.target.href) location.href = `issue-detail.html?id=${issuesResponseDecoded.issues[i]._id}`;
        });
        if (document.getElementById(`delete-${issuesResponseDecoded.issues[i]._id}`)) {
          document.getElementById(`delete-${issuesResponseDecoded.issues[i]._id}`).addEventListener('click', async event => {
            event.preventDefault();
            const id = issuesResponseDecoded.issues[i]._id;
            const deleteIssueResponse = await fetch(`${baseURL}/issue/${id}/delete`, {
              method: 'DELETE',
              headers: {Authorization: `Bearer ${token}`}
            });
            if (deleteIssueResponse.status === 200) {
              document.getElementById(id).remove();
              alert('Issue Deleted Successfully!');
            } else {
              alert(deleteIssueResponse.message);
            }
          });
        }
      }
      document.querySelector('#list-issue').insertAdjacentHTML(
        'beforeend',
        `<div class="full"><ul class="pagination" id="pagination"></ul></div>`
      );
      let pages = Math.floor(issuesResponseDecoded.totalItems / 3);
      if ((issuesResponseDecoded.totalItems % 3) > 0) pages += 1;
      if (pages > 1) {
        document.querySelector('#pagination').insertAdjacentHTML(
          'beforeend',
          `<li class="page-item"><a class="page-link" href="?page=1">First</a></li>`
        );
      }
      for (let i = 0; i < pages; i++) {
        document.querySelector('#pagination').insertAdjacentHTML(
          'beforeend',
          `<li class="${page ? page && page === i + 1 ? 'active' : '' : i + 1 === 1 ? 'active' : ''} page-item"><a class="page-link" href="?page=${i+1}">${i+1}</a>`
        );
      }
      if (pages > 1) {
        document.querySelector('#pagination').insertAdjacentHTML(
          'beforeend',
          `<li class="page-item"><a class="page-link" href="?page=${pages}">Last</a></li>`
        );
      }
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong');
  }
});
