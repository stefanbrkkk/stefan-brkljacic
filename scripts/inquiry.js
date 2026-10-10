export function initInquiry() {
  const dialog = document.getElementById('projectDialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const preview = document.getElementById('projectMessagePreview');
  const mail = document.getElementById('projectEmail');
  const gmail = document.getElementById('projectGmail');
  const notice = document.getElementById('projectDraftNotice');
  const copyStatus = document.getElementById('projectCopyStatus');
  const recovery = document.getElementById('projectCopyRecovery');
  const fallback = document.getElementById('projectCopyFallback');
  const fields = {
    goal: document.getElementById('projectGoal'),
    currentUrl: document.getElementById('projectCurrentUrl'),
    timing: document.getElementById('projectTiming')
  };
  const typeButtons = [...dialog.querySelectorAll('[data-project-type]')];
  const email = 'stefanbrkk@gmail.com';
  const language = () => document.documentElement.lang === 'sr' ? 'sr' : 'en';
  let currentType = 'qa';
  let edited = false;
  let lastOpener = null;
  const messages = {
    en: {
      website: {subject:'Website project inquiry', body:"Hi Stefan,\n\nI want to get in touch about a website project. I’d like to discuss what I need, the scope, and pricing.\n\nBest,"},
      prototype:{subject:'Product prototype inquiry', body:"Hi Stefan,\n\nI want to get in touch about a product prototype. I have an idea I’d like to turn into an interactive web demo.\n\nBest,"},
      polish:{subject:'Frontend polish & QA inquiry', body:"Hi Stefan,\n\nI want to get in touch about polishing an existing frontend. I’d like help with responsive UI, accessibility, motion, and QA.\n\nBest,"},
      qa:{subject:'Quick project question', body:"Hi Stefan,\n\nI have a quick question about a website or product project and would like your input.\n\nBest,"}
    },
    sr: {
      website:{subject:'Upit za izradu web sajta', body:"Zdravo Stefane,\n\nŽelim da se javim u vezi sa web sajtom. Voleo/la bih da razgovaramo o tome šta mi je potrebno, obimu projekta i ceni.\n\nPozdrav,"},
      prototype:{subject:'Upit za prototip proizvoda', body:"Zdravo Stefane,\n\nŽelim da se javim u vezi sa prototipom proizvoda. Imam ideju koju bih voleo/la da pretvorimo u interaktivnu web demonstraciju.\n\nPozdrav,"},
      polish:{subject:'Upit za dorade interfejsa i QA', body:"Zdravo Stefane,\n\nŽelim da se javim u vezi sa doterivanjem postojećeg frontenda. Potrebna mi je pomoć oko prikaza na različitim ekranima, pristupačnosti, animacija i QA-a.\n\nPozdrav,"},
      qa:{subject:'Kratko pitanje o projektu', body:"Zdravo Stefane,\n\nImam kratko pitanje u vezi sa web sajtom ili projektom proizvoda i voleo/la bih tvoje mišljenje.\n\nPozdrav,"}
    }
  };

  /** Build outbound drafts without sending or storing visitor data. */
  const buildInquiry = ({type, language, goal, currentUrl, timing, message}) => {
    const template = messages[language][type || 'qa'];
    const labels = language === 'sr' ? ['Cilj projekta', 'Postojeći sajt', 'Željeni rok'] : ['Project goal', 'Current website', 'Desired timing'];
    const context = [goal, currentUrl, timing].map((value, i) => value.trim() ? `${labels[i]}: ${value}` : '').filter(Boolean).join('\n');
    const body = (message ?? template.body) + (context ? `\n\n${context}` : '');
    const subject = template.subject;
    return { subject, body,
      mailto: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    };
  };
  const currentInquiry = () => buildInquiry({
    type: currentType,
    language: language(),
    message: preview.value,
    goal: fields.goal.value,
    currentUrl: fields.currentUrl.value,
    timing: fields.timing.value
  });
  const updateLinks = () => {
    const draft = currentInquiry();
    mail.href = draft.mailto;
    gmail.href = draft.gmail;
    copyStatus.textContent = '';
    recovery.hidden = true;
  };
  const keepEditedNotice = () => {
    notice.textContent = language() === 'sr'
      ? 'Sačuvana je tvoja uređena poruka. Resetuj nacrt ako želiš novi šablon za izabranu vrstu i jezik.'
      : 'Your edited message is kept. Reset draft to use a new template for the selected type and language.';
  };
  const selectType = type => {
    if (!messages[language()][type]) return;
    currentType = type;
    typeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.projectType === type)));
    if (edited) keepEditedNotice();
    else {
      preview.value = messages[language()][type].body;
      notice.textContent = '';
    }
    updateLinks();
  };
  const openInquiry = ({opener, type = null}) => {
    lastOpener = opener;
    if (type) selectType(type);
    else selectType(currentType);
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('.project-dialog-inner').scrollTop = 0;
    dialog.querySelector('#projectDialogClose').focus();
  };
  const closeInquiry = () => {
    if (dialog.open) dialog.close();
  };
  dialog.addEventListener('close', () => lastOpener?.focus({preventScroll: true}));
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeInquiry();
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) closeInquiry();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button,a[href],input,textarea')].filter(el => !el.disabled && el.getClientRects().length);
    // Safari's default Tab policy skips links. Explicit cycling keeps every
    // contact channel reachable and prevents focus from escaping to browser UI.
    if (!controls.length) return;
    event.preventDefault();
    const current = controls.indexOf(document.activeElement);
    const next = (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
    controls[next].focus();
  });
  document.getElementById('projectDialogClose').addEventListener('click', closeInquiry);
  document.querySelectorAll('[data-inquiry]').forEach(opener => {
    opener.addEventListener('click', event => {
      if (!document.documentElement.classList.contains('inquiry-ready')) return; // Ordinary email fallback until setup succeeds.
      event.preventDefault();
      openInquiry({opener, type: opener.dataset.inquiryType || null});
    });
  });
  typeButtons.forEach(button => button.addEventListener('click', () => selectType(button.dataset.projectType)));
  preview.addEventListener('input', () => {
    edited = true;
    updateLinks();
  });
  Object.values(fields).forEach(field => field.addEventListener('input', updateLinks));
  document.getElementById('projectMessageReset').addEventListener('click', () => {
    edited = false;
    selectType(currentType);
  });
  document.getElementById('projectDialogLanguage').addEventListener('click', () => document.querySelector('.lang-switch').click());
  new MutationObserver(() => selectType(currentType)).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});

  /** Use the browser clipboard first; the selectable fallback belongs inside the active modal. */
  const copyMessage = async text => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) { /* Try the legacy API inside the modal before offering manual copy. */ }
    fallback.value = text;
    recovery.hidden = false;
    fallback.focus();
    fallback.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (_) { /* Optional browser capability; preserve the visible fallback. */ }
    return copied;
  };
  document.getElementById('projectCopyMessage').addEventListener('click', async () => {
    const copied = await copyMessage(currentInquiry().body);
    if (copied) {
      recovery.hidden = true;
      document.getElementById('projectCopyMessage').focus();
    }
    copyStatus.textContent = copied
      ? (language() === 'sr' ? 'Poruka kopirana ✓' : 'Message copied ✓')
      : (language() === 'sr' ? 'Kopiranje nije uspelo. Ručno kopiraj označenu poruku ispod ili otvori imejl nacrt.' : 'Could not copy. Copy the selected message below manually, or open an email draft.');
  });
  // Commit inquiry state only after all handlers are installed.
  selectType(currentType);
  document.querySelectorAll('[data-inquiry]').forEach(opener => {
    opener.setAttribute('aria-haspopup', 'dialog');
    opener.setAttribute('aria-controls', 'projectDialog');
  });
  document.documentElement.classList.add('inquiry-ready');
  document.querySelectorAll('.faq-item').forEach(item => item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq-item[open]').forEach(other => {
      if (other !== item) other.removeAttribute('open');
    });
  }));
}
