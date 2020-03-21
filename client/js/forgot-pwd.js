if (loggedIn) window.location = '/index.html';

const forms = document.getElementsByClassName('needs-validation');

const setErrorMessage = error => {
  document.querySelector('#forgot-pwd-btn').setAttribute('disabled', 'false');
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
      document.querySelector('#forgot-pwd-btn').setAttribute('disabled', 'true');
      let email = document.querySelector('#email_address').value;
      let url = 'http://127.0.0.1:8080';
      try {
        const response = await fetch (`${baseURL}/reset_password`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email, url})
        });
        const data = await response.json();
        if (response.status !== 200) {
          setErrorMessage(data.message);
        } else {
          document.querySelector('#email_address').value = '';
          document.querySelector('#forgot-pwd-btn').setAttribute('disabled', 'false');
          document.querySelector('.col-md-8').insertAdjacentHTML(
            'afterbegin',
            `<div class="alert alert-success">
                <a href="javascript:void(0);" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                <strong>Success:</strong> We've received your request. Please check your email to proceed further
            </div>`
          );
        }
      } catch (err) {
        setErrorMessage('Something went wrong');
      }
      document.querySelector('#forgot-pwd-btn').setAttribute('disabled', 'false');
    }
  })
});