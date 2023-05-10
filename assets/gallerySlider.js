const initSlider = (el) => {
//   console.log(slick);
  // el.slick({
  //   prevArrow: '.prevSlide',
  //   nextArrow: '.nextSlide',
  //   infinite: true,
  //   slidesToShow: 4,
  //   slidesToScroll: 1,
  //   dots: false,
  //   arrows: false,
  //   autoplay: false,
  //   autoplaySpeed: 2000
  // });
}

window.addEventListener('load', (event) => {

  const $ = function(selector) {
    var result = document.querySelectorAll(selector);

    result.onClick = function(callback) {
      this.forEach(function(item) {
        item.addEventListener('click', function(event) {
          if (callback) {
            callback(event);
          }
        });
      });
    };

    result.removeClass = function(className) {
      this.forEach(function(item) {
        item.classList.remove(className);
      });
    };

    result.addClass = function(className) {
      this.forEach(function(item) {
        item.classList.add(className);
      });
    };

    return result;
  };

	const $gallerySlider = $('.gallerySlider');

  if (typeof ($gallerySlider) !== 'undefined' && $gallerySlider.length) {
    initSlider($gallerySlider);
  }

});
