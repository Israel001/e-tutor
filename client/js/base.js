const baseURL = 'https://e-tutor-server.herokuapp.com';
const baseClientURL = 'https://e-tutor-client.herokuapp.com';
const socket = io(baseURL);
const groupIds = [];
const conversationIds = [];

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
  socket.emit('loggedOut', {groupIds, userId, conversationIds});
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

Date.prototype.toDatetimeLocal = function toDatetimeLocal() {
  let date = this;
  let ten = i => (i < 10 ? '0': '') + i;
  let YYYY = date.getFullYear();
  let MM = ten(date.getMonth() + 1);
  let DD = ten(date.getDate());
  let HH = ten(date.getHours());
  let II = ten(date.getMinutes());
  return `${YYYY}${MM}${DD}${HH}${II}`;
};