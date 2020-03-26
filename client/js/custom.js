$(window).scroll(function(){
	if ($(window).scrollTop()>0){
		$("#back_top").show(300);
	}
	else{
		$("#back_top").hide(300);
	}
});
$('#back_top').click(function(){
	$('html, body').animate({scrollTop:0},500);
});
$( ".bell" ).click(function() {
	$( ".notify" ).slideToggle( "slow", function() {
	});
});

function scrollb() {
     var objDiv = document.getElementById("chat-messages");
     objDiv.scrollTop = objDiv.scrollHeight;

}
$(document).ready(function(){
    $('#chat-messages').animate({
        scrollTop: $('#chat-messages')[0].scrollHeight}, 2000);
});

function openmenu() {
	document.getElementById('side-menu').style.width="75%";
}
function closemenu() {
	document.getElementById('side-menu').style.width="0px";
}
function viewBygrid() {
  document.getElementById("gridmode").style.display="block";
  document.getElementById("listmode").style.display="none";
}
function viewBylist() {
  document.getElementById("listmode").style.display="block";
  document.getElementById("gridmode").style.display="none";
}
$(document).ready(function(){
	$('.slide-banner').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: true,
		dots: false,
		focusOnSelect: true
	});
	$('.slide-star').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: true,
		dots: true,
		focusOnSelect: true
	});
	$('.slide-s4').slick({
		slidesToShow: 4,
		slidesToScroll: 1,
		autoplay: true,
		focusOnSelect: true
	});

	$('.slide-s7').slick({
		dots: true,
		infinite: true,
		speed: 300,
		slidesToShow: 2,
		autoplay: true,
		slidesToScroll: 1,
		responsive: [
		{
			breakpoint: 1024,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				dots: true,
				autoplay: true
			}
		},
		{
			breakpoint: 768,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				autoplay: true,
				dots: true
			}
		},
		{
			breakpoint: 480,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				autoplay: true,
				dots: true
			}
		}
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
    	]
	});	
	$('.slide-s71').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: false,
		dots: true,
		focusOnSelect: true
	});
});
// $('a[href^="#"]').on('click', function(event) {
// 	var target = $(this.getAttribute("href"));
// 	if( target.length ) {
// 		event.preventDefault();
// 		$('html, body').stop().animate({
// 			scrollTop: target.offset().top
// 		}, 1000);
// 	}
// });

$(document).ready(function(){
	$('.slide-s6').slick({
		dots: true,
		infinite: true,
		speed: 300,
		slidesToShow: 3,
		autoplay: true,
		slidesToScroll: 1,
		responsive: [
		{
			breakpoint: 1024,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 1,
				dots: true,
				autoplay: true
			}
		},
		{
			breakpoint: 769,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				dots: true,
				autoplay: true
			}
		},
		{
			breakpoint: 600,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				autoplay: true,
				dots: true
			}
		},
		{
			breakpoint: 480,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				autoplay: true,
				dots: true
			}
		}
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
    	]
	});	
});


$(function() {
  var INDEX = 0; 
  $("#chat-submit").click(function(e) {
    e.preventDefault();
    var msg = $("#chat-input").val(); 
    if(msg.trim() == ''){
      return false;
    }
    generate_message(msg, 'self');
    var buttons = [
        {
          name: 'Existing User',
          value: 'existing'
        },
        {
          name: 'New User',
          value: 'new'
        }
      ];
    setTimeout(function() {      
      generate_message(msg, 'user');  
    }, 1000)
    
  })
  
  function generate_message(msg, type) {
    INDEX++;
    var str="";
    str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg "+type+"\">";
    str += "          <span class=\"msg-avatar\">";
    str += "            <img src=\"https:\/\/image.crisp.im\/avatar\/operator\/196af8cc-f6ad-4ef7-afd1-c45d5231387c\/240\/?1483361727745\">";
    str += "          <\/span>";
    str += "          <div class=\"cm-msg-text\">";
    str += msg;
    str += "          <\/div>";
    str += "        <\/div>";
    $(".chat-logs").append(str);
    $("#cm-msg-"+INDEX).hide().fadeIn(300);
    if(type == 'self'){
     $("#chat-input").val(''); 
    }    
    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight}, 1000);    
  }  
  
  function generate_button_message(msg, buttons){    
    /* Buttons should be object array 
      [
        {
          name: 'Existing User',
          value: 'existing'
        },
        {
          name: 'New User',
          value: 'new'
        }
      ]
    */
    INDEX++;
    var btn_obj = buttons.map(function(button) {
       return  "              <li class=\"button\"><a href=\"javascript:;\" class=\"btn btn-primary chat-btn\" chat-value=\""+button.value+"\">"+button.name+"<\/a><\/li>";
    }).join('');
    var str="";
    str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg user\">";
    str += "          <span class=\"msg-avatar\">";
    str += "            <img src=\"https:\/\/image.crisp.im\/avatar\/operator\/196af8cc-f6ad-4ef7-afd1-c45d5231387c\/240\/?1483361727745\">";
    str += "          <\/span>";
    str += "          <div class=\"cm-msg-text\">";
    str += msg;
    str += "          <\/div>";
    str += "          <div class=\"cm-msg-button\">";
    str += "            <ul>";   
    str += btn_obj;
    str += "            <\/ul>";
    str += "          <\/div>";
    str += "        <\/div>";
    $(".chat-logs").append(str);
    $("#cm-msg-"+INDEX).hide().fadeIn(300);   
    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight}, 1000);
    $("#chat-input").attr("disabled", true);
  }
  
  $(document).delegate(".chat-btn", "click", function() {
    var value = $(this).attr("chat-value");
    var name = $(this).html();
    $("#chat-input").attr("disabled", false);
    generate_message(name, 'self');
  })
  
  $("#chat-circle").click(function() {    
    $("#chat-circle").toggle('scale');
    $(".chat-box").toggle('scale');
  })
  
  $(".chat-box-toggle").click(function() {
    $("#chat-circle").toggle('scale');
    $(".chat-box").toggle('scale');
  })
  
})

