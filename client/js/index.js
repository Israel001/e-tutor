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
                <div class="status"></div>
            </div>`
            );
          }
        }
      }

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

    let divs = $('.friend');
    for (let i = 0; i < divs.length; i++)  {
      let thisDiv = divs[i];
      let $thisDiv = $(divs[i]);
      $thisDiv.click(async () => {
        let childOffset = $thisDiv.offset();
        let parentOffset = $thisDiv.parent().parent().offset();
        let childTop = childOffset.top - parentOffset.top;
        let clone = $thisDiv.find('img').eq(0).clone();
        let top = `${childTop+12}px`;
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
                addMessageToChat({
                  from: chatData.data.messages.messages[i].from,
                  id: chatData.data.messages.messages[i]._id,
                  message: chatData.data.messages.messages[i].message,
                  time: chatData.data.messages.messages[i].createdAt
                });
              }
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
                addMessageToChat({
                  from: chatData.data.messages[i].from._id,
                  id: chatData.data.messages[i]._id,
                  message: chatData.data.messages[i].message,
                  time: chatData.data.messages[i].createdAt
                });
              }
            }
          } catch (err) {
            console.error(err);
          }
        }

        const sendMessage = async () => {
          const message = document.querySelector('#send-message-input').value.trim();
          document.querySelector('#send-message-input').value = '';
          if (message.length > 0) {
            addMessageToChat({
              from: userId,
              id: 'processing-msg',
              message,
              time: new Date().getTime()
            });
            try {
              let chatResponse;
              if (id == null) {
                chatResponse = await fetch(`${baseURL}/message`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    to: [groupId], message, groupId
                  })
                });
              } else {
                chatResponse = await fetch(`${baseURL}/message`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    to: [id], message
                  })
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

        const editMessage = async (messageId, message) => {
          try {
            const chatResponse = await fetch(`${baseURL}/message/${messageId}/update`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({message})
            });
            if (chatResponse.status === 200) {
              const chatData = await chatResponse.json();
              console.log(chatData);
              // bla bla bla
            }
          } catch (err) {
            console.error(err);
          }
        };

        const deleteMessage = async messageId => {
          try {
            const chatResponse = await fetch(`${baseURL}/message/${messageId}/delete`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            });
            if (chatResponse.status === 200) {
              const chatData = await chatResponse.json();
              console.log(chatData);
            }
          } catch (err) {
            console.error(err);
          }
        };

        document.getElementById('send-message-input').addEventListener('keydown', event => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
          }
        });
        document.getElementById('send').addEventListener('click', sendMessage);
      });
    }

    socket.on('message', data => {
      if (data.action === 'send') {
        addMessageToChat({
          from: data.message.from,
          id: data.message._id,
          message: data.message.message,
          time: data.message.createdAt
        });
      }
    });

    socket.on('online', data => {
      if (document.querySelector(`#status-${data}`)) {
        document.querySelector(`#status-${data}`).classList.add('status');
      }
    });

    socket.on('offline', data => {
      if (document.querySelector(`#status-${data}`)) {
        document.querySelector(`#status-${data}`).classList.remove('status');
      }
    });

    const addMessageToChat = ({from, id, message, time}) => {
      document.querySelector('#chat-messages').insertAdjacentHTML(
        'beforeend',
        `<div class="message ${from === userId ? 'right' : ''}" id="${id}">
            <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" />
            <div class="bubble">
              ${message}
              <div class="corner"></div>
              <span>${moment(new Date(time).toDatetimeLocal().toString(), 'YYYYMMDDhhmmss').fromNow()}</span>
            </div>
          </div>`
      );
    };
  }
});