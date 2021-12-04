$(document).ready(function () {
  function updateCarouselIndex(currentIndex) {
    const totalImages = $("#post-carousel .carousel-item").length;

    $(".carousel-container .carousel-index").text(
      `${currentIndex}/${totalImages}`
    );
  }

  function handleSwitchNavActive(e) {
    document.querySelectorAll(".bottom-navigation .col-3").forEach((element) => {
      element.classList.remove("active");
    });
    e.currentTarget.classList.add("active");
  }

  function onLoad() {
    updateCarouselIndex(1);

    $("#post-carousel").on("slide.bs.carousel", function (e) {
      const currentIndex = e.to + 1;
      updateCarouselIndex(currentIndex);
    });

    $(".bottom-navigation .col-3").on("click", handleSwitchNavActive);
  }

  onLoad();
});
