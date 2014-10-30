$(document).ready(function() {

  // this adds a class to the header to add a background color when below the first slide
  var homeHeight = $("#wrap [data-id='home']").height(),
      isSet = false;

  $(window).on('resize', function(){
    homeHeight = $("#wrap [data-id='home']").height(),
    isSet = false;
  });

  $(window).scroll(function() {    
      var scroll = $(window).scrollTop();

      if (scroll >= homeHeight) {
        if (isSet == false) {
          $("#nav").addClass('below');
          isSet = true;
        }
      } else {
          $("#nav").removeClass('below');
          isSet = false;
      }
  });
});