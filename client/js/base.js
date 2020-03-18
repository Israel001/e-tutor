const baseURL = 'http://localhost:3000';

const autoLogout = milliseconds => {
  setTimeout(() => {
    logout();
  }, milliseconds);
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('expiryDate');
  window.location = '/index.html';
};

let loggedIn = localStorage.getItem('loggedIn');
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');
const expiryDate = localStorage.getItem('expiryDate');
if (!token || !expiryDate) {
  loggedIn = false;
} else if (new Date(expiryDate) <= new Date()) {
  logout();
} else {
  const remainingMilliseconds = new Date(expiryDate).getTime() - new Date().getTime();
  autoLogout(remainingMilliseconds);
}