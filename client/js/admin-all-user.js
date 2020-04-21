window.addEventListener('load', async () => {
  await displayData({url: 'get_all_users'});

  document.getElementById('display-users').addEventListener('change', async event => {
    document.getElementById('pagination').remove();
    switch (event.target.value) {
      case 'all-students': await displayData({url: 'get_all_students'}); break;
      case 'all-admins': await displayData({url: 'get_all_admins'}); break;
      case 'all-tutors': await displayData({url: 'get_tutors'}); break;
      case 'all-alloc-studs': await displayData({url: 'get_all_allocated_students'}); break;
      case 'all-unalloc-studs': await displayData({url: 'get_all_unallocated_students'}); break;
      case 'all-alloc-tutors': await displayData({url: 'get_all_allocated_tutors'}); break;
      case 'all-unalloc-tutors': await displayData({url: 'get_all_unallocated_tutors'}); break;
      case 'all-active-users': await displayData({url: 'get_all_active_users'}); break;
      case 'all-inactive-users': await displayData({url: 'get_all_inactive_users'}); break;
      default: await displayData({url: 'get_all_users'}); break;
    }
  });
});