/*----------*/
$(document).ready(function(){
	
  var preloadbg = document.createElement("img");
  preloadbg.src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/timeline1.png";
  
	$("#searchfield").focus(function(){
		if($(this).val() == "Search contacts..."){
			$(this).val("");
		}
	});
	$("#searchfield").focusout(function(){
		if($(this).val() == ""){
			$(this).val("Search contacts...");
			
		}
	});
	
	$("#sendmessage input").focus(function(){
		if($(this).val() == "Send message..."){
			$(this).val("");
		}
	});
	$("#sendmessage input").focusout(function(){
		if($(this).val() == ""){
			$(this).val("Send message...");
			
		}
	});
		
	
	$(".friend").each(function(){		
		$(this).click(function(){
			var childOffset = $(this).offset();
			var parentOffset = $(this).parent().parent().offset();
			var childTop = childOffset.top - parentOffset.top;
			var clone = $(this).find('img').eq(0).clone();
			var top = childTop+12+"px";
			
			$(clone).css({'top': top}).addClass("floatingImg").appendTo("#chatbox");									
			
			setTimeout(function(){$("#profile p").addClass("animate");$("#profile").addClass("animate");}, 100);
			setTimeout(function(){
				$("#chat-messages").addClass("animate");
				$('.cx, .cy').addClass('s1');
				setTimeout(function(){$('.cx, .cy').addClass('s2');}, 100);
				setTimeout(function(){$('.cx, .cy').addClass('s3');}, 200);			
			}, 150);														
			
			$('.floatingImg').animate({
				'width': "68px",
				'left':'108px',
				'top':'20px'
			}, 200);
			
			var name = $(this).find("p strong").html();
			var email = $(this).find("p span").html();														
			$("#profile p").html(name);
			$("#profile span").html(email);			
			
			$(".message").not(".right, #unfloat").find("img").attr("src", $(clone).attr("src"));								
			$('#friendslist').fadeOut();
			$('#chatview').fadeIn();
		
			
			$('#close').unbind("click").click(function(){				
				$("#chat-messages, #profile, #profile p").removeClass("animate");
				$('.cx, .cy').removeClass("s1 s2 s3");
				$('.floatingImg').animate({
					'width': "40px",
					'top':top,
					'left': '12px'
				}, 200, function(){$('.floatingImg').remove()});				
				
				setTimeout(function(){
					$('#chatview').fadeOut();
					$('#friendslist').fadeIn();				
				}, 50);
			});
			
		});
	});			
});

/*calendar*/
/*
	Problems i know that exist but i don't want to waste time with them (since it's just a playground):
	- When an entry title is big and needs a second line it overflows other stuff
	- the images takes a bit to load so dont rush opening the entry, no need to go into compressing
	- to remove an image from the input (while inserting an entry) just click the input and click cancel afterwards, the input keeps the file after inserting an entry, when you enter another entry the image will still be there for that new entry
*/
var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var MonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function Month(year, month, dates) {
  this.date = new Date(year, month, 0);
  this.numberofdays = this.date.getDate();
  this.numberofmonth = this.date.getMonth();
  this.nameofmonth = MonthNames[this.date.getMonth()];
  this.firstday = 1;
  this.year = this.date.getFullYear();
  this.calendar = generateCalendar(this.numberofdays, year, month - 1, this.firstday, dates);
}

