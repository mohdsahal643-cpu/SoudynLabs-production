(() => {
  'use strict';
  const sendFailureMessage = [
    'The message did not send. Check your connection and try again,',
    'or email hello@soudynlabs.com. [CONFIRM]'
  ].join(' ');

  document.querySelectorAll('form[data-form]').forEach(form => {
    const submitButton = form.querySelector('button[type="submit"]');
    const formStatus = form.querySelector('.form-error');
    const formFields = [...form.querySelectorAll('.field input, .field select, .field textarea')];
    const configuredEndpoint = window.SOUDYN?.formEndpoint;

    if (configuredEndpoint) form.action = configuredEndpoint;
    // Without JavaScript the staging submit stays disabled. A real endpoint
    // must also be written to the static action before production.
    submitButton.disabled = false;
    form.noValidate = true;

    function messageForInvalidField(field) {
      if (!field.checkValidity()) {
        if (field.type === 'email') return 'Enter a valid email address, for example name@company.com.';
        if (field.name === 'name') return 'Enter your name.';
        if (field.name === 'message') return 'Tell us a little about what you need.';
        return 'Complete this field.';
      }

      return '';
    }

    function validateField(field) {
      const message = messageForInvalidField(field);
      const errorMessage = document.getElementById(`${field.id}-error`);
      errorMessage.textContent = message;

      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
      return !message;
    }

    formFields.forEach(field => field.addEventListener('input', () => {
      if (field.hasAttribute('aria-invalid')) validateField(field);
    }));

    let sending = false;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending) return;

      formStatus.textContent = '';
      formFields
        .filter(field => field.type !== 'email')
        .forEach(field => { field.value = field.value.trim(); });

      const invalidFields = formFields.filter(field => !validateField(field));
      if (invalidFields.length) {
        invalidFields[0].focus();
        return;
      }

      if (form.elements.company_website.value) {
        formStatus.textContent = sendFailureMessage;
        return;
      }

      const endpoint = window.SOUDYN?.formEndpoint;
      if (!endpoint) {
        formStatus.textContent = [
          '[CONFIRM form provider] This staging form is not connected yet.',
          'Please use the email link to contact us.'
        ].join(' ');
        return;
      }

      const originalButtonText = submitButton.textContent;
      sending = true;
      submitButton.disabled = true;
      submitButton.textContent = 'Sending';
      form.setAttribute('aria-busy', 'true');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const payload = Object.fromEntries(new FormData(form));
        const response = await fetch(endpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload), signal: controller.signal
        });
        if (!response.ok) throw new Error('Send failed');
        const result = await response.json();
        if (result.success === false || result.error || result.errors) throw new Error('Send rejected');
        const block = document.createElement('div');
        block.className = 'form-success';
        block.tabIndex = -1;
        const title = document.createElement('h3');
        title.textContent = form.dataset.form === 'contact' ? 'Message sent' : form.dataset.success;
        block.append(title);
        if (form.dataset.form === 'contact') {
          const body = document.createElement('p'); body.textContent = form.dataset.success; block.append(body);
        }
        form.replaceWith(block);
        block.focus();
        document.dispatchEvent(new CustomEvent('soudyn:analytics', {detail: {name: 'form_submit_' + form.dataset.form}}));
      } catch {
        formStatus.textContent = sendFailureMessage;
      } finally {
        clearTimeout(timeout);
        sending = false;
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        form.removeAttribute('aria-busy');
      }
    });
  });
})();
