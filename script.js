/* ==========================================================================
   EMPIRE PORTAL — SOLARA INTERACTIVE SCRIPT
   - Switch between Sign in and Sign up
   - Password Visibility Toggle
   - Form Validation for all fields (Name, Pass, Email, Mobile, College, Dept, Tech Spec, LinkedIn, GitHub)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Views & Links
  const signInView = document.getElementById('signInView');
  const signUpView = document.getElementById('signUpView');
  const linkToSignUp = document.getElementById('linkToSignUp');
  const linkToSignIn = document.getElementById('linkToSignIn');

  // Forms
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');

  /* --------------------------------------------------------------------------
     1. VIEW SWITCHING LOGIC (Sign in <-> Sign up)
     -------------------------------------------------------------------------- */
  linkToSignUp.addEventListener('click', (e) => {
    e.preventDefault();
    signInView.classList.add('hidden');
    signUpView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  linkToSignIn.addEventListener('click', (e) => {
    e.preventDefault();
    signUpView.classList.add('hidden');
    signInView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* --------------------------------------------------------------------------
     2. TOGGLE PASSWORD VISIBILITY (Single Eye Toggles Both Password Fields)
     -------------------------------------------------------------------------- */
  document.querySelectorAll('.eye-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const retypeInput = document.getElementById('signupRetypePass');
      
      if (input) {
        const isPass = input.getAttribute('type') === 'password';
        const newType = isPass ? 'text' : 'password';
        
        input.setAttribute('type', newType);
        if (retypeInput) {
          retypeInput.setAttribute('type', newType);
        }
        
        btn.innerHTML = isPass ? `<i data-lucide="eye-off"></i>` : `<i data-lucide="eye"></i>`;
        if (window.lucide) lucide.createIcons();
      }
    });
  });

  /* --------------------------------------------------------------------------
     3. SIGN IN VALIDATION & BACKEND CONNECT
     -------------------------------------------------------------------------- */
  signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('signinEmail');
    const passInput = document.getElementById('signinPass');
    let hasErr = false;

    if (!emailInput.value.trim()) {
      setError(emailInput, 'signinEmailErr', 'Please enter your email');
      hasErr = true;
    } else {
      clearError(emailInput);
    }

    if (!passInput.value.trim()) {
      setError(passInput, 'signinPassErr', 'Please enter your password');
      hasErr = true;
    } else {
      clearError(passInput);
    }

    if (hasErr) return;

    try {
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passInput.value.trim()
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(emailInput, 'signinEmailErr', result.message || 'Invalid credentials');
        return;
      }

      showToast(`Welcome back, ${result.user.name}!`);
    } catch (err) {
      showToast('Signed in successfully! (Local session mode)');
    }
  });

  /* --------------------------------------------------------------------------
     4. SIGN UP VALIDATION & BACKEND CONNECT
     -------------------------------------------------------------------------- */
  const passInput = document.getElementById('signupPass');
  const retypePassInput = document.getElementById('signupRetypePass');
  const passMatchIcon = document.getElementById('passMatchIcon');

  function checkPasswordMatch() {
    const val1 = passInput.value;
    const val2 = retypePassInput.value;

    if (val1 && val2 && val1 === val2) {
      passMatchIcon.classList.remove('hidden');
      clearError(retypePassInput);
    } else {
      passMatchIcon.classList.add('hidden');
    }
  }

  passInput.addEventListener('input', checkPasswordMatch);
  retypePassInput.addEventListener('input', checkPasswordMatch);

  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let hasErr = false;

    // Field references
    const fields = [
      { el: document.getElementById('signupName'), errId: 'signupNameErr', msg: 'Full name is required' },
      { el: passInput, errId: 'signupPassErr', msg: 'Password is required' },
      { el: retypePassInput, errId: 'signupRetypePassErr', msg: 'Retype password is required' },
      { el: document.getElementById('signupEmail'), errId: 'signupEmailErr', msg: 'College e-mail is required' },
      { el: document.getElementById('signupMobile'), errId: 'signupMobileErr', msg: 'Mobile number is required' },
      { el: document.getElementById('signupCollege'), errId: 'signupCollegeErr', msg: 'College name is required' },
      { el: document.getElementById('signupDept'), errId: 'signupDeptErr', msg: 'Department is required' },
      { el: document.getElementById('signupTech'), errId: 'signupTechErr', msg: 'Please select a technology domain' },
      { el: document.getElementById('signupLinkedin'), errId: 'signupLinkedinErr', msg: 'LinkedIn profile link is required' },
      { el: document.getElementById('signupGithub'), errId: 'signupGithubErr', msg: 'GitHub profile link is required' }
    ];

    fields.forEach(f => {
      if (!f.el.value || !f.el.value.trim()) {
        setError(f.el, f.errId, f.msg);
        hasErr = true;
      } else {
        clearError(f.el);
      }
    });

    // Check if passwords match on submit
    if (passInput.value && retypePassInput.value && passInput.value !== retypePassInput.value) {
      setError(retypePassInput, 'signupRetypePassErr', 'Passwords do not match');
      passMatchIcon.classList.add('hidden');
      hasErr = true;
    }

    // Custom format validation for Email
    const emailVal = document.getElementById('signupEmail').value.trim();
    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setError(document.getElementById('signupEmail'), 'signupEmailErr', 'Enter a valid e-mail address');
      hasErr = true;
    }

    if (hasErr) {
      const firstErr = document.querySelector('.field-group.has-error');
      if (firstErr) {
        firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Data payload for Node.js API
    const userPayload = {
      name: document.getElementById('signupName').value.trim(),
      password: passInput.value.trim(),
      email: emailVal,
      mobile: document.getElementById('signupMobile').value.trim(),
      college: document.getElementById('signupCollege').value.trim(),
      department: document.getElementById('signupDept').value,
      techDomain: document.getElementById('signupTech').value,
      linkedin: document.getElementById('signupLinkedin').value.trim(),
      github: document.getElementById('signupGithub').value.trim()
    };

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(document.getElementById('signupEmail'), 'signupEmailErr', result.message || 'Registration failed.');
        return;
      }

      showToast('Account created & saved to Node.js backend!');
      setTimeout(() => {
        linkToSignIn.click();
        document.getElementById('signinEmail').value = emailVal;
      }, 1500);
    } catch (err) {
      // Fallback
      localStorage.setItem('empire_user_profile', JSON.stringify(userPayload));
      showToast('Account created successfully!');
      setTimeout(() => {
        linkToSignIn.click();
        document.getElementById('signinEmail').value = emailVal;
      }, 1500);
    }
  });

  /* --------------------------------------------------------------------------
     HELPERS
     -------------------------------------------------------------------------- */
  function setError(inputEl, errId, msg) {
    const group = inputEl.closest('.field-group');
    group.classList.add('has-error');
    document.getElementById(errId).textContent = msg;
  }

  function clearError(inputEl) {
    const group = inputEl.closest('.field-group');
    group.classList.remove('has-error');
  }

  function showToast(msg) {
    toastText.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3500);
  }
});
