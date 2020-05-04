let chatUploadTask, chatFileRef, chatFileUploads;
const chatFiles = [];
const chatFilesRef = [];

firebase.initializeApp(firebaseConfig);

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
          console.log(document.getElementById(`file-${messageId}`));
          document.getElementById(`file-${messageId}`).remove()
        }
      } catch (err) {
        console.error(err);
      }
    });
  });
};

const addMessageToChat = ({from, id, photo, files, message, time}) => {
  document.querySelector('#chat-messages').insertAdjacentHTML(
    'beforeend',
    `<div class="message ${from === userId ? 'right' : ''}" id="${id}">
            ${files.length > 0 ? '' : `<div class="chat-img">
               <img src="${photo}" alt="">
            </div>`}
            <div class="bubble">
              ${message}
              <div id="time-tool">${moment(new Date(time).toDatetimeLocal().toString(), 'YYYYMMDDhhmmss').format('h:mm a')}</div>
              ${ from === userId ? `<div class="remove-mes" id="remove-mes-${id}"><a href="javascript:void(0);"><i class="fa fa-trash"></i></a></div>` : '' }
            </div>
          </div>`
  );
  if (files.length > 0) {
    document.querySelector('#chat-messages').insertAdjacentHTML(
      'beforeend',
      `<div class="message ${from === userId ? 'right' : ''}" id="file-${id}">
              <div class="chat-img"><img src="${photo}" alt=""></div>
              <div class="images" id="files-${id}"></div>
            </div>`
    );
    for (let i = 0; i < files.length; i++) {
      if (files[i].includes('jpg') || files[i].includes('jpeg') || files[i].includes('png') || files[i].includes('gif')) {
        document.querySelector(`#files-${id}`).insertAdjacentHTML(
          'beforeend',
          `<a href="${files[i]}" target="_blank"><img src="${files[i]}" alt=""></a>`
        );
      } else {
        document.querySelector(`#files-${id}`).insertAdjacentHTML(
          'beforeend',
          `<a href="${files[i]}" target="_blank"><i class="fa fa-file"></i>Document</a>`
        );
      }
    }
  }
  deleteMessage();
  $('#chat-messages').animate({
    scrollTop: $('#chat-messages')[0].scrollHeight
  }, 500);
};

const sendMessageWithFiles = async (id, groupId, message) => {
};

const sendMessage = async ({id, groupId}) => {
  let message = document.querySelector('#send-message-input').value;
  chatFileUploads = document.querySelector('#file').files;
  document.querySelector('#send-message-input').value = '';
  if (message.trim().length > 0) {
    message = message.trim();
    const data = new FormData();
    document.querySelector('.upload__files').remove();
    addMessageToChat({
      from: userId,
      id: 'processing-msg',
      photo: userPhoto,
      message,
      files: [],
      time: new Date().getTime()
    });
    document.querySelector('#chat-messages').insertAdjacentHTML(
      'beforeend',
      `<div class="upload__files"></div>`
    );
    if (chatFileUploads.length > 0) {
      if (chatFileUploads.length > 4) {
        alert('You can only upload 4 files at once');
      } else {
        for (let i = 0; i < chatFileUploads.length; i++) {
          generateBase64FromFile(chatFileUploads[i]).then(file => {
            const storageRef = firebase.storage().ref();
            chatFileRef = storageRef.child(`${new Date().getTime().toString()}-${chatFileUploads[i].name}`);
            chatUploadTask = chatFileRef.putString(file, 'data_url');
            chatUploadTask.on('state_changed', () => {
            }, error => {
              console.error(error);
              document.querySelector('#processing-msg').remove();
              alert('File Uploading Failed!');
            }, () => {
              chatUploadTask.snapshot.ref.getDownloadURL().then(async downloadUrl => {
                chatFiles.push(downloadUrl);
                chatFilesRef.push(chatFileRef);
                if (chatFiles.length === chatFileUploads.length) {
                  try {
                    let chatResponse;
                    const data = new FormData();
                    if (id == null) {
                      const to = [groupId];
                      data.append('to[]', to[0]);
                      data.append('message', message);
                      data.append('groupId', groupId);
                      for (let i = 0; i < chatFiles.length; i++) {
                        data.append('files[]', chatFiles[i]);
                      }
                      chatResponse = await fetch(`${baseURL}/message`, {
                        method: 'POST',
                        headers: {Authorization: `Bearer ${token}`},
                        body: data
                      });
                    } else {
                      data.append('to', id);
                      data.append('message', message);
                      for (let i = 0; i < chatFiles.length; i++) {
                        data.append('files[]', chatFiles[i]);
                      }
                      chatResponse = await fetch(`${baseURL}/message`, {
                        method: 'POST',
                        headers: {Authorization: `Bearer ${token}`},
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
              });
            });
          });
        }
      }
    } else {
      try {
        let chatResponse;
        if (id == null) {
          const to = [groupId];
          data.append('to[]', to[0]);
          data.append('message', message);
          data.append('groupId', groupId);
          chatResponse = await fetch(`${baseURL}/message`, {
            method: 'POST',
            headers: {Authorization: `Bearer ${token}`},
            body: data
          });
        } else {
          data.append('to', id);
          data.append('message', message);
          chatResponse = await fetch(`${baseURL}/message`, {
            method: 'POST',
            headers: {Authorization: `Bearer ${token}`},
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
  }
};

const handleConversationClicked = async (thisDiv, $thisDiv) => {
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
            from: chatData.data.messages.messages[i].from._id,
            id: chatData.data.messages.messages[i]._id,
            photo: chatData.data.messages.messages[i].from.image,
            message: chatData.data.messages.messages[i].message,
            files: chatData.data.messages.messages[i].files,
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
            files: chatData.data.messages[i].files,
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

  document.getElementById('sendmessage').addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage({id, groupId});
    }
  });
  document.getElementById('send').addEventListener('click', sendMessage);
};

const handleConversations = () => {
  let divs = $('.friend');
  for (let i = 0; i < divs.length; i++) {
    let thisDiv = divs[i];
    let $thisDiv = $(divs[i]);
    $thisDiv.click(() => handleConversationClicked(thisDiv, $thisDiv));
  }
};

const chat = async () =>  {
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
                <img src="${groupData.data.groups[i].image}" />
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
                <img src="${data.data.filteredConversations[i].image}" />
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
                      <img src="${searchData.data.users[i].image}" />
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
          files: data.message.files,
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
  }
};
