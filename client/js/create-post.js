window.addEventListener('load', async () => {
  try {
    document.getElementById('create-post-btn').addEventListener('click', async event => {
      event.preventDefault();
      document.getElementById('create-post-btn').remove();
      document.getElementById('create-post-btn-area').insertAdjacentHTML(
        'beforeend',
        `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12" id="loader">
              <div class="loader"></div>
            </div>`
      );
      const title = document.getElementById('post-title').value;
      const category = document.getElementById('post-cat').value;
      var nicE = new nicEditors.findEditor('area1');
      const body = nicE.getContent();
      const coverPhoto = document.getElementById('inputFile').files[0];
      generateBase64FromFile(coverPhoto).then(img => {
        const storageRef = firebase.storage().ref();
        const imageRef = storageRef.child(`${new Date().getTime().toString()}-${coverPhoto.name}`);
        const uploadTask = imageRef.putString(img, 'data_url');
        uploadTask.on('state_changed', () => {
        }, error => {
          console.error(error);
          document.getElementById('loader').remove();
          document.getElementById('create-post-btn-area').insertAdjacentHTML(
            'beforeend',
            `<button id="create-post-btn" class="btn-create-issue">Create New Post</button>`
          );
          alert('Image Uploading Failed!');
        }, () => {
          uploadTask.snapshot.ref.getDownloadURL().then(async downloadURL => {
            const data = new FormData();
            data.append('title', title);
            data.append('category', category);
            data.append('body', body);
            data.append('photo', downloadURL);
            const createPostResponse = await fetch(`${baseURL}/post/create`, {
              method: 'POST',
              headers: {Authorization: `Bearer ${token}`},
              body: data
            });
            const createPostData = await createPostResponse.json();
            if (createPostResponse.status !== 201) {
              imageRef.delete().then(() => {
                console.log('File Deleted Successfully');
              }).catch(err => {
                console.error(err);
              });
              alert(createPostData.message);
              document.getElementById('loader').remove();
              document.getElementById('create-post-btn-area').insertAdjacentHTML(
                'beforeend',
                `<button id="create-post-btn" class="btn-create-issue">Create New Post</button>`
              );
            } else {
              alert('Post Created Successfully!');
              location.href = './blog-page.html'
            }
          });
        });
      });
    });
  } catch (err) {
    console.error(err);
    alert('Something went wrong!');
  }
});
