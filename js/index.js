//@ts-check
$(document).ready(function () {
  const ImageStorageDomain = "https://nhathat.azureedge.net/vrdev360";

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
        const isNotGrantedPermission =
          localStorage.getItem("isGrantedDeviceOrientation") !== "true";
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

      const imageSetting = TourSetting.imagesSetting[0];

      const tourSetting = {
        defaultView: imageSetting.defaultView,
        tileSize: imageSetting.TitleSize,
        previewImageSize: imageSetting.previewImageSize,
        imageOriginWidth: imageSetting.ResolutionOriginalUrl.Width,
        imageUrl: imageSetting.TitleImageUrl,
        imagePreviewUrl: `${ImageStorageDomain}/${imageSetting.Id}/preview.jpg`,
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

  function handleInputNumberCharacters() {
    document
      .querySelectorAll("[inputNumberCharacters]")
      .forEach((inputElement) => {
        inputElement.addEventListener("keypress", function (event) {
          const regexNumber = /[0-9]/;
          if (!regexNumber.test(event.key)) {
            event.preventDefault();
          }
        });

        inputElement.addEventListener("keyup", function (event) {
          if (inputElement.value) {
            let stringValue = inputElement.value || "";
            stringValue = stringValue.replace(/\./g, "");
            const numberValue = +stringValue;
            inputElement.value = numberValue.toLocaleString();
          }
        });
      });
  }

  function handleLoanCalculator() {
    const loanAmountElement = document.getElementById("loanAmount");
    const loanTimeElement = document.getElementById("loanTime");
    const realEstatePriceElement = document.getElementById("realEstatePrice");
    const interestRatePerYearElement = document.getElementById(
      "interestRatePerYear"
    );

    const mustPayFirstElement = document.getElementById("mustPayFirst");
    const rootPayElement = document.getElementById("rootPay");
    const interestPayElement = document.getElementById("interestPay");
    const payPerMonthElement = document.getElementById("payPerMonth");

    const donutChartElement = document.querySelector("#loanChart .donut");
    const mainLabelElement = document.querySelector(
      "#loanChart .donut__label__heading"
    );
    const subLabelElement = document.querySelector(
      "#loanChart .donut__label__sub"
    );

    function getNumberValue(inputElement) {
      let value = 0;
      try {
        if (inputElement.value) {
          let rawValue = inputElement.value;
          rawValue = +rawValue.replace(/\./g, "");
          if (!isNaN(rawValue)) {
            value = rawValue;
          }
        }
      } catch (e) {
        console.error("getNumberValue", e);
      }
      return value;
    }

    function readNumber(numberValue = 0) {
      let numberVal = numberValue;
      let subVal = "đồng";

      try {
        switch (true) {
          case numberValue > 999999999:
            {
              numberVal = (numberValue / 1000000000).toFixed(1);
              subVal = "tỷ";
            }
            break;
          case numberValue > 999999:
            {
              numberVal = (numberValue / 1000000).toFixed(1);
              subVal = "triệu";
            }
            break;
        }
      } catch (e) {
        console.error("readNumber", e);
      }

      return {
        numberVal,
        subVal,
      };
    }

    function calculatorResult() {
      const loanAmount = getNumberValue(loanAmountElement);
      const loanTime = getNumberValue(loanTimeElement);
      const realEstatePrice = getNumberValue(realEstatePriceElement);
      const interestRatePerYear = +(interestRatePerYearElement.value || "0");

      if (!loanAmount || !loanTime) {
        return;
      }

      const mustPayFirstAmount = realEstatePrice - loanAmount;
      const interestPayAmount = Math.ceil(
        (interestRatePerYear / 100) * loanAmount * loanTime
      );
      const payPerMonthAmount = Math.ceil(
        ((interestRatePerYear / 100) * loanAmount) / 12 +
          loanAmount / (loanTime * 12)
      );

      interestPayElement.innerText = interestPayAmount.toLocaleString();
      rootPayElement.innerText = loanAmount.toLocaleString();
      mustPayFirstElement.innerText = mustPayFirstAmount.toLocaleString();
      payPerMonthElement.innerText = "~" + payPerMonthAmount.toLocaleString();

      const totalPay = mustPayFirstAmount + interestPayAmount + loanAmount;
      const { numberVal, subVal } = readNumber(totalPay);
      const chartSetting = `--first: ${
        mustPayFirstAmount / totalPay
      }; --second: ${interestPayAmount / totalPay}; --third: ${
        loanAmount / totalPay
      };`;

      donutChartElement.setAttribute("style", chartSetting);
      mainLabelElement.innerText = numberVal;
      subLabelElement.innerText = subVal;
    }

    loanAmountElement.addEventListener("blur", calculatorResult);
    loanTimeElement.addEventListener("blur", calculatorResult);
    interestRatePerYearElement.addEventListener("blur", calculatorResult);

    calculatorResult();
  }

  function onLoad() {
    updateCarouselIndex(1);

    $("#post-carousel").on("slide.bs.carousel", function (e) {
      const currentIndex = e.to + 1;
      updateCarouselIndex(currentIndex);
    });

    $(".bottom-navigation .col-3").on("click", handleSwitchNavActive);

    handleSwitchViewVR(true);

    handleLoanCalculator();

    handleInputNumberCharacters();
  }

  onLoad();
});
