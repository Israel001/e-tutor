if (loggedIn) {
  let element = document.getElementById('auth-btn');
  element.setAttribute('href','javascript:void(0);');
  document.getElementById('auth-btn').innerText = 'Log Out';
  element.addEventListener('click', logout);
} else {
  document.querySelector('.header-down').innerHTML = '';
  document.querySelector('#chat-circle').remove();
  document.querySelector('.chat-box').remove();
  document.getElementById('auth-btn').innerText = 'Log In';
}

window.addEventListener('load', async () => {
  try {
    document.querySelector('#tutors-list').insertAdjacentHTML(
      'beforeend',
      `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12" id="loader">
              <div class="loader"></div>
            </div>`
    );
    const response = await fetch(`${baseURL}/get_tutors`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    if (data.data.tutors.length > 0) {
      for (let i = 0; i < data.data.tutors.length; i++) {
        document.querySelector('#loader').remove();
        document.querySelector('#tutors-list').insertAdjacentHTML(
          'beforeend',
          `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                <div class="tutor-content">
                  <img src="images/tutor.jpg" alt="">
                  <span>${data.data.tutors[0].name}</span>
                </div>
              </div>`
        );
      }
    } else {
      document.querySelector('#loader').remove();
      document.querySelector('#tutors-list').insertAdjacentHTML(
        'beforeend',
        `<div class="col-lg-8">
              <div class="alert alert-info text-center">
                <strong>There are currently no tutors in the system</strong>
              </div>
            </div>`
      );
    }
  } catch (err) {
    console.error(err);
  }

  if (loggedIn) {
    try {
      document.querySelector('#groups').insertAdjacentHTML(
        'beforeend',
        `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12" id="loader">
              <div class="loader"></div>
            </div>`
      );
      const groupResponse = await fetch(`${baseURL}/groups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const groupData = await groupResponse.json();
      if (groupResponse.status !== 200) {
        window.alert(groupData.message);
      } else {
        document.getElementById('loader').remove();
        if (groupData.data.groups.length > 0) {
          for (let i = 0; i < groupData.data.groups.length; i++) {
            groupIds.push(groupData.data.groups[i]._id);
            document.querySelector('#groups').insertAdjacentHTML(
              'beforeend',
              `<div class="friend" id="group ${groupData.data.groups[i]._id}">
                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" />
                <p>
                    <strong>${groupData.data.groups[i].title}</strong><br>
                    <span>${groupData.data.groups[i].members.length} members</span>
                </p>
                <div id="status-${groupData.data.groups[i]._id}"></div>
            </div>`
            );
          }
        }
      }

      document.querySelector('#private').insertAdjacentHTML(
        'beforeend',
        `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12" id="loader">
              <div class="loader"></div>
            </div>`
      );
      const response = await fetch(`${baseURL}/get_conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.status !== 200) {
        window.alert(data.message);
      } else {
        document.getElementById('loader').remove();
        for (let i = 0; i < data.data.filteredConversations.length; i++) {
          conversationIds.push(data.data.filteredConversations[i]._id);
          document.querySelector('#private').insertAdjacentHTML(
            'beforeend',
            `<div class="friend" id="${data.data.filteredConversations[i]._id}">
                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" />
                <p>
                    <strong>${data.data.filteredConversations[i].name}</strong><br>
                    <span>${data.data.filteredConversations[i].email}</span>
                </p>
                <div id="status-${data.data.filteredConversations[i]._id}"></div>
            </div>`
          );
        }
        socket.emit('loggedIn', {groupIds, userId, conversationIds});
      }
    } catch (err) {
      console.error(err);
    }

    document.getElementById('searchfield').addEventListener('keyup', async event => {
      if (event.key === 'Enter') {
        const searchQuery = document.getElementById('searchfield').value;
        const searchResponse = await fetch(`${baseURL}/search_users?searchQuery=${searchQuery}`);
        if (searchResponse.status === 200) {
          const searchData = await searchResponse.json();
          for (let i = 0; i < searchData.data.users.length; i++) {
            if (searchData.data.users[i]._id !== userId && !document.getElementById(searchData.data.users[i]._id)) {
              document.querySelector('#private').insertAdjacentHTML(
                'beforeend',
                `<div class="friend" id="${searchData.data.users[i]._id}">
                      <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" />
                      <p>
                          <strong>${searchData.data.users[i].name}</strong><br>
                          <span>${searchData.data.users[i].email}</span>
                      </p>
                      <div id="status-${searchData.data.users[i]._id}"></div>
                    </div>`
              );
            }
          }
          handleConversations();
        }
      }
    });

    const handleConversations = () => {
      let divs = $('.friend');
      for (let i = 0; i < divs.length; i++) {
        let thisDiv = divs[i];
        let $thisDiv = $(divs[i]);
        $thisDiv.click(async () => {
          let childOffset = $thisDiv.offset();
          let parentOffset = $thisDiv.parent().parent().offset();
          let childTop = childOffset.top - parentOffset.top;
          let clone = $thisDiv.find('img').eq(0).clone();
          let top = `${childTop + 12}px`;
          $(clone).css({'top': top}).addClass('floatingImg').appendTo('#chatbox');
          setTimeout(() => {
            $('#profile p').addClass('animate');
            $('#profile').addClass('animate');
          }, 100);
          setTimeout(() => {
            $('#chat-messages').addClass('animate');
            $('.cx, .cy').addClass('s1');
            setTimeout(() => {
              $('.cx, .cy').addClass('s2');
            }, 100);
            setTimeout(() => {
              $('.cx, .cy').addClass('s3');
            }, 100);
          }, 150);
          $('.floatingImg').animate({
            'width': '68px',
            'left': '108px',
            'top': '20px'
          }, 200);
          let name = $thisDiv.find('p strong').html();
          let email = $thisDiv.find('p span').html();
          $('#profile p').html(name);
          $('#profile span').html(email);
          $('.message').not('.right').find('img').attr('src', $(clone).attr('src'));
          $('#friendslist').fadeOut();
          $('#chatview').fadeIn();
          $('#close').unbind('click').click(() => {
            $('#chat-messages, #profile, #profile p').removeClass('animate');
            $('.cx, .cy').removeClass('s1 s2 s3');
            $('.floatingImg').animate({
              'width': '40px',
              'top': top,
              'left': '12px'
            }, 200, () => {
              $('.floatingImg').remove();
            });
            setTimeout(() => {
              $('#chatview').fadeOut();
              $('#friendslist').fadeIn();
            });
          });
          let id = thisDiv.getAttribute('id');
          let groupId = null;
          if (id.includes('group')) {
            id = null;
            groupId = thisDiv.getAttribute('id').split(' ')[1];
            try {
              const chatResponse = await fetch(`${baseURL}/group_messages?groupId=${groupId}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                }
              });
              const chatData = await chatResponse.json();
              if (chatResponse.status !== 200) {
                window.alert(chatData.message);
              } else {
                document.querySelector('#chat-messages').innerHTML = '';
                for (let i = 0; i < chatData.data.messages.messages.length; i++) {
                  if (i === 0) {
                    document.querySelector('#chat-messages').insertAdjacentHTML(
                      'beforeend',
                      `<label>${moment(new Date(chatData.data.messages.messages[i].createdAt).toDatetimeLocal().toString(), 'YYYYMMDDhhmmss').format('MMMM Do YYYY')}</label>`
                    );
                  }
                  if (i > 0) {
                    const timeDiff = new Date(chatData.data.messages.messages[i].createdAt).getDay() - new Date(chatData.data.messages.messages[i - 1].createdAt).getDay();
                    if (timeDiff >= 1) {
                      document.querySelector('#chat-messages').insertAdjacentHTML(
                        'beforeend',
                        `<label>${moment(new Date(chatData.data.messages.messages[i].createdAt).toDatetimeLocal().toString(), 'YYYYMMDDhhmmss').format('MMMM Do YYYY')}</label>`
                      );
                    }
                  }
                  addMessageToChat({
                    from: chatData.data.messages.messages[i].from,
                    id: chatData.data.messages.messages[i]._id,
                    message: chatData.data.messages.messages[i].message,
                    time: chatData.data.messages.messages[i].createdAt
                  });
                }
                document.querySelector('#chat-messages').insertAdjacentHTML(
                  'beforeend',
                  `<div class="upload__files"></div>`
                );
              }
            } catch (err) {
              console.error(err);
            }
          } else {
            try {
              const chatResponse = await fetch(`${baseURL}/messages?users=${id}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                }
              });
              const chatData = await chatResponse.json();
              if (chatResponse.status !== 200) {
                window.alert(chatData.message);
              } else {
                document.querySelector('#chat-messages').innerHTML = '';
                for (let i = 0; i < chatData.data.messages.length; i++) {
                  if (i === 0) {
                    document.querySelector('#chat-messages').insertAdjacentHTML(
                      'beforeend',
                      `<label>${moment(new Date(chatData.data.messages.messages[i].createdAt).toDatetimeLocal().toString(), 'YYYYMMDDhhmmss').format('MMMM Do YYYY')}</label>`
                    );
                  }
                  if (i > 0) {
                    const timeDiff = new Date(chatData.data.messages.messages[i].createdAt).getDay() - new Date(chatData.data.messages.messages[i - 1].createdAt).getDay();
                    if (timeDiff >= 1) {
                      document.querySelector('#chat-messages').insertAdjacentHTML(
                        'beforeend',
                        `<label>${moment(new Date(chatData.data.messages.messages[i].createdAt).toDatetimeLocal().toString(), 'YYYYMMDDhhmmss').format('MMMM Do YYYY')}</label>`
                      );
                    }
                  }
                  addMessageToChat({
                    from: chatData.data.messages[i].from._id,
                    id: chatData.data.messages[i]._id,
                    message: chatData.data.messages[i].message,
                    time: chatData.data.messages[i].createdAt
                  });
                }
                document.querySelector('#chat-messages').insertAdjacentHTML(
                  'beforeend',
                  `<div class="upload__files"></div>`
                );
              }
            } catch (err) {
              console.error(err);
            }
          }

          document.getElementById('send-message-input').addEventListener('keyup', () => {
            if (id == null) {
              socket.emit('typing', {room: groupId, userId});
            } else {
              socket.emit('typing', {room: userId + id, userId});
            }
          });

          const sendMessage = async () => {
            let message = document.querySelector('#send-message-input').value;
            const fileUploads = document.querySelector('#file').files;
            document.querySelector('#send-message-input').value = '';
            if (message.trim().length > 0) {
              message = message.trim();
              const data = new FormData();
              const files = [];
              if (fileUploads.length > 0) {
                for (let i = 0; i < fileUploads.length; i++) {
                  files.push(fileUploads[i]);
                }
              }
              document.querySelector('.upload__files').remove();
              addMessageToChat({
                from: userId,
                id: 'processing-msg',
                message,
                time: new Date().getTime()
              });
              document.querySelector('#chat-messages').insertAdjacentHTML(
                'beforeend',
                `<div class="upload__files"></div>`
              );
              try {
                let chatResponse;
                if (id == null) {
                  const to = [groupId];
                  data.append('to[]', to[0]);
                  data.append('message', message);
                  data.append('groupId', groupId);
                  data.append('files[]', files);
                  chatResponse = await fetch(`${baseURL}/message`, {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`
                    },
                    body: data
                  });
                } else {
                  data.append('to', id);
                  data.append('message', message);
                  chatResponse = await fetch(`${baseURL}/message`, {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`
                    },
                    body: data
                  });
                }
                if (chatResponse.status === 201) {
                  const chatData = await chatResponse.json();
                  if (id == null) {
                    document.querySelector('#processing-msg').remove();
                  } else {
                    document.querySelector('#processing-msg').setAttribute('id', chatData.data.message._id);
                  }
                }
              } catch (err) {
                console.error(err);
              }
            }
          };

          document.getElementById('sendmessage').addEventListener('keydown', event => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          });
          document.getElementById('send').addEventListener('click', sendMessage);
        });
      }
    };

    handleConversations();

    socket.on('typing', data => {
      if (!document.getElementById('typing') && data !== userId) {
        document.querySelector('#chat-messages').insertAdjacentHTML(
          'beforeend',
          `<div class="message" id="typing">
                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" />
                <div class="bubble">
                    <div class="ticontainer">
                        <div class="tiblock">
                            <div class="tidot"></div>
                            <div class="tidot"></div>
                            <div class="tidot"></div>
                        </div>
                    </div>
                </div>
              </div>`
        );
        setTimeout(() => {
          document.getElementById('typing').remove();
        }, 5000);
      }
    });

    socket.on('message', data => {
      if (data.action === 'send') {
        if (document.getElementById('typing')) {
          document.getElementById('typing').remove();
        }
        addMessageToChat({
          from: data.message.from,
          id: data.message._id,
          message: data.message.message,
          time: data.message.createdAt
        });
      }
    });

    socket.on('message', data => {
      if (data.action === 'delete') {
        if (document.getElementById(data.message)) {
          document.getElementById(data.message).remove();
        }
      }
    });

    socket.on('online', data => {
      if (document.querySelector(`#status-${data.user}`)) {
        document.querySelector(`#status-${data.user}`).classList.add('status');
      }
      for (let i = 0; i < data.groups.length; i++) {
        if (document.querySelector(`#status-${data.groups[i]}`)) {
          document.querySelector(`#status-${data.groups[i]}`).classList.add('status');
        }
      }
    });

    socket.on('offline', data => {
      if (document.querySelector(`#status-${data.user}`)) {
        document.querySelector(`#status-${data.user}`).classList.remove('status');
      }
      for (let i = 0; i < data.groups.length; i++) {
        if (document.querySelector(`#status-${data.groups[i]}`)) {
          document.querySelector(`#status-${data.groups[i]}`).classList.remove('status');
        }
      }
    });

    const deleteMessage = () => {
      const messages = document.getElementsByClassName('remove-mes');
      Array.prototype.filter.call(messages, message => {
        message.addEventListener('click', async () => {
          const messageId = message.id.split('-')[2];
          try {
            document.getElementById(messageId).classList.add('processing-msg');
            const chatResponse = await fetch(`${baseURL}/message/${messageId}/delete`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            });
            if (chatResponse.status === 200) {
              document.getElementById(messageId).remove();
            }
          } catch (err) {
            console.error(err);
          }
        });
      });
    };

    const addMessageToChat = ({from, id, message, time}) => {
      document.querySelector('#chat-messages').insertAdjacentHTML(
        'beforeend',
        `<div class="message ${from === userId ? 'right' : ''}" id="${id}">
            <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" />
            <div class="bubble">
              ${message}
              <div id="time-tool">${moment(new Date(time).toDatetimeLocal().toString(), 'YYYYMMDDhhmmss').format('h:mm a')}</div>
              ${ from === userId ? `<div class="remove-mes" id="remove-mes-${id}"><a href="javascript:void(0);"><i class="fa fa-trash"></i></a></div>` : '' }
            </div>
          </div>`
      );
      deleteMessage();
      $('#chat-messages').animate({
        scrollTop: $('#chat-messages')[0].scrollHeight
      }, 2000);
    };
  }
});