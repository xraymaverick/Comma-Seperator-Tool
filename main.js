// Elements
const dom = {
  input: document.getElementById('input-text'),
  output: document.getElementById('output-text'),
  lineNumbers: document.getElementById('line-numbers'),
  lineCount: document.getElementById('line-count'),
  radios: document.querySelectorAll('input[name="delimiter"]'),
  customInput: document.getElementById('custom-delimiter'),
  btnCopy: document.getElementById('btn-copy'),
  btnPaste: document.getElementById('btn-paste'),
  btnClear: document.getElementById('btn-clear'),
  btnReverse: document.getElementById('btn-reverse'),
  notification: document.getElementById('notification')
};

// State
let state = {
  delimiter: ',',
  customValue: ''
};

// Core Logic
function getDelimiter() {
  if (state.delimiter === 'custom') {
    return state.customValue || ' '; // Default to space if empty custom
  }
  if (state.delimiter === 'space') return ' '; // Using value=' ' in HTML actually maps to space
  // Map value keywords if needed, but HTML has correct values
  if (state.delimiter === '\\n') return '\n';
  return state.delimiter;
}

function updateLineNumbers() {
  const lines = dom.input.value.split('\n');
  const count = lines.length;

  // Update badge
  dom.lineCount.innerText = `${count} ${count === 1 ? 'item' : 'items'}`;

  // Update side numbers
  let numbersHtml = '';
  for (let i = 1; i <= count; i++) {
    numbersHtml += i + '<br>';
  }
  dom.lineNumbers.innerHTML = numbersHtml;
}

function processText() {
  updateLineNumbers();
  const raw = dom.input.value;
  if (!raw) {
    dom.output.value = '';
    return;
  }

  // 1. Split by new lines (and filter out empty lines to avoid trailing commas)
  // Also handle mixed separators? For now, assume column input (newlines).
  // A robust split handles newlines (CRLF/LF) and maybe user wants input to be comma separated?
  // Let's assume input is split by newline OR by the *target* delimiter if we want to toggle back?
  // Standard behavior: text.split(/\r?\n/).filter(line => line.trim() !== '')

  const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0);

  // 2. Join
  const sep = getDelimiter();
  const result = lines.join(sep);

  dom.output.value = result;
}

// Event Listeners
dom.input.addEventListener('input', processText);

dom.radios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    state.delimiter = e.target.value;

    // Toggle Custom Input visibility
    if (state.delimiter === 'custom') {
      dom.customInput.classList.remove('hidden');
      dom.customInput.focus();
    } else {
      dom.customInput.classList.add('hidden');
    }

    processText();
  });
});

dom.customInput.addEventListener('input', (e) => {
  state.customValue = e.target.value;
  processText();
});

dom.btnPaste.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    dom.input.value = text;
    processText();
  } catch (err) {
    console.error('Failed to read clipboard', err);
    // Fallback? Alert user?
    alert('Could not paste from clipboard. Please paste manually.');
  }
});

dom.btnClear.addEventListener('click', () => {
  dom.input.value = '';
  dom.output.value = '';
  dom.input.focus();
});

dom.btnReverse.addEventListener('click', () => {
  const rawOutput = dom.output.value;
  if (!rawOutput) return;

  const sep = getDelimiter();
  // Split result back by current delimiter and join with newlines
  // Escape delimiter for regex if it's special, but for single chars it's mostly fine
  // Or just use split(sep) for simple string matching
  const items = rawOutput.split(sep).map(s => s.trim()).filter(s => s.length > 0);
  dom.input.value = items.join('\n');
  processText();
});

dom.btnCopy.addEventListener('click', () => {
  if (!dom.output.value) return;

  dom.output.select();
  dom.output.setSelectionRange(0, 99999); // Mobile

  navigator.clipboard.writeText(dom.output.value).then(() => {
    showNotification();
  }).catch(err => {
    console.error('Failed to copy', err);
  });
});

// UI Helpers
function showNotification() {
  dom.notification.classList.add('show');
  setTimeout(() => {
    dom.notification.classList.remove('show');
  }, 2000);
}

// Keep line numbers scrolled with textarea
dom.input.addEventListener('scroll', () => {
  dom.lineNumbers.scrollTop = dom.input.scrollTop;
});

// Initial Run (in case browser restores value)
processText();
