const checkAuth = () => {
  if (loggedIn) {
    let element = document.getElementById('auth-btn');
    element.setAttribute('href','javascript:void(0);');
    document.getElementById('auth-btn').remove();
    document.getElementById('header-up').insertAdjacentHTML(
      'beforeend',
      `<div class="login-admin">
            <ul>
              <li>
                <a data-toggle=collapse href="#drop-logout">${userName} <img src="${userPhoto}" alt="Profile Picture"> <i class="fa fa-caret-down"></i></a>
                <ul id="drop-logout" class="panel-collapse collapse">
                  <li><a href="javascript:void(0);" id="logout-btn"><i class="fa fa-power-off"></i>Log Out</a></li>
                </ul>
              </li>
            </ul>
        </div>`
    );
    document.getElementById('logout-btn').addEventListener('click', logout);
    if (userRole === 'admin') {
      document.getElementById('user-menu').insertAdjacentHTML(
        'beforeend',
        `<li><a href="admin-panel.html"><i class="fa fa-star"></i> Admin</a></li>`
      );
    }
  } else {
    document.querySelector('.header-down').innerHTML = '';
    document.querySelector('#chat-circle').remove();
    document.querySelector('.chat-box').remove();
    document.getElementById('auth-btn').innerText = 'Log In';
  }
};
