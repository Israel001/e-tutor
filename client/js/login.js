if (loggedIn) window.location = '/index.html';

const forms = document.getElementsByClassName('needs-validation');

const setErrorMessage = error => {
  document.querySelector('#loader').remove();
  document.querySelector('#login-btn-area').insertAdjacentHTML(
    'afterbegin',
    `<button type="submit" class="btn btn-primary" style="border-color: #f7941d ; background-color: #00b3a1" id="login-btn">
            Login
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
      document.querySelector('#login-btn').remove();
      document.querySelector('#login-btn-area').insertAdjacentHTML(
        'afterbegin',
        `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12" id="loader">
              <div class="loader"></div>
            </div>`
      );
      let email = document.querySelector('#email_address').value;
      let password = document.querySelector('#password').value;
      try {
        const response = await fetch(`${baseURL}/login`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email, password})
        });
        const data = await response.json();
        if (response.status !== 200) {
          setErrorMessage(data.message);
        } else {
          let element = document.getElementById('auth-btn');
          element.attributes['href'] = 'javascript:void(0)';
          document.getElementById('auth-btn').innerText = 'Log Out';
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('userId', data.data.userId);
          localStorage.setItem('userRole', data.data.userRole);
          const remainingMilliseconds = 60 * 60 * 1000;
          const expiryDate = new Date(
            new Date().getTime() + remainingMilliseconds
          );
          localStorage.setItem('expiryDate', expiryDate.toISOString());
          autoLogout(remainingMilliseconds);
          window.location = '/index.html';
        }
      } catch (err) {
        setErrorMessage('Something went wrong');
      }
    }
  });
});
