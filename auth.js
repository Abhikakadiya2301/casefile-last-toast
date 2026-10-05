import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig, firebaseConfigured } from './firebase-config.js';

const css = document.createElement('link');
css.rel = 'stylesheet';
css.href = 'auth.css';
if (!document.querySelector('link[href="auth.css"]')) document.head.append(css);

const topbarStats = document.querySelector('.case-stats');
if (!topbarStats) throw new Error('CASEFILE auth could not find the top bar.');

topbarStats.insertAdjacentHTML('beforeend', `
  <div class="auth-control" id="authControl">
    <button class="auth-button" id="authOpenBtn" type="button">Sign in</button>
    <div class="auth-user auth-hidden" id="authUser">
      <div class="auth-avatar" id="authAvatar" aria-hidden="true">D</div>
      <div class="auth-user-copy">
        <strong id="authDisplayName">Detective</strong>
        <span id="authEmail"></span>
      </div>
      <button class="auth-signout" id="authSignOutBtn" type="button">Sign out</button>
    </div>
  </div>`);

document.body.insertAdjacentHTML('beforeend', `
  <dialog class="auth-modal" id="authModal">
    <button class="auth-modal-close" id="authModalClose" type="button" aria-label="Close">×</button>
    <div class="auth-modal-inner" id="authModalInner">
      <p class="eyebrow">CASEFILE ACCESS</p>
      <h3 id="authTitle">Welcome back, Detective</h3>
      <p class="auth-subtitle" id="authSubtitle">Sign in to your CASEFILE account.</p>
      <div class="auth-setup auth-hidden" id="authSetup">
        Authentication UI is ready, but Firebase is not connected yet. Add your Firebase Web App configuration to <code>firebase-config.js</code>.
      </div>
      <div class="auth-tabs" role="tablist" aria-label="Account access">
        <button class="auth-tab active" id="authSignInTab" type="button" role="tab" aria-selected="true">Sign in</button>
        <button class="auth-tab" id="authSignUpTab" type="button" role="tab" aria-selected="false">Create account</button>
      </div>
      <form class="auth-form" id="authForm">
        <label class="auth-name-field">
          <span>Detective name</span>
          <input id="authName" type="text" autocomplete="name" maxlength="40" placeholder="Your name">
        </label>
        <label>
          <span>Email</span>
          <input id="authEmailInput" type="email" autocomplete="email" required placeholder="detective@example.com">
        </label>
        <label>
          <span>Password</span>
          <input id="authPassword" type="password" autocomplete="current-password" minlength="6" required placeholder="At least 6 characters">
        </label>
        <button class="auth-submit" id="authSubmit" type="submit">Sign in</button>
        <button class="auth-link" id="authResetPassword" type="button">Forgot password?</button>
      </form>
      <p class="auth-message" id="authMessage" aria-live="polite"></p>
      <div class="auth-divider"></div>
      <p class="auth-note">Your password is handled by Firebase Authentication and is never stored in the CASEFILE game code.</p>
    </div>
  </dialog>`);

const $ = selector => document.querySelector(selector);
const modal = $('#authModal');
const form = $('#authForm');
const message = $('#authMessage');
const signInTab = $('#authSignInTab');
const signUpTab = $('#authSignUpTab');
const submit = $('#authSubmit');
const passwordInput = $('#authPassword');
let mode = 'signin';
let auth = null;

function setMessage(text = '', type = '') {
  message.textContent = text;
  message.className = `auth-message${type ? ` ${type}` : ''}`;
}

function setMode(nextMode) {
  mode = nextMode;
  const signup = mode === 'signup';
  $('#authModalInner').classList.toggle('auth-mode-signup', signup);
  signInTab.classList.toggle('active', !signup);
  signUpTab.classList.toggle('active', signup);
  signInTab.setAttribute('aria-selected', String(!signup));
  signUpTab.setAttribute('aria-selected', String(signup));
  submit.textContent = signup ? 'Create account' : 'Sign in';
  $('#authTitle').textContent = signup ? 'Join the investigation' : 'Welcome back, Detective';
  $('#authSubtitle').textContent = signup ? 'Create an account to identify your detective profile.' : 'Sign in to your CASEFILE account.';
  passwordInput.autocomplete = signup ? 'new-password' : 'current-password';
  $('#authResetPassword').classList.toggle('auth-hidden', signup);
  setMessage();
}

function friendlyError(error) {
  const code = error?.code || '';
  const messages = {
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/user-not-found': 'No account was found for that email.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Use a stronger password with at least 6 characters.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.'
  };
  return messages[code] || 'Something went wrong. Please try again.';
}

function initials(user) {
  const value = user?.displayName || user?.email || 'Detective';
  const parts = value.replace(/@.*/, '').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'D';
}

function renderUser(user) {
  const signedIn = Boolean(user);
  $('#authOpenBtn').classList.toggle('auth-hidden', signedIn);
  $('#authUser').classList.toggle('auth-hidden', !signedIn);
  if (!signedIn) return;
  $('#authAvatar').textContent = initials(user);
  $('#authDisplayName').textContent = user.displayName || user.email?.split('@')[0] || 'Detective';
  $('#authEmail').textContent = user.email || '';
}

$('#authOpenBtn').addEventListener('click', () => {
  setMode('signin');
  if (!firebaseConfigured) $('#authSetup').classList.remove('auth-hidden');
  modal.showModal();
  setTimeout(() => $('#authEmailInput').focus(), 50);
});

$('#authModalClose').addEventListener('click', () => modal.close());
modal.addEventListener('click', event => {
  if (event.target === modal) modal.close();
});
signInTab.addEventListener('click', () => setMode('signin'));
signUpTab.addEventListener('click', () => setMode('signup'));

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!firebaseConfigured || !auth) {
    setMessage('Firebase must be connected before accounts can be created or signed in.', 'error');
    return;
  }

  const email = $('#authEmailInput').value.trim();
  const password = passwordInput.value;
  const name = $('#authName').value.trim();
  submit.disabled = true;
  setMessage(mode === 'signup' ? 'Creating account…' : 'Signing in…');

  try {
    if (mode === 'signup') {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(credential.user, { displayName: name });
      renderUser(credential.user);
      setMessage('Account created. Welcome to the case.', 'success');
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Signed in.', 'success');
    }
    form.reset();
    setTimeout(() => modal.close(), 450);
  } catch (error) {
    setMessage(friendlyError(error), 'error');
  } finally {
    submit.disabled = false;
  }
});

$('#authResetPassword').addEventListener('click', async () => {
  const email = $('#authEmailInput').value.trim();
  if (!firebaseConfigured || !auth) {
    setMessage('Connect Firebase before using password reset.', 'error');
    return;
  }
  if (!email) {
    setMessage('Enter your email first, then choose “Forgot password?”.', 'error');
    $('#authEmailInput').focus();
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    setMessage('Password reset email sent.', 'success');
  } catch (error) {
    setMessage(friendlyError(error), 'error');
  }
});

$('#authSignOutBtn').addEventListener('click', async () => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error('CASEFILE sign out failed:', error);
  }
});

if (firebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    await setPersistence(auth, browserLocalPersistence);
    onAuthStateChanged(auth, user => {
      renderUser(user);
      window.dispatchEvent(new CustomEvent('casefile-auth-change', { detail: { user } }));
    });
  } catch (error) {
    console.error('CASEFILE Firebase initialization failed:', error);
    $('#authSetup').classList.remove('auth-hidden');
  }
} else {
  renderUser(null);
}
