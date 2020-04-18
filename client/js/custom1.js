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


jQuery(document).ready(function ($) {
    $(document).ready(function(){
      $('ul li a').click(function(){
        $('li a').parent().find( 'a.active' ).removeClass("active");
        $(this).addClass("active");
        });
    });

});

/*-------------------------------------------------------------------*/
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
/*----------------------------------------------------------------*/
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
/*--------------------------------------------------------------*/
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
/*--------------------------------------------------------------*/

var AttachmentArray = [];
var arrCounter = 0;
var input = $("#upload__input").val();
var inp;
var fileTemp;
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
  inp = e.target;
    if (fileList.length > 0) {
      $('.upload__files').html('');
      
      for (var i = 0; i < fileList.length; i++) {
        var file = fileList[i];
        var fileUrl = URL.createObjectURL(file);
        createPreview(file, fileUrl, i);
        FillAttachmentArray(file, i)
      }
    fileTemp = fileList;
      console.log(AttachmentArray);
    } else {
    inp.files = fileTemp;
  }
  }
  function FillAttachmentArray(file, i)
        {
            AttachmentArray[arrCounter] =
            {
        Id: "preview_" + i,
                AttachmentType: 1,
                ObjectType: 1,
                FileName: file.name,
                FileDescription: "Attachment",
                NoteText: "",
                MimeType: file.type,
                FileSizeInBytes: file.size,
        file: file,
            };
            arrCounter = arrCounter + 1;
        }
  // function fileClick(e)
        // {
      // console.log('click!');
            // inp = e.target;
        // }
  $(document).ready(function() {
    $('input:file').on('change', fileInputChangeHandler);
  });
})(jQuery.noConflict());

jQuery(function ($) {
            $('div').on('click', '.preview__item .closes', function (e) {
        e.preventDefault();
                var id = $(this).closest('.preview__item').find('img').data('id');

                //to remove the deleted item from array
                 // var elementPos = AttachmentArray.map(function (x) { return x.FileName; }).indexOf(id);
                 // if (elementPos !== -1) {
                     // AttachmentArray.splice(elementPos, 1);
                 // }
         
        for (var i = 0; i < AttachmentArray.length; ++i) {
          if (AttachmentArray[i].Id === id)
          AttachmentArray.splice(i, 1);
        }
                // console.log(AttachmentArray);

             

                //to remove image tag
                $(this).parent().find('img').not().remove();

                //to remove div tag that contain the image
                $(this).parent().find('div').not().remove();

                //to remove div tag that contain caption name
                $(this).parent().parent().find('div').not().remove();

                console.log($(this).parent().parent().parent().find('#'+ id ));
                $('#'+ id ).remove();
        
        const dt = new DataTransfer()
        for (var i = 0; i < AttachmentArray.length; ++i) {
            dt.items.add(AttachmentArray[i].file);
        }
        
        inp.files = dt.files;
        fileTemp = inp.files;
        arrCounter = arrCounter - 1;
              });
        });
  
/*chart------------------------------------------------------------*/
// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

// Create chart instance
var chart = am4core.create("chartdiv", am4charts.XYChart);

// Add data
chart.data = [{
  "type": "Student",
  "count": 15
}, {
  "type": "Tutor",
  "count": 32
}, {
  "type": "Issue",
  "count": 23
}];

// Create axes

var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "type";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.minGridDistance = 30;

categoryAxis.renderer.labels.template.adapter.add("dy", function(dy, target) {
  if (target.dataItem && target.dataItem.index & 2 == 2) {
    return dy + 25;
  }
  return dy;
});

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

// Create series
var series = chart.series.push(new am4charts.ColumnSeries());
series.dataFields.valueY = "count";
series.dataFields.categoryX = "type";
series.name = "Count";
series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
series.columns.template.fillOpacity = .8;

var columnTemplate = series.columns.template;
columnTemplate.strokeWidth = 2;
columnTemplate.strokeOpacity = 1;


/*-----------------------------------------------------------------*/
function openmenu() {
  document.getElementById('side-menu').style.width="225px";
  document.getElementById('side-menu').style.marginLeft="0";
}
function closemenu() {
  document.getElementById('side-menu').style.width="0px";
  document.getElementById('side-menu').style.marginLeft="-255px";
}



