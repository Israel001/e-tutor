if (loggedIn) window.location = '/index.html';

if (!window.location.href.includes('code')) window.location = '/index.html';

const code = window.location.href.split('=')[1].split('&')[0];

window.addEventListener('load', async () => {
  try {
    const response = await fetch(`${baseURL}/verify_google_auth`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({code})
    });
    const data = await response.json();
    if (response.status !== 200) {
      alert(data.message);
    } else {
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
    alert('Something went wrong');
  }
});
