checkAuth();

window.addEventListener('load', async () => {
  try {
    document.querySelector('#tutors-list').insertAdjacentHTML(
      'beforeend',
      `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12" id="loader">
              <div id="loader" class="loader"></div>
            </div>`
    );
    let response;
    let page = window.location.href.split('=')[1];
    if (page) {
      page = parseInt(page);
      response = await fetch(`${baseURL}/get_active_tutors?page=${page}&perPage=6`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      response = await fetch(`${baseURL}/get_active_tutors?perPage=6`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
      });
    }
    const data = await response.json();
    if (data.data.activeTutors.length > 0) {
      document.querySelector('#loader').remove();
      for (let i = 0; i < data.data.activeTutors.length; i++) {
        document.querySelector('#tutors-list').insertAdjacentHTML(
          'beforeend',
          `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                <div class="tutor-content">
                  <img src=${data.data.activeTutors[i].image} alt="">
                  <span>${data.data.activeTutors[i].name}</span>
                </div>
              </div>`
        );
      }
      document.querySelector('#tutors-list').insertAdjacentHTML(
        'beforeend',
        `<div class="full"><ul class="pagination" id="pagination"></ul></div>`
      );
      let pages = Math.floor(data.data.totalItems / 6);
      if ((data.data.totalItems % 6) > 0) pages += 1;
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
    } else {
      document.querySelector('#loader').remove();
      document.querySelector('#tutors-list').insertAdjacentHTML(
        'beforeend',
        `<div class="col-lg-8">
              <div class="alert alert-info text-center">
                <strong>There are currently no active tutors in the system</strong>
              </div>
            </div>`
      );
    }
  } catch (err) {
    console.error(err);
  }

  await chat();
});
