window.addEventListener('load', async () => {
  try {
    const response = await fetch(`${baseURL}/posts`, {
      method: 'GET',
      headers: {Authorization: `Bearer ${token}`}
    });
    const responseData = await response.json();
    for (let i = 0; i < responseData.data.length; i++) {
      document.getElementById('blog-list').insertAdjacentHTML(
        'beforeend',
        `<div class="issue-info full">
                        <p><h2>${responseData.data[i].title} <small>${responseData.data[i].category}</small></h2></p>
                        <p class="lead">by <a href="profile.html?id=${responseData.data[i].author._id}">${responseData.data[i].author.name}</a></p>
                        <p><i class="fa fa-clock-o"></i> Posted on ${moment(responseData.data[i].createdAt).format('MMMM Do YYYY')} at ${moment(responseData.data[i].createdAt).format('h:mm:ss a')}</p>
                        <div class="cover-blog">
                            <img src="${responseData.data[i].photo}" alt="">
                        </div>
                        <div id="post-content-${responseData.data[i]._id}" style="margin-bottom: 15px; margin-left: 15px;"></div>
                        <a href="blog-detail.html?id=${responseData.data[i]._id}" class="read-more">Read More <i class="fa fa-angle-right"></i></a>
                    </div>`
      );
      document.getElementById(`post-content-${responseData.data[i]._id}`).innerHTML = responseData.data[i].body.length > 300 ? responseData.data[i].body.substring(0,300)+'...' : responseData.data[i].body;
    }

    document.getElementById('search-button').addEventListener('click', async event => {
      event.preventDefault();
      let searchQuery = document.getElementById('search-input').value;
      const searchResponse = await fetch(`${baseURL}/search/posts?searchQuery=${searchQuery}`, {
        method: 'GET',
        headers: {Authorization: `Bearer ${token}`}
      });
      const searchData = await searchResponse.json();
      if (searchResponse.status === 200) {
        document.getElementById('blog-list').innerHTML = '';
        if (searchData.data.length > 0) {
          for (let i = 0; i < searchData.data.length; i++) {
            document.getElementById('blog-list').insertAdjacentHTML(
              'beforeend',
              `<div class="issue-info full">
                        <p><h2>${searchData.data[i].title} <small>${searchData.data[i].category}</small></h2></p>
                        <p class="lead">by <a href="profile.html?id=${searchData.data[i].author._id}">${searchData.data[i].author.name}</a></p>
                        <p><i class="fa fa-clock-o"></i> Posted on ${moment(searchData.data[i].createdAt).format('MMMM Do YYYY')} at ${moment(searchData.data[i].createdAt).format('h:mm:ss a')}</p>
                        <div class="cover-blog">
                            <img src="${searchData.data[i].photo}" alt="">
                        </div>
                        <div id="post-content-${searchData.data[i]._id}" style="margin-bottom: 15px; margin-left: 15px;"></div>
                        <a href="blog-detail.html?id=${searchData.data[i]._id}" class="read-more">Read More <i class="fa fa-angle-right"></i></a>
                    </div>`
            );
          }
        } else {
          document.getElementById('blog-list').insertAdjacentHTML(
            'beforeend',
            `<div><h2>NO POSTS FOUND</h2></div>`
          );
        }
      }
    });
  } catch (err) {
    console.error(err);
    alert('Something went wrong!');
  }
});
