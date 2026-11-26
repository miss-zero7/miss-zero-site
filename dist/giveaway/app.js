'use strict';

const handle = 'MISSZERO_NFT';
const postId = '2124765886305161381';
const profileUrl = `https://x.com/${handle}`;
const postUrl = `${profileUrl}/status/${postId}`;
const quoteDrafts = [
  'I really want a PFP from @MISSZERO_NFT. ☆',
  'Waiting for the @MISSZERO_NFT results. Fingers crossed!',
  'Already wondering which avatar I’d get from @MISSZERO_NFT.',
  'Manifesting a WL spot for @MISSZERO_NFT. ☆',
  'I can already picture my new PFP from @MISSZERO_NFT.',
  'Here for the retro anime vibes. Hope I get a spot for @MISSZERO_NFT!',
  'Count me in for the @MISSZERO_NFT giveaway. Now we wait.',
  'Hoping @MISSZERO_NFT has an avatar with my name on it.',
  'Which @MISSZERO_NFT avatar would you pick? I’m still deciding.',
  'Checking that @MISSZERO_NFT inbox for good news. ☆',
];
const missions = [
  { id: 'follow', name: `Follow @${handle} on X.`, url: `https://x.com/intent/follow?screen_name=${handle}` },
  { id: 'notifications', name: `Open @${handle} and tap the notification bell.`, url: profileUrl },
  { id: 'like', name: 'Like the post on X.', url: `https://x.com/intent/like?tweet_id=${postId}` },
  { id: 'comment', name: 'Reply to the post.', url: `https://x.com/intent/tweet?in_reply_to=${postId}`, proof: 'Comment link' },
  { id: 'quote', name: 'Open a draft in X and share it with the original post linked.', proof: 'Your post link' },
  { id: 'repost', name: 'Repost the post.', url: `https://x.com/intent/retweet?tweet_id=${postId}` },
];
const delayMs = 5000;
const storageKey = 'miss-zero-giveaway-demo-v2';
const walletApi = document.querySelector('meta[name="wallet-api"]').content;
const demoTask = missions.find(task => task.id === new URLSearchParams(location.search).get('demo-task'));

if (demoTask) {
  document.querySelector('#giveaway').hidden = true;
  document.querySelector('#destination').hidden = false;
  document.querySelector('#destination-title').textContent = demoTask.name;
  document.title = 'MISS ZERO | Test link';
} else {
  setupConversation();
}

function loadState() {
  try {
    const current = JSON.parse(sessionStorage.getItem(storageKey));
    if (current?.tasks) return current;
    const previous = JSON.parse(sessionStorage.getItem('miss-zero-giveaway-demo-v1'));
    if (previous?.opened && previous.tasks) {
      return {
        phase: Object.keys(previous.tasks).length ? 'tasks' : 'invited',
        tasks: previous.tasks,
      };
    }
  } catch {
    // The conversation also runs without storage.
  }
  return { phase: 'unread', tasks: {} };
}

function parsePostLink(value) {
  try {
    const url = new URL(value.trim());
    const post = url.pathname.match(/^\/([a-z0-9_]{1,15})\/status\/(\d+)\/?$/i);
    if (url.protocol === 'https:' && !url.username && !url.password && !url.port &&
        /^(?:(?:www|mobile)\.)?(?:x\.com|twitter\.com)$/i.test(url.hostname) && post) {
      const [, handle, id] = post;
      return { handle: handle.toLowerCase(), url: `${url.origin}/${handle}/status/${id}` };
    }
  } catch {
    // The user can correct the link in the form.
  }
  return null;
}

function quoteDraftUrl() {
  const draft = quoteDrafts[Math.floor(Math.random() * quoteDrafts.length)];
  const params = new URLSearchParams({ text: `${draft}\n\n${postUrl}` });
  return `https://x.com/intent/tweet?${params}`;
}

