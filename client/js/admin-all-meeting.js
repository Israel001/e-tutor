window.addEventListener('load', async () => {
  try {
    const meetingsResponse = await fetch(`${baseURL}/meetings`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    const meetingsData = await meetingsResponse.json();
    console.log(meetingsData);
    document.getElementById('meetings-table').insertAdjacentHTML(
      'beforeend',
      `<tr>
            <th>No</th>
            <th>Title</th>
            <th>Organizer</th>
            <th>Date</th>
            <th>Status</th>
          </tr>`
    );
    for (let i = 0; i < meetingsData.data.length; i++) {
      document.getElementById('meetings-table').insertAdjacentHTML(
        'beforeend',
        `
          <tr>
            <td>${i + 1}</td>
            <td>${meetingsData.data[i].title}</td>
            <td>${meetingsData.data[i].organizer.name}</td>
            <td>${moment(meetingsData.data[i].date).format('MMMM Do YYYY, h:mm:ss a')}</td>
            <td>${meetingsData.data[i].status}</td>
          </tr>`
      );
    }
  } catch (err) {
    console.error(err);
  }
});
