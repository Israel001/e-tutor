window.addEventListener('load', async () => {
  try {
    document.getElementById('add-user-btn').addEventListener('click', event => {
      event.preventDefault();
      document.getElementById('add-user-btn').remove();
      document.getElementById('add-user-form').insertAdjacentHTML(
        'beforeend',
        `<div id="loader" class="loader" style="margin-top: 3rem;">`
      );
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const role = document.getElementById('role').value;
      const image = document.getElementById('file').files[0];
      generateBase64FromImage(image).then(img => {
        const storageRef = firebase.storage().ref();
        const imageRef = storageRef.child(`${new Date().getTime().toString()}-${image.name}`);
        const uploadTask = imageRef.putString(img, 'data_url');
        uploadTask.on('state_changed', () => {
        }, error => {
          console.error(error);
          document.getElementById('loader').remove();
          setErrorMessage({
            btnArea: 'add-user-form',
            btnName: 'Add New User',
            msgArea: 'form-msg',
            msg: 'Image Uploading Failed!',
            btnId: 'add-user-btn'
          });
        }, () => {
          uploadTask.snapshot.ref.getDownloadURL().then(async downloadURL => {
            try {
              const data = new FormData();
              data.append('name', name);
              data.append('email', email);
              data.append('role', role);
              data.append('password', 'password');
              data.append('image', downloadURL);
              const createUserResponse = await fetch(`${baseURL}/create_user`, {
                method: 'POST',
                headers: {Authorization: `Bearer ${token}`},
                body: data
              });
              const createUserData = await createUserResponse.json();
              if (createUserResponse.status !== 201) {
                imageRef.delete().then(() => {
                  console.log('File Deleted Successfully');
                }).catch(err => {
                  console.error(err);
                });
                setErrorMessage({
                  btnArea: 'add-user-form',
                  btnName: 'Add New User',
                  msgArea: 'form-msg',
                  msg: createUserData.message,
                  btnId: 'add-user-btn'
                });
              } else {
                document.getElementById('form-msg').innerHTML = '';
                document.getElementById('form-msg').insertAdjacentHTML(
                  'afterbegin',
                  `<div class="alert alert-success">
                        <a href="javascript:void(0);" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                        <strong>Success:</strong> User Created Successfully. <a href="#users" style="color: #337ab7;">View Users?</a>
                      </div>`
                );
                document.getElementById('loader').remove();
                document.getElementById('add-user-form').insertAdjacentHTML(
                  'beforeend',
                  `<button id="add-user-btn" type="submit">Add New User</button>`
                );
                document.getElementById('name').value = '';
                document.getElementById('email').value = '';
                document.getElementById('role').value = '';
                document.getElementById('file').value = '';
              }
            } catch (err) {
              console.error(err);
              setErrorMessage({
                btnArea: 'add-user-form',
                btnName: 'Add New User',
                msgArea: 'form-msg',
                msg: 'Something went wrong',
                btnId: 'add-user-btn'
              });
            }
          });
        });
      });
    });
  } catch (err) {
    console.error(err);
  }
});
