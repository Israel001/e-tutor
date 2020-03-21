if (loggedIn) window.location = '/index.html';

if (!window.location.href.includes('token')) window.location = '/index.html';

const pwdToken = window.location.href.split('?')[1].split('=')[1];

if (pwdToken.length < 32) window.location = '/index.html';

const forms = document.getElementsByClassName('needs-validation');

const setErrorMessage = error => {
  document.querySelector('#loader').remove();
  document.querySelector('#change-pwd-btn-area').insertAdjacentHTML(
    'afterbegin',
    `<button type="submit" class="btn btn-primary" style="border-color: #f7941d ; background-color: #00b3a1" id="login-btn">
            Submit
          </button>`
  );
  document.querySelector('.col-md-8').insertAdjacentHTML(
    'afterbegin',
    `<div class="alert alert-danger">
            <a href="javascript:void(0);" class="close" data-dismiss="alert" aria-label="close">&times;</a>
            <strong>Error:</strong> ${error}
          </div>`
  );
};

Array.prototype.filter.call(forms, form => {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    event.stopPropagation();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
    } else {
      document.querySelector('#change-pwd-btn').remove();
      document.querySelector('#change-pwd-btn-area').insertAdjacentHTML(
        'afterbegin',
        `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12" id="loader">
              <div class="loader"></div>
            </div>`
      );
      let password = document.querySelector('#password').value;
      let confirmPassword = document.querySelector('#confirm-password').value;
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
      } else {
        try {
          const response = await fetch(`${baseURL}/new_password/${pwdToken}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({password})
          });
          const data = await response.json();
          if (response.status !== 201) {
            setErrorMessage(data.message);
          } else {
            document.querySelector('#password').value = '';
            document.querySelector('#confirm-password').value = '';
            document.querySelector('#forgot-pwd-btn').remove();
            document.querySelector('#forgot-pwd-btn-area').insertAdjacentHTML(
              'afterbegin',
              `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12" id="loader">
              <div class="loader"></div>
            </div>`
            );
            document.querySelector('.col-md-8').insertAdjacentHTML(
              'afterbegin',
              `<div class="alert alert-success">
                <a href="javascript:void(0);" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                <strong>Success:</strong> Your password has been changed successfully. 
                You can now <a href="/login.html">login</a> using your new password
            </div>`
            );
          }
        } catch (err) {
          setErrorMessage('Something went wrong');
        }
      }
    }
  });
});