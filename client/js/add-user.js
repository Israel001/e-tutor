
jQuery(document).ready(function ($) {
  function resize(){
   if($(window).width() >= '992'){
         $('.sidebar-left').css('width','255px');
         $('.sidebar-left').css('margin-left','0');
     }
     else{
          $('.sidebar-left').css('width','0');
          $('.sidebar-left').css('margin-left','-255px');
     }
};
    $(document).ready(resize);
    $(window).resize(resize);
});
/*------------------------------------------------------------------*/
jQuery(document).ready(function ($) {
    $(function () {
        $("input[name='tutor']").click(function () {
            if ($(".rad").is(":checked")) {
                $(".btn-next").removeAttr("disabled");
                $(".btn-next").focus();
            } else {
                $(".btn-next").attr("disabled", "disabled");
            }
        });
    });
    $(function () {
        $(".chk").click(function () {
            if ($(".chk").is(":checked")) {
                $(".submit1").removeAttr("disabled");
                $(".submit1").focus();
            } else {
                $(".submit1").attr("disabled", "disabled");
            }
        });
    });
});
/*-----------------------------------------------------------------*/
jQuery(document).ready(function ($) {
  $(function() {
      $('form > input').keyup(function() {

          var empty = false;
          $('form > input').each(function() {
              if ($(this).val() == '') {
                  empty = true;
              }
          });

          if (empty) {
              $('#btn-next').attr('disabled', 'disabled');
          } else {
              $('#btn-next').removeAttr('disabled');
          }
      });
  });
});
/*-----------------------------------------------------------------*/
function openmenu() {
  document.getElementById('side-menu').style.width="225px";
  document.getElementById('side-menu').style.marginLeft="0";
}
function closemenu() {
  document.getElementById('side-menu').style.width="0px";
  document.getElementById('side-menu').style.marginLeft="-255px";
}

/*--------------------------------------------------------------*/
jQuery(document).ready(function ($) {
    $("div[id^='myModal']").each(function(){
  
  var currentModal = $(this);
  
  //click next
  currentModal.find('.btn-next').click(function(){
    currentModal.modal('hide');
    currentModal.closest("div[id^='myModal']").nextAll("div[id^='myModal']").first().modal('show'); 
  });
  
  //click prev
  currentModal.find('.btn-prev').click(function(){
    currentModal.modal('hide');
    currentModal.closest("div[id^='myModal']").prevAll("div[id^='myModal']").first().modal('show'); 
  });

});
});

/*--------------------------------------------------------------*/
