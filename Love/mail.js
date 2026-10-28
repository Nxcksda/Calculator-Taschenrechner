(() => {
  'use strict';

  const MAIL = {
    accessKey: '6addf828-b3b8-4adc-bb97-06bac3920b84',

    subject: 'Du Glücklicher! 💖',
    fromName: 'Glückicher Mann',
  };

  const yes = document.getElementById('yes');
  const no = document.getElementById('no');
  const title = document.getElementById('title');
  if (!yes) return;

  let noTaps = 0;   // Wie oft wurde „Nein“ angetippt?
  let sent = false; // Mail wird nur einmal verschickt

  if (no) no.addEventListener('click', () => { noTaps++; });

  function buildMessage() {
    const device = window.matchMedia('(pointer: coarse)').matches ? 'Handy / Tablet' : 'PC';
    const time = new Date().toLocaleString('de-DE', { dateStyle: 'full', timeStyle: 'medium' });
    return [
      'Die Antwort lautet: JA! 💖',
      '',
      '',
      `Frage: ${title ? title.textContent : ''}`,
      'Die Antwort auf die Frage lautet: Ja',
      `Zeitpunkt: ${time}`,
      `Gerät: ${device}`,
      `Nein angetippt: ${noTaps}x`
    ].join('\n');
  }

  async function send() {
    if (sent) return;

    if (!MAIL.accessKey || MAIL.accessKey.startsWith('HIER_')) {
      console.warn('mail.js: Kein Access Key eingetragen – es wird keine Mail verschickt.');
      return;
    }
    sent = true;

    const body = JSON.stringify({
      access_key: MAIL.accessKey,
      subject: MAIL.subject,
      from_name: MAIL.fromName,
      message: buildMessage()
    });

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body,
          keepalive: true
        });
        const data = await res.json();
        if (data.success) return;
        console.warn('mail.js: Versand abgelehnt –', data.message);
        return; 
      } catch (err) {
        console.warn('mail.js: Netzwerkfehler –', err);
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }

  yes.addEventListener('click', send);
})();