function Date2Day(year, month, day) {
  return new Date(year, month, day).getDay();
}

function generateCalendar(numberofdays, year, month, day, dates) {
  var WEEKDAY = daysOfWeek[Date2Day(year, month, day)];
  if (WEEKDAY in dates) {
    dates[WEEKDAY].push(day);
  } else {
    dates[WEEKDAY] = [day];
  }
  day++;
  return day > numberofdays ? dates : generateCalendar(numberofdays, year, month, day, dates);
}
// to add a zero to the time when this is less than 10
function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function resetColors() {
  var defaultColor = { color: "#2980b9" };
  var color1 = { color: "#DB1B1B" };
  var color2 = { color: "#8BB929" };
  var color3 = { color: "#E4F111" };
  var color4 = { color: "#8129B9" };
  var color5 = { color: "#666666" };
  return { dColor: defaultColor, color1: color1, color2: color2, color3: color3, color4: color4, color5: color5 };
}

Date.daysBetween = function (date1, date2) {
  var firstDate = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  var secondDate = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  var diference = (secondDate - firstDate) / 86400000;
  return Math.trunc(diference);
};

var Calendar = React.createClass({ displayName: "Calendar",
  getInitialState: function () {return this.generateCalendar();},
  generateCalendar: function () {
    var today = new Date();
    var present = new Date();
    var month = {};
    var entries = [];
    var defaultColor = { color: "#2980b9" };
    var color1 = { color: "#DB1B1B" };
    var color2 = { color: "#8BB929" };
    var color3 = { color: "#E4F111" };
    var color4 = { color: "#8129B9" };
    var color5 = { color: "#666666" };
    var file = {};
    month = new Month(today.getFullYear(), today.getMonth() + 1, month);
    return { dates: month, today: today, entry: '+', present: present, entries: entries, dColor: defaultColor, color1: color1, color2: color2, color3: color3, color4: color4, color5: color5, file: file };
  },
  update: function (direction) {
    var month = {};
    if (direction == "left") {
      month = new Month(this.state.dates.date.getFullYear(), this.state.dates.date.getMonth(), month);
    } else {
      month = new Month(this.state.dates.date.getFullYear(), this.state.dates.date.getMonth() + 2, month);
    }
    this.state.currDay = "";
    this.state.currMonth = "";
    this.state.currYear = "";
    $(".float").removeClass('rotate');
    return this.setState({ dates: month });
  },
  selectedDay: function (day) {
    this.state.warning = "";
    var selected_day = new Date();
    selected_day.setDate(day);
    var currentMonth = this.state.dates.nameofmonth;
    var currentMonthN = this.state.dates.numberofmonth;
    var currentYear = this.state.dates.date.getFullYear();
    return this.setState({ today: selected_day, currDay: day, currMonth: currentMonth, currYear: currentYear, currMonthN: currentMonthN });
  },
  returnPresent: function () {
    if ($(".float").hasClass('rotate')) {
      $(".float").removeClass('rotate');
      $("#add_entry").addClass('animated slideOutDown');
      window.setTimeout(function () {
        $("#add_entry").css('display', 'none');
      }, 500);
      $("#entry_name").val("");
    }
    var month = {};
    var today = new Date();
    month = new Month(today.getFullYear(), today.getMonth() + 1, month);
    this.state.currDay = "";
    this.state.currMonth = "";
    this.state.currYear = "";
    $(".float").removeClass('rotate');
    return this.setState({ dates: month, today: today });
  },
  addEntry: function (day) {
    if (this.state.currDay) {
      if ($(".float").hasClass('rotate')) {
        $(".float").removeClass('rotate');
        $(".entry").css('background', 'none');
        $("#open_entry").addClass('animated slideOutDown');
        $("#add_entry").addClass('animated slideOutDown');
        window.setTimeout(function () {
          $("#add_entry").css('display', 'none');
          $("#open_entry").css('display', 'none');
        }, 700);
        $("#entry_name").val("");
        $("#all-day").prop('checked', false); // unchecks checkbox
        $("#not-all-day").css('display', 'block');
        $("#enter_hour").val("");
        $("#entry_location").val("");
        $("#entry_note").val("");
        // reset entry colors
        var resColor = new resetColors();
        return this.setState(resColor);
      } else {
        $(".float").addClass('rotate');
        $("#add_entry").removeClass('animated slideOutDown');
        $("#add_entry").addClass('animated slideInUp');
        $("#add_entry").css('display', 'block');
        window.setTimeout(function () {
          $("#entry_name").focus();
        }, 700);

      }
    } else {
      return this.setState({ warning: "Select a day to make an entry!" });
    }
  },
  saveEntry: function (year, month, day) {
    var entryName = $("#entry_name").val();
    if ($.trim(entryName).length > 0) {
      var entryTime = new Date();
      var entryDate = { year, month, day };
      $(".duration").css('background', 'none');
      if ($("#all-day").is(':checked')) {
        var entryDuration = "All day";
      } else if ($("#enter_hour").val() && $("#enter_hour").val() >= 0 && $("#enter_hour").val() <= 24) {
        var entryDuration = addZero($("#enter_hour").val());
      } else {
        $(".duration").css('background', '#F7E8E8');
        return 0;
      }
      if ($("#entry_location").val()) {
        var entryLocation = $("#entry_location").val();
      } else {var entryLocation = "";}
      if ($("#entry_note").val()) {
        var entryNote = $("#entry_note").val();
      } else {var entryNote = "";}

      var entryImg = this.state.file;
      var entryColor = this.state.dColor;
      var entry = { entryName, entryDate, entryTime, entryDuration, entryLocation, entryNote, entryColor, entryImg };
      this.state.entries.splice(0, 0, entry);

      // clean and close entry page
      $(".float").removeClass('rotate');
      $("#add_entry").addClass('animated slideOutDown');
      window.setTimeout(function () {
        $("#add_entry").css('display', 'none');
      }, 700);
      $("#entry_name").val("");
      $("#all-day").prop('checked', false); // unchecks checkbox
      $("#not-all-day").css('display', 'block');
      $("#enter_hour").val("");
      $("#entry_location").val("");
      $("#entry_note").val("");
      // reset entry colors
      var resColor = new resetColors();

      return this.setState({ entries: this.state.entries }), this.setState(resColor);
    }
  },
  deleteEntry: function (e) {
    this.state.entries.splice(e, 1);
    $(".float").removeClass('rotate');
    $("#open_entry").addClass('animated slideOutDown');
    $("#add_entry").addClass('animated slideOutDown');
    window.setTimeout(function () {
      $("#add_entry").css('display', 'none');
      $("#open_entry").css('display', 'none');
    }, 700);
    $(".entry").css('background', 'none');
    $("#entry_name").val("");
    $("#all-day").prop('checked', false); // unchecks checkbox
    $("#not-all-day").css('display', 'block');
    $("#enter_hour").val("");
    $("#entry_location").val("");
    $("#entry_note").val("");
    var resColor = new resetColors();
    return this.setState({ entries: this.state.entries }), this.setState(resColor);
  },
  openEntry: function (entry, e) {
    if ($(".float").hasClass('rotate')) {
      $(".float").removeClass('rotate');
      $("#open_entry").addClass('animated slideOutDown');
      window.setTimeout(function () {
        $("#open_entry").css('display', 'none');
      }, 700);
      $(".entry").css('background', 'none');
      $("#" + e).css('background', 'none');
    } else {
      window.setTimeout(function () {
        $("#open_entry").removeClass('animated slideOutDown');
        $("#open_entry").addClass('animated slideInUp');
        $("#open_entry").css('display', 'block');
      }, 50);
      $(".float").addClass('rotate');
      $("#" + e).css('background', '#F1F1F1');
      return this.setState({ openEntry: entry });
    }
  },
  setColor: function (color, state) {
    switch (state) {
      case 'color1':
        var changeColor = { color: this.state.dColor.color };
        var defColor = { color: color.color };
        return this.setState({ dColor: defColor, color1: changeColor });
        break;
      case 'color2':
        var changeColor = { color: this.state.dColor.color };
        var defColor = { color: color.color };
        return this.setState({ dColor: defColor, color2: changeColor });
        break;
      case 'color3':
        var changeColor = { color: this.state.dColor.color };
        var defColor = { color: color.color };
        return this.setState({ dColor: defColor, color3: changeColor });
        break;
      case 'color4':
        var changeColor = { color: this.state.dColor.color };
        var defColor = { color: color.color };
        return this.setState({ dColor: defColor, color4: changeColor });
        break;
      case 'color5':
        var changeColor = { color: this.state.dColor.color };
        var defColor = { color: color.color };
        return this.setState({ dColor: defColor, color5: changeColor });
        break;}

  },
  handleImage: function (e) {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      reader.onloadend = () => {
        var readerResult = reader.result;
        var img = { file, readerResult };
        this.setState({ file: img });
      };
      reader.readAsDataURL(file);
    } else {
      var img = {};
      this.setState({ file: img });
    }
  },
  openMenu: function () {
    $("#menu").css('display', 'block');
    $("#menu-content").addClass('animated slideInLeft');
    $("#menu-content").css('display', 'block');
  },
  render: function () {
    var calendar = [];
    for (var property in this.state.dates.calendar) {
      calendar.push(this.state.dates.calendar[property]);
    }
    var weekdays = Object.keys(this.state.dates.calendar);
    var done = false;
    var count = 0;
    var daysBetween = '';
    if (this.state.openEntry) {
      var selectdDate = new Date(this.state.openEntry.entryDate.year, this.state.openEntry.entryDate.month, this.state.openEntry.entryDate.day);
      if (selectdDate > this.state.present) {
        daysBetween = Date.daysBetween(this.state.present, selectdDate);
        if (daysBetween == 1) {daysBetween = "Tomorrow";} else {daysBetween = daysBetween + " days to go";}
      } else if (selectdDate < this.state.present) {
        daysBetween = Date.daysBetween(selectdDate, this.state.present);
        if (daysBetween == 1) {daysBetween = "Yesterday";} else {daysBetween = daysBetween + " days ago";}
      }
      if (this.state.present.getDate() === this.state.openEntry.entryDate.day && this.state.present.getMonth() === this.state.openEntry.entryDate.month && this.state.present.getFullYear() === this.state.openEntry.entryDate.year) {
        daysBetween = "Today";
      }
    }
    return (
      React.createElement("div", null,
      React.createElement("div", { id: "calendar" },
      React.createElement("div", { id: "menu" },
      React.createElement("div", { id: "menu-content" },
      React.createElement("div", { className: "madeBy" },
      React.createElement("div", { className: "madeOverlay" },
      React.createElement("span", { id: "madeName" }, "Ricardo Barbosa"),
      React.createElement("span", { id: "madeInfo" }, "WebDeveloper - Portugal"),
      React.createElement("span", { id: "madeWeb" }, React.createElement("a", { target: "_blank", href: "https://github.com/RicardoPBarbosa" }, React.createElement("i", { className: "fa fa-github", "aria-hidden": "true" }), " GitHub")),
      React.createElement("span", { id: "madeWeb" }, React.createElement("a", { target: "_blank", href: "https://codepen.io/RicardoBarbosa/" }, React.createElement("i", { className: "fa fa-codepen", "aria-hidden": "true" }), " CodePen"))),

      React.createElement("img", { src: "https://imgur.com/LOaisfQ.jpg", width: "260", height: "200" }))),


      React.createElement("div", { id: "click-close" })),

      React.createElement("div", { id: "header" },
      React.createElement("i", { className: "fa fa-bars", "aria-hidden": "true", onClick: this.openMenu }),
      React.createElement("p", null, this.state.dates.nameofmonth, " ", this.state.dates.year),
      React.createElement("div", null, React.createElement("i", { onClick: this.returnPresent, className: "fa fa-calendar-o", "aria-hidden": "true" }, React.createElement("span", null, this.state.present.getDate()))),
      React.createElement("i", { className: "fa fa-search", "aria-hidden": "true" })),

      React.createElement("div", { id: "add_entry" },
      React.createElement("div", { className: "enter_entry" },
      React.createElement("input", { type: "text", placeholder: "Enter title", id: "entry_name" }),
      React.createElement("span", { id: "save_entry", onClick: this.saveEntry.bind(null, this.state.currYear, this.state.currMonthN, this.state.currDay) }, "SAVE")),

      React.createElement("div", { className: "entry_details" },
      React.createElement("div", null,
      React.createElement("div", { className: "entry_info first" },
      React.createElement("i", { className: "fa fa-image", "aria-hidden": "true" }),
      React.createElement("input", { type: "file", name: "entry-img", id: "entry-img", onChange: e => this.handleImage(e) }),
      React.createElement("label", { htmlFor: "entry-img", id: "for_img" }, React.createElement("span", { id: "file_name" }, "Choose an image")),
      React.createElement("span", { id: "remove_img" }, "Remove")),

      React.createElement("div", { className: "entry_info2 first second duration" },
      React.createElement("i", { className: "fa fa-clock-o", "aria-hidden": "true" }),
      React.createElement("input", { className: "toggle", type: "checkbox", name: "all-day", id: "all-day" }),
      React.createElement("p", null, "All-day"),
      React.createElement("div", { id: "not-all-day" },
      React.createElement("p", { id: "select_hour" }, "Select hour"),
      React.createElement("p", { id: "hour" }, React.createElement("input", { type: "number", id: "enter_hour", min: "0", max: "24" }), " h"))),


      React.createElement("div", { className: "entry_info2" },
      React.createElement("i", { className: "fa fa-map-marker", "aria-hidden": "true" }),
      React.createElement("input", { type: "text", placeholder: "Add location", id: "entry_location" })),

      React.createElement("div", { className: "entry_info2" },
      React.createElement("i", { className: "fa fa-pencil", "aria-hidden": "true" }),
      React.createElement("textarea", { id: "entry_note", cols: "35", rows: "2", placeholder: "Add note" })),

      React.createElement("div", { className: "entry_info colors" },
      React.createElement("i", { className: "fa fa-circle", "aria-hidden": "true", id: "blue", style: this.state.dColor }),
      React.createElement("p", { id: "defColor" }, "Default color"),
      React.createElement("div", null,
      React.createElement("span", null, React.createElement("i", { onClick: this.setColor.bind(null, this.state.color1, "color1"), className: "fa fa-circle", "aria-hidden": "true", style: this.state.color1 })),
      React.createElement("span", null, React.createElement("i", { onClick: this.setColor.bind(null, this.state.color2, "color2"), className: "fa fa-circle", "aria-hidden": "true", style: this.state.color2 })),
      React.createElement("span", null, React.createElement("i", { onClick: this.setColor.bind(null, this.state.color3, "color3"), className: "fa fa-circle", "aria-hidden": "true", style: this.state.color3 })),
      React.createElement("span", null, React.createElement("i", { onClick: this.setColor.bind(null, this.state.color4, "color4"), className: "fa fa-circle", "aria-hidden": "true", style: this.state.color4 })),
      React.createElement("span", null, React.createElement("i", { onClick: this.setColor.bind(null, this.state.color5, "color5"), className: "fa fa-circle", "aria-hidden": "true", style: this.state.color5 }))))))),





      this.state.openEntry ?
      React.createElement("div", { id: "open_entry" },
      React.createElement("div", { className: "entry_img", style: { backgroundColor: this.state.openEntry.entryColor.color } },
      React.createElement("div", { className: "overlay" }, React.createElement("div", null,
      React.createElement("p", null,
      React.createElement("span", { id: "entry_title" }, this.state.openEntry.entryName),
      React.createElement("span", { id: "entry_times" }, daysBetween, " ", this.state.openEntry.entryDuration === "All day" ? "| All day" : "at " + this.state.openEntry.entryDuration + ":00")))),


      React.createElement("img", { src: this.state.openEntry.entryImg.readerResult, width: "400px", height: "300px" })),

      React.createElement("div", { className: "entry openedEntry" }, React.createElement("div", null,
      React.createElement("i", { className: "fa fa-map-marker", "aria-hidden": "true" }), " ", this.state.openEntry.entryLocation ? this.state.openEntry.entryLocation : React.createElement("span", null, "No location"))),

      React.createElement("div", { className: "entry openedEntry noteDiv" }, React.createElement("div", null,
      React.createElement("i", { className: "fa fa-pencil", "aria-hidden": "true" }), " ", this.state.openEntry.entryNote ? React.createElement("span", { id: "note" }, this.state.openEntry.entryNote) : React.createElement("span", null, "No description")))) :


      null,
      React.createElement("div", { id: "arrows" },
      React.createElement("i", { className: "fa fa-arrow-left", "aria-hidden": "true", onClick: this.update.bind(null, "left") }),
      React.createElement("i", { className: "fa fa-arrow-right", "aria-hidden": "true", onClick: this.update.bind(null, "right") })),

      React.createElement("div", { id: "dates" },
      calendar.map(function (week, i) {
        return (
          React.createElement("div", { key: i },
          React.createElement("p", { className: "weekname" }, weekdays[i].substring(0, 3)),
          React.createElement("ul", null,
          week.map(function (day, k) {
            var existEntry = {};
            {this.state.entries.map(function (entry, e) {
                if (entry.entryDate.day == day && entry.entryDate.month == this.state.dates.numberofmonth && entry.entryDate.year == this.state.dates.year) {
                  existEntry = { borderWidth: "2px", borderStyle: "solid", borderColor: "#8DBEDE" };
                  return;
                }
              }.bind(this));}
            return React.createElement("li", { className: day === this.state.today.getDate() ? "today" : null, key: k, style: existEntry, onClick: this.selectedDay.bind(null, day) }, day);
          }.bind(this)))));



      }.bind(this))),


      this.state.warning ?
      React.createElement("div", { className: "warning" },
      this.state.warning) :

      null,
      React.createElement("div", { id: "ignoreOverflow" }, React.createElement("button", { className: "float", onClick: this.addEntry.bind(null, this.state.today.getDate()) }, this.state.entry))),

      this.state.currDay ?
      React.createElement("div", { id: "entries" },
      React.createElement("div", { className: "contain_entries" },
      React.createElement("div", { id: "entries-header" },
      React.createElement("p", { className: "entryDay" }, this.state.currDay, " ", this.state.currMonth),
      this.state.present.getDate() === this.state.currDay && this.state.present.getMonth() === this.state.currMonthN && this.state.present.getFullYear() === this.state.currYear ? React.createElement("p", { className: "currday" }, "TODAY") : null),

      this.state.entries != '' ?
      React.createElement("div", null,
      this.state.entries.map(function (entry, e) {
        count++;
        var entryFromThisDate = entry.entryDate.day === this.state.currDay && entry.entryDate.month === this.state.currMonthN && entry.entryDate.year === this.state.currYear ? true : false;
        if (entryFromThisDate) {
          // prevent the "no-entries" div to appear in the next entries that are not from this day
          done = true;
          var style = { borderLeftColor: entry.entryColor.color, borderLeftWidth: "4px", borderLeftStyle: "solid" };
          return (
            React.createElement("div", { className: "entry", id: e, key: e },
            React.createElement("div", { style: style },
            React.createElement("div", { className: "entry_left", onClick: this.openEntry.bind(null, entry, e) },
            React.createElement("p", { className: "entry_event" }, entry.entryName),
            React.createElement("p", { className: "entry_time" }, entry.entryDuration === "All day" ? "All day" : entry.entryDuration + " h", " ", entry.entryLocation ? " | " + entry.entryLocation : null)),

            React.createElement("div", { className: "delete_entry" },
            React.createElement("i", { className: "fa fa-times", "aria-hidden": "true", onClick: this.deleteEntry.bind(null, e) })))));




        }
        if (count === this.state.entries.length) {
          if (!done) {
            done = true;
            return (
              React.createElement("div", { className: "no-entries", key: e },
              React.createElement("i", { className: "fa fa-calendar-check-o", "aria-hidden": "true" }),
              React.createElement("span", null, "No events planned for today")));


          }
        }
      }.bind(this))) :

      React.createElement("div", { className: "no-entries" },
      React.createElement("i", { className: "fa fa-calendar-check-o", "aria-hidden": "true" }),
      React.createElement("span", null, "No events planned for today")))) :




      null));


  } });

