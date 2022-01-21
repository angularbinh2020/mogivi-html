$(document).ready(function () {
  function updateCarouselIndex(currentIndex) {
    const totalImages = $("#post-carousel .carousel-item").length;

    $(".carousel-container .carousel-index").text(
      `${currentIndex}/${totalImages}`
    );
  }

  function handleSwitchNavActive(e) {
    document
      .querySelectorAll(".bottom-navigation .col-3")
      .forEach((element) => {
        element.classList.remove("active");
      });
    e.currentTarget.classList.add("active");
  }

  function handleRenderVrTour({
    defaultView,
    imageUrl,
    imagePreviewUrl,
    tileSize,
    previewImageSize,
    imageOriginWidth,
  }) {
    function isIOS() {
      return (
        [
          "iPad Simulator",
          "iPhone Simulator",
          "iPod Simulator",
          "iPad",
          "iPhone",
          "iPod",
        ].includes(navigator.platform) ||
        // iPad on iOS 13 detection
        (navigator.userAgent.includes("Mac") && "ontouchend" in document)
      );
    }

    const viewer = new Marzipano.Viewer(
      document.getElementById("post-vr-tour")
    );

    const deviceOrientationControlMethod = new DeviceOrientationControlMethod();
    const controls = viewer.controls();
    controls.registerMethod(
      "deviceOrientation",
      deviceOrientationControlMethod
    );

    const maxFovDefault = (120 * Math.PI) / 180;

    const newSource = Marzipano.ImageUrlSource.fromString(imageUrl, {
      cubeMapPreviewUrl: imagePreviewUrl,
    });

    const newGeometry = new Marzipano.CubeGeometry([
      {
        tileSize: previewImageSize,
        size: previewImageSize,
        fallbackOnly: true,
      },
      { tileSize: tileSize, size: imageOriginWidth / 4 },
    ]);

    const newLimiter = Marzipano.RectilinearView.limit.traditional(
      imageOriginWidth / 4,
      maxFovDefault
    );

    const newView = new Marzipano.RectilinearView(
      { ...defaultView },
      newLimiter
    );

    const newScene = viewer.createScene({
      source: newSource,
      geometry: newGeometry,
      view: newView,
      pinFirstLevel: true,
    });

    newScene.switchTo();

    function requestPermissionForIOS() {
      window.DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === "granted") {
            enableDeviceOrientation();
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }

    function enableDeviceOrientation() {
      try {
        window.ReactNativeWebView.postMessage("is granted permission");
      } catch (e) {
        alert("Lỗi");
      }
      localStorage.setItem("isGrantedDeviceOrientation", "true");
      deviceOrientationControlMethod.getPitch(function (err, pitch) {
        if (!err) {
          newView.setPitch(pitch);
        }
      });
      controls.enableMethod("deviceOrientation");
    }

    function setEnableDeviceOrientation() {
      if (window.DeviceOrientationEvent) {
        const isIosAndNeedAskPermission =
          typeof window.isShowRequireDeviceOrientationPermission === "boolean"
            ? window.isShowRequireDeviceOrientationPermission
            : window.isShowRequireDeviceOrientationPermission === "true";
        const isNotGrantedPermission =
          localStorage.getItem("isGrantedDeviceOrientation") !== "true" ||
          isIosAndNeedAskPermission;
          alert(`isNotGrantedPermission: ${isNotGrantedPermission?'true':"false"}`);
        if (
          typeof window.DeviceOrientationEvent.requestPermission ==
            "function" &&
          isNotGrantedPermission
        ) {
          if (isIOS()) {
            requestPermissionForIOS();
            document
              .querySelector('[data-btn-type="accept-permission"]')
              .addEventListener("click", requestPermissionForIOS);

            document.querySelector('[data-target="#permissionModal"]').click();
          } else {
            requestPermissionForIOS();
          }
        } else {
          enableDeviceOrientation();
        }
      }
    }

    setEnableDeviceOrientation();
  }

  function handleSwitchViewVR(isHaveVrTour) {
    const vrSwitchContainer = document.querySelector(".vr-2d-container");

    if (!vrSwitchContainer) return;

    if (isHaveVrTour) {
      const vrButton = vrSwitchContainer.querySelector('[data-type="vr"]');
      const images2dButton =
        vrSwitchContainer.querySelector('[data-type="2d"]');
      if (!vrButton || !images2dButton) return;

      vrButton.addEventListener("click", function (e) {
        document
          .querySelectorAll(".carousel-container .image-2d-content")
          .forEach((element) => {
            element.classList.add("d-none");
          });
        document
          .querySelectorAll(".carousel-container .vr-tour-content")
          .forEach((element) => {
            element.classList.remove("d-none");
          });
        images2dButton.classList.remove("active");
        vrButton.classList.add("active");
      });

      images2dButton.addEventListener("click", function (e) {
        vrButton.classList.remove("active");
        images2dButton.classList.add("active");
        document
          .querySelectorAll(".carousel-container .vr-tour-content")
          .forEach((element) => {
            element.classList.add("d-none");
          });
        document
          .querySelectorAll(".carousel-container .image-2d-content")
          .forEach((element) => {
            element.classList.remove("d-none");
          });
      });

      const tourSetting = {
        defaultView: {
          pitch: 0.0732336538048628,
          yaw: 0.4144114484218129,
        },
        tileSize: 840,
        previewImageSize: 280,
        imageOriginWidth: 6720,
        imageUrl: `https://nhathat.azureedge.net/vrdev360/7a0b454b-8d43-481d-92e6-30057a851ca1/{f}_{x}_{y}.jpg`,
        imagePreviewUrl: `https://nhathat.azureedge.net/vrdev360/7a0b454b-8d43-481d-92e6-30057a851ca1/preview.jpg`,
      };

      handleRenderVrTour(tourSetting);

      return;
    }

    if (vrSwitchContainer) {
      document
        .querySelectorAll(".carousel-container .image-2d-content")
        .forEach((element) => {
          element.classList.remove("d-none");
        });
      document
        .querySelectorAll(".carousel-container .vr-tour-content")
        .forEach((element) => {
          element.classList.add("d-none");
        });
      vrSwitchContainer.classList.remove("d-flex");
      vrSwitchContainer.classList.add("d-none");
    }
  }

  function onLoad() {
    updateCarouselIndex(1);

    $("#post-carousel").on("slide.bs.carousel", function (e) {
      const currentIndex = e.to + 1;
      updateCarouselIndex(currentIndex);
    });

    $(".bottom-navigation .col-3").on("click", handleSwitchNavActive);

    handleSwitchViewVR(true);
  }

  onLoad();
});
