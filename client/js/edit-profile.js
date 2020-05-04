window.addEventListener('load', async () => {
  try {
    const profileId = window.location.href.split('=')[1];
    const userInfoResponse = await fetch(`${baseURL}/get_user_info?userId=${profileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const userInfoData = await userInfoResponse.json();
    document.getElementById('profile-name').value = userInfoData.data.user.name;
    document.getElementById('email_address').value = userInfoData.data.user.email;
    document.getElementById('role').value = userInfoData.data.user.role;
    document.getElementById('profile-desc').value = userInfoData.data.user.description || '';

    document.getElementById('profile-edit-btn').addEventListener('click', async event => {
      event.preventDefault();
      document.getElementById('profile-edit-btn').remove();
      document.getElementById('edit-profile-form').insertAdjacentHTML(
        'beforeend',
        `<div id="loader" class="loader" style="margin-top: 3rem;">`
      );
      const name = document.getElementById('profile-name').value;
      const email = document.getElementById('email_address').value;
      const role = document.getElementById('role').value;
      const desc = document.getElementById('profile-desc').value;
      let file = document.getElementById('profile-file').files;
      if (file.length > 0) {
        file = file[0];
        generateBase64FromFile(file).then(img => {
          const storageRef = firebase.storage().ref();
          const imageRef = storageRef.child(`${new Date().getTime().toString()}-${file.name}`);
          const uploadTask = imageRef.putString(img, 'data_url');
          uploadTask.on('state_changed', () => {
          }, error => {
            console.error(error);
            document.getElementById('loader').remove();
            setErrorMessage({
              btnArea: 'edit-profile-form',
              btnName: 'Update',
              msgArea: 'form-msg',
              msg: 'Image Uploading Failed!',
              btnId: 'profile-edit-btn'
            });
          }, () => {
            uploadTask.snapshot.ref.getDownloadURL().then(async downloadURL => {
              const data = new FormData();
              data.append('name', name);
              data.append('email', email);
              data.append('desc', desc);
              data.append('role', role);
              data.append('image', downloadURL);
              const editProfileResponse = await fetch(`${baseURL}/update/user/${profileId}`, {
                method: 'PUT',
                headers: {Authorization: `Bearer ${token}`},
                body: data
              });
              const editProfileData = await editProfileResponse.json();
              if (editProfileResponse.status !== 201) {
                imageRef.delete().then(() => {
                  console.log('File Deleted Successfully');
                }).catch(err => {
                  console.error(err);
                });
                setErrorMessage({
                  btnArea: 'edit-profile-form',
                  btnName: 'Update',
                  msgArea: 'form-msg',
                  msg: editProfileResponse.message,
                  btnId: 'profile-edit-btn'
                });
              } else {
                alert('Profile Updated Successfully!');
                localStorage.setItem('userPhoto', editProfileData.data.image);
                localStorage.setItem('userRole', editProfileData.data.role);
                localStorage.setItem('userName', editProfileData.data.name);
                window.history.back();
              }
            })
          })
        });
      } else {
        const data = new FormData();
        data.append('name', name);
        data.append('email', email);
        data.append('desc', desc);
        data.append('role', role);
        const editProfileResponse = await fetch(`${baseURL}/update/user/${profileId}`, {
          method: 'PUT',
          headers: {Authorization: `Bearer ${token}`},
          body: data
        });
        const editProfileData = await editProfileResponse.json();
        if (editProfileResponse.status !== 201) {
          setErrorMessage({
            btnArea: 'edit-profile-form',
            btnName: 'Update',
            msgArea: 'form-msg',
            msg: editProfileResponse.message,
            btnId: 'profile-edit-btn'
          });
        } else {
          alert('Profile Updated Successfully!');
          localStorage.setItem('userPhoto', editProfileData.data.image);
          localStorage.setItem('userRole', editProfileData.data.role);
          localStorage.setItem('userName', editProfileData.data.name);
          window.history.back();
        }
      }
    });
  } catch (err) {
    console.error(err);
    alert('Something went wrong!')
  }
});