ReactDOM.render(React.createElement(Calendar, null), document.getElementById("app"));

(function ($, undefined) {
  $("#all-day").click(function () {
    if (this.checked) {
      $("#not-all-day").css('display', 'none');
    } else {
      $("#not-all-day").css('display', 'block');
    }
  });

  $("#click-close").click(function () {
    $("#menu-content").removeClass('animated slideInLeft');
    $("#menu-content").addClass('animated slideOutLeft');
    window.setTimeout(function () {
      $("#menu").css('display', 'none');
      $("#menu-content").css('display', 'none');
      $("#menu-content").removeClass('animated slideOutLeft');
    }, 750);
  });

  $("#entry-img").bind('change', function (e) {
    var label = this.nextElementSibling;
    var fileName = '';
    if (this.files) {
      fileName = e.target.value.split('\\').pop();
    } else {
      fileName = '';
    }
    if (fileName != '') {
      label.querySelector('span').innerHTML = fileName;
    } else {
      label.querySelector('span').innerHTML = "Choose an image";
    }
  });

  function hypot(x, y) {return Math.sqrt(x * x + y * y);}

  $("button").each(function (el) {
    var self = $(this),
    html = self.html();

    self.html("").append($('<div class="btn"/>').html(html));
  }).
  append($('<div class="ink-visual-container"/>').append($('<div class="ink-visual-static"/>'))).

  on("mousedown touchstart", function (evt) {
    event.preventDefault();

    var self = $(this),
    container = self.find(".ink-visual-static", true).eq(0);

    if (!container.length) return;

    container.find(".ink-visual").addClass("hide");

    var rect = this.getBoundingClientRect(),
    cRect = container[0].getBoundingClientRect(),
    cx,cy,radius,diam;

    if (event.changedTouches) {
      cx = event.changedTouches[0].clientX;
      cy = event.changedTouches[0].clientY;
    } else
    {
      cx = event.clientX;
      cy = event.clientY;
    }

    if (self.is(".float")) {
      var rx = rect.width / 2,
      ry = rect.height / 2,
      br = (rx + ry) / 2,
      mx = rect.left + rx,
      my = rect.top + ry;

      radius = hypot(cx - mx, cy - my) + br;
    }
    diam = radius * 2;

    var el = $('<div class="ink-visual"/>').width(diam).height(diam).
    css("left", cx - cRect.left - radius).css("top", cy - cRect.top - radius).

    on("animationend webkitAnimationEnd oanimationend MSAnimationEnd", function () {
      var self2 = $(this);

      switch (event.animationName) {
        case "ink-visual-show":
          if (self.is(":active")) self2.addClass("shown");
          break;

        case "ink-visual-hide":
          self2.remove();
          break;}

    }).

    on("touchend", function () {event.preventDefault();});

    container.append(el);
  });

  $(window).on("mouseup touchend", function (evt) {
    $(".ink-visual-static").children(".ink-visual").addClass("hide");
  }).
  on("select selectstart", function (evt) {event.preventDefault();return false;});
})(jQuery);


