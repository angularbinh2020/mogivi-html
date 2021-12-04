$(document).ready(function () {
  function updateCarouselIndex(currentIndex) {
    const totalImages = $("#post-carousel .carousel-item").length;

    $(".carousel-container .carousel-index").text(
      `${currentIndex}/${totalImages}`
    );
  }

  function onLoad() {
    updateCarouselIndex(1);
    $("#post-carousel").on("slide.bs.carousel", function (e) {
      const currentIndex = e.to + 1;
      updateCarouselIndex(currentIndex);
    });
  }

  onLoad();
});