function setupConversation() {
  const unread = document.querySelector('#unread');
  const conversation = document.querySelector('#conversation');
  const read = document.querySelector('#read');
  const join = document.querySelector('#join');
  const progress = document.querySelector('#progress');
  const thread = document.querySelector('#thread');
  const taskControls = document.querySelector('#task-controls');
  const taskProof = document.querySelector('#task-proof');
  const proof = document.querySelector('#proof');
  const proofLabel = document.querySelector('#proof-label');
  const proofError = document.querySelector('#proof-error');
  const replyForm = document.querySelector('#reply-form');
  const reply = document.querySelector('#reply');
  const replyLabel = document.querySelector('#reply-label');
  const replyPrefix = document.querySelector('#reply-prefix');
  const replyError = document.querySelector('#reply-error');
  const sendReply = replyForm.querySelector('button[type="submit"]');
  const open = document.querySelector('#open-task');
  const check = document.querySelector('#check');
  const countdown = document.querySelector('#countdown');
  const checkStatus = document.querySelector('#check-status');
  const controls = document.querySelector('.controls');
  const state = loadState();
  let active;
  let replyStep;
  let timer;

  if (walletApi) {
    document.querySelector('#storage-note').textContent =
      'Only your public wallet address is submitted. Replies and progress stay in this tab. X actions are self-reported.';
  }

  function save() {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Keep the current state in memory.
    }
  }

  function addMessage(text, kind, animate = false) {
    const message = document.createElement('p');
    message.className = `bubble ${kind}${animate ? ' arrived' : ''}`;
    const speaker = document.createElement('span');
    speaker.className = 'sr-only';
    speaker.textContent = kind === 'reply' ? 'You: ' : 'MISS ZERO: ';
    message.append(speaker, text);
    thread.append(message);
    return message;
  }

  function scrollToLatest() {
    thread.scrollTop = thread.scrollHeight;
  }

  function taskIsDone(mission) {
    const task = state.tasks[mission.id];
    if (!task?.done) return false;
    if (!mission.proof) return true;
    const post = parsePostLink(task.link || '');
    return Boolean(post && post.handle === state.username?.toLowerCase());
  }

  function setProgress() {
    const count = missions.filter(taskIsDone).length;
    progress.textContent = `${count}/${missions.length}`;
    progress.setAttribute('aria-label', `${count} of ${missions.length} tasks marked`);
  }

  function showInvitation(focus = false) {
    unread.hidden = true;
    conversation.hidden = false;
    addMessage('Hey. Want a spot on the list?', 'received', focus);
    if (focus) join.focus();
  }

  function setError(input, error, message = '') {
    error.textContent = message;
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      input.focus();
    } else {
      input.removeAttribute('aria-invalid');
    }
  }

  function askForReply(step, focus) {
    replyStep = step;
    const wallet = step === 'wallet';
    addMessage(wallet ? 'That’s all six. Send your public EVM wallet address.' : 'What’s your X username?', 'received', focus);
    replyLabel.textContent = wallet ? 'Public EVM wallet address' : 'X username';
    replyPrefix.hidden = wallet;
    reply.placeholder = wallet ? '0x…' : 'username';
    reply.value = wallet ? state.wallet || '' : '';
    setError(reply, replyError);
    replyForm.hidden = false;
    scrollToLatest();
    if (focus) reply.focus();
  }

  function finish(focus) {
    controls.hidden = true;
    const ending = addMessage(walletApi ? 'Got it. Your wallet address is saved.' : 'Got it. Your demo is complete.', 'received', focus);
    scrollToLatest();
    if (focus) {
      ending.tabIndex = -1;
      ending.focus({ preventScroll: true });
    }
  }

  function showNextTask(focus = false) {
    setProgress();
    if (!state.username) {
      askForReply('username', focus);
      return;
    }
    active = missions.find(mission => !taskIsDone(mission));
    if (!active) {
      clearTimeout(timer);
      taskControls.hidden = true;
      const complete = state.wallet && (!walletApi || state.walletSaved);
      askForReply('wallet', focus && !complete);
      if (complete) {
        replyForm.hidden = true;
        addMessage(state.wallet, 'reply');
        finish(focus);
      }
      return;
    }

    addMessage(active.proof ? `${active.name} Paste your post link before you check.` : active.name, 'received', focus);
    taskProof.hidden = !active.proof;
    proof.value = '';
    proof.placeholder = active.proof || '';
    proofLabel.textContent = active.proof || 'Post link';
    setError(proof, proofError);
    open.href = active.id === 'quote' ? quoteDraftUrl() : active.url;
    open.setAttribute('aria-label', 'Open on X in a new tab');
    taskControls.hidden = false;
    refreshTimer();
    scrollToLatest();
    if (focus) open.focus();
  }

  function refreshTimer() {
    clearTimeout(timer);
    if (!active) return;
    const task = state.tasks[active.id];
    const remaining = task ? Math.max(0, task.readyAt - Date.now()) : 0;
    const wasDisabled = check.disabled;
    check.disabled = !task || remaining > 0;
    if (!task) {
      countdown.textContent = 'Open the task to start.';
      checkStatus.textContent = '';
    } else if (remaining > 0) {
      const seconds = String(Math.ceil(remaining / 1000)).padStart(2, '0');
      countdown.textContent = `Check in ${seconds}s`;
      timer = setTimeout(refreshTimer, (remaining - 1) % 1000 + 1);
    } else {
      countdown.textContent = 'Ready to check.';
      if (wasDisabled) checkStatus.textContent = 'Check is now available.';
    }
  }

  function openTask() {
    if (!active) return;
    if (active.id === 'quote') open.href = quoteDraftUrl();
    if (state.tasks[active.id]) return;
    state.tasks[active.id] = { readyAt: Date.now() + delayMs };
    save();
    refreshTimer();
  }

  read.addEventListener('click', () => {
    state.phase = 'invited';
    save();
    showInvitation(true);
  });
  join.addEventListener('click', () => {
    state.phase = 'tasks';
    save();
    join.hidden = true;
    addMessage('I’m in.', 'reply', true);
    showNextTask(true);
  });
  open.addEventListener('click', openTask);
  open.addEventListener('auxclick', event => {
    if (event.button === 1) openTask();
  });
  replyForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (sendReply.disabled) return;
    const value = reply.value.trim();
    const wallet = replyStep === 'wallet';
    const answer = wallet ? value : value.replace(/^@/, '');
    if (!(wallet ? /^0x[0-9a-f]{40}$/i : /^[a-z0-9_]{1,15}$/i).test(answer)) {
      setError(reply, replyError, wallet ? 'Use 0x followed by 40 hex characters.' : 'Use 1–15 letters, numbers or underscores.');
      return;
    }
    if (wallet && walletApi) {
      sendReply.disabled = true;
      reply.readOnly = true;
      sendReply.textContent = 'Sending…';
      try {
        const response = await fetch(walletApi, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: answer }),
          credentials: 'omit',
          signal: AbortSignal.timeout(12000),
        });
        if (response.status !== 204) throw new Error('Wallet not saved');
        state.walletSaved = true;
      } catch {
        setError(reply, replyError, 'Couldn’t save your wallet. Try sending it again.');
        return;
      } finally {
        sendReply.disabled = false;
        reply.readOnly = false;
        sendReply.textContent = 'Send';
      }
    }
    state[replyStep] = answer;
    save();
    replyForm.hidden = true;
    addMessage(wallet ? answer : `@${answer}`, 'reply', true);
    if (wallet) finish(true);
    else showNextTask(true);
  });
  reply.addEventListener('input', () => setError(reply, replyError));
  proof.addEventListener('input', () => setError(proof, proofError));
  taskControls.addEventListener('submit', event => {
    event.preventDefault();
    const task = active && state.tasks[active.id];
    if (!task || taskIsDone(active) || Date.now() < task.readyAt) return;
    if (active.proof) {
      const post = parsePostLink(proof.value);
      if (!post) {
        setError(proof, proofError, 'Use an X post link with your username.');
        return;
      }
      if (post.handle !== state.username.toLowerCase()) {
        setError(proof, proofError, `Use a link from @${state.username}.`);
        return;
      }
      task.link = post.url;
      addMessage(post.url, 'reply', true);
    }
    task.done = true;
    save();
    addMessage('✓ Done', 'reply', true);
    showNextTask(true);
  });
  document.addEventListener('visibilitychange', refreshTimer);
  window.addEventListener('resize', scrollToLatest);

  if (state.phase !== 'unread') showInvitation();
  if (state.phase === 'tasks') {
    join.hidden = true;
    addMessage('I’m in.', 'reply');
    if (state.username) {
      addMessage('What’s your X username?', 'received');
      addMessage(`@${state.username}`, 'reply');
      for (const mission of missions.filter(taskIsDone)) {
        addMessage(mission.name, 'received');
        if (mission.proof) addMessage(state.tasks[mission.id].link, 'reply');
        addMessage('✓ Done', 'reply');
      }
    }
    showNextTask();
  }
}