/*-----------upload-------------*/
var AttachmentArray = [];
var arrCounter = 0;
var input = $("#upload__input").val();
(function($) {  
  function createPdfPreview(fileContents, $displayElement) {
    PDFJS.getDocument(fileContents).then(function(pdf) {
      pdf.getPage(1).then(function(page) {
        var $previewContainer = $displayElement.find('.preview__thumb');
        var canvas = $previewContainer.find('canvas')[0];
        canvas.height = $previewContainer.innerHeight();
        canvas.width = $previewContainer.innerWidth();

        var viewport = page.getViewport(1);
        var scaleX = canvas.width / viewport.width;
        var scaleY = canvas.height / viewport.height;
        var scale = (scaleX < scaleY) ? scaleX : scaleY;
        var scaledViewport = page.getViewport(scale);

        var context = canvas.getContext('2d');
        var renderContext = {
          canvasContext: context,
          viewport: scaledViewport
        };
        page.render(renderContext);
      });
    });
  }
  
  
  
  
  
  function createPreview(file, fileContents, id) {
    var $previewElement = '';
    switch (file.type) {
      case 'image/png':
      case 'image/jpeg':
      case 'image/gif':
        $previewElement = $('<img src="' + fileContents + '" data-id="preview_' + id + '" />');
        break;
      case 'video/mp4':
      case 'video/webm':
      case 'video/ogg':
        $previewElement = $('<video autoplay muted width="100%" height="100%"><source src="' + fileContents + '" type="' + file.type + '"></video>');
        break;
      case 'application/pdf':
        $previewElement = $('<canvas id="" width="100%" height="100%"></canvas>');
        break;
      default:
        break;
    }
    var $displayElement = $('<div class="preview" id="preview_'+ id +'">\
                                <div class="preview__item">\
                                <span class="closes">x</span>\
                                <div class="preview__thumb"></div>\
                                <span class="preview__name" title="' + file.name + '">' + file.name + '</span>\
                                <span class="preview__type" title="' + file.type + '">' + file.type + '</span>\
                                </div>\
                            </div>');
    $displayElement.find('.preview__thumb').append($previewElement);
    $('.upload__files').append($displayElement);
    
    if (file.type === 'application/pdf') {
      createPdfPreview(fileContents, $displayElement);
    }
  }
  
  
  
  
  
  function fileInputChangeHandler(e) {
    var URL = window.URL || window.webkitURL;
    var fileList = e.target.files;
    if (fileList.length > 0) {
      $('.upload__files').html('');
      
      for (var i = 0; i < fileList.length; i++) {
        var file = fileList[i];
        var fileUrl = URL.createObjectURL(file);
        createPreview(file, fileUrl, i);
        FillAttachmentArray(file)
      }
      console.log(AttachmentArray);
    }
  }
  function FillAttachmentArray(file)
        {
            AttachmentArray[arrCounter] =
            {
                AttachmentType: 1,
                ObjectType: 1,
                FileName: file.name,
                FileDescription: "Attachment",
                NoteText: "",
                MimeType: file.type,
                FileSizeInBytes: file.size,
            };
            arrCounter = arrCounter + 1;
        }
  $(document).ready(function() {
    $('input:file').on('change', fileInputChangeHandler);
  });
})(jQuery.noConflict());

jQuery(function ($) {
            $('div').on('click', '.preview__item .closes', function () {
                var id = $(this).closest('.preview__item').find('img').data('id');

                //to remove the deleted item from array
                 var elementPos = AttachmentArray.map(function (x) { return x.FileName; }).indexOf(id);
                 if (elementPos !== -1) {
                     AttachmentArray.splice(elementPos, 1);
                 }
                
                

                // console.log(elementPos);

                //to remove image tag
                $(this).parent().find('img').not().remove();

                //to remove div tag that contain the image
                $(this).parent().find('div').not().remove();

                //to remove div tag that contain caption name
                $(this).parent().parent().find('div').not().remove();

                $('#'+ id ).remove();
              });
        });
  
