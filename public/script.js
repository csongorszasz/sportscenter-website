async function showAllPalyaDetails(palyaId, palyaDiv) {
  const response = await fetch(`/api/palyak/${palyaId}`);
  if (!response.ok) {
    throw new Error(`HTTP hiba: ${response.status}`);
  }
  const palya = await response.json();

  const createDetailElement = (key, value, additionalClassName = '') => {
    const p = document.createElement('p');
    const keySpan = document.createElement('span');
    keySpan.className = `detail-key ${additionalClassName}`;
    keySpan.textContent = key;

    const valueSpan = document.createElement('span');
    valueSpan.className = `detail-value ${additionalClassName}`;
    valueSpan.textContent = value;

    p.appendChild(keySpan);
    p.appendChild(valueSpan);
    return p;
  };

  palyaDiv.innerHTML = '';
  palyaDiv.appendChild(createDetailElement('Pálya ', palya.ID, 'important-detail'));
  palyaDiv.appendChild(createDetailElement('Típus: ', palya.Tipus));
  palyaDiv.appendChild(createDetailElement('Órabér: ', `${palya.Oraber} RON`));
  palyaDiv.appendChild(createDetailElement('Cím: ', palya.Cim));
  palyaDiv.appendChild(createDetailElement('Leírás: ', palya.Leiras));
  palyaDiv.appendChild(createDetailElement('Nyitvatartás: ', `${palya.Nyitas} - ${palya.Zaras}`));
}

function setupDetailsFetcher() {
  document.querySelectorAll('.palya-details').forEach((listing) => {
    listing.addEventListener('click', async (event) => {
      if (event.target.nodeName !== 'SPAN' && event.target.nodeName !== 'P') {
        return;
      }

      const palyaDiv = event.target.closest('.palya-details');
      let palyaId = palyaDiv.firstElementChild.querySelector('.detail-value');
      if (palyaId === null) {
        alert('Hiba történt a lekérdezés során');
        return;
      }
      palyaId = parseInt(palyaId.textContent, 10);
      try {
        await showAllPalyaDetails(palyaId, palyaDiv);
      } catch (err) {
        alert(`Hiba történt a lekérdezés során: ${err.message}`);
      }
    });
  });
}

function setupImgDeleter() {
  document.querySelectorAll('.img-delete-button').forEach((deleteButton) => {
    deleteButton.addEventListener('click', async (event) => {
      const card = event.target.parentNode;
      const url = card.querySelector('img').getAttribute('src');
      const response = await fetch(`/api/kepek/${url}`, { method: 'DELETE' });
      if (!response.ok) {
        alert(`${response.status} ${await response.text().then((text) => text)}`);
        return;
      }
      card.remove();
      setTimeout(() => alert('Kép sikeresen törölve'), 100);
    });
  });
}

function setupAppointmentDeleter() {
  document.querySelectorAll('td.deleter-column button').forEach((deleteButton) => {
    const table = deleteButton.closest('table');
    const tbody = table.querySelector('tbody');
    deleteButton.addEventListener('click', async (event) => {
      const row = event.target.closest('tr');
      const felhasznalonev = row.querySelector('td.column-username').textContent;
      const idopont = row.querySelector('td.column-datetime').textContent;
      const palyaId = row.querySelector('td.column-palyaid').textContent;
      try {
        const response = await fetch(`/api/foglalasok/${palyaId}/${felhasznalonev}/${idopont}`, { method: 'DELETE' });
        if (!response.ok) {
          alert(`${response.status} ${await response.text()}`);
          return;
        }
      } catch (err) {
        alert('Szerver hiba');
      }
      row.remove();
      const nrRemainingRows = tbody.childElementCount;
      if (nrRemainingRows === 0) {
        const p = document.createElement('p');
        p.textContent = 'Nincs több foglalás.';
        table.replaceWith(p);
      }
      setTimeout(() => alert('Foglalás sikeresen törölve'), 100);
    });
  });
}

function setupBanUnban() {
  document.querySelectorAll('.ban-button, .unban-button').forEach((button) => {
    const row = button.closest('tr');
    const felhasznalonev = row.querySelector('td.column-username').textContent;
    button.addEventListener('click', async () => {
      try {
        const fiokallapotCell = row.querySelector('td.column-fiokallapot');
        if (button.classList.contains('unban-button')) {
          const response = await fetch(`/api/felhasznalok/unban/${felhasznalonev}`, { method: 'PATCH' });
          if (!response.ok) {
            alert(`${response.status} ${await response.text()}`);
            return;
          }
          fiokallapotCell.textContent = 'ok';
          button.classList.remove('unban-button');
          button.classList.add('ban-button');
          button.textContent = 'Kitiltás';
        } else if (button.classList.contains('ban-button')) {
          const response = await fetch(`/api/felhasznalok/ban/${felhasznalonev}`, { method: 'PATCH' });
          if (!response.ok) {
            alert(`${response.status} ${await response.text()}`);
            return;
          }
          fiokallapotCell.textContent = 'kitiltva';
          button.classList.remove('ban-button');
          button.classList.add('unban-button');
          button.textContent = 'Feloldás';
        }
      } catch (err) {
        alert('Szerver hiba');
      }
    });
  });
}

function setupRegistrationApproval() {
  const pendingTable = document.querySelector('table.pending');
  const pendingTableTbody = pendingTable.querySelector('tbody');
  const registeredTable = document.querySelector('table.registered');
  document.querySelectorAll('.approve-button, .reject-button').forEach((button) => {
    const row = button.closest('tr');
    const felhasznalonev = row.querySelector('td.column-username').textContent;
    button.addEventListener('click', async () => {
      try {
        if (button.classList.contains('approve-button')) {
          // regisztracio jovahagyasa
          const response = await fetch(`/api/felhasznalok/approve/${felhasznalonev}`, { method: 'PATCH' });
          if (!response.ok) {
            alert(`${response.status} ${await response.text()}`);
            return;
          }

          // regisztralt diakokat tartalmazo tabla frissitese
          await fetch('/diakok-registered-table')
            .then((responseRegistered) => responseRegistered.text())
            .then((data) => {
              registeredTable.innerHTML = data;
            });
          setupBanUnban();

          setTimeout(() => alert(`'${felhasznalonev}' elfogadva`), 100);
        } else if (button.classList.contains('reject-button')) {
          // regisztracio elutasitasa
          const response = await fetch(`/api/felhasznalok/reject/${felhasznalonev}`, { method: 'PATCH' });
          if (!response.ok) {
            alert(`${response.status} ${await response.text()}`);
            return;
          }
          setTimeout(() => alert(`'${felhasznalonev}' elutasitva`), 100);
        }
        row.remove();
        const nrRemainingRows = pendingTableTbody.childElementCount;
        if (nrRemainingRows === 0) {
          const p = document.createElement('p');
          p.textContent = 'Nincs több jóváhagyásra váró regisztráció.';
          pendingTable.replaceWith(p);
        }
      } catch (err) {
        alert('Szerver hiba');
      }
    });
  });
}

function createTimeInputElement(hour, oraHiddenInput, submitButton) {
  const outerDiv = document.createElement('div');
  outerDiv.className = 'col-md-2 col-4 my-1 px-2';
  outerDiv.value = hour;

  const innerDiv = document.createElement('div');
  innerDiv.className = 'cell py-1';
  const hourText = hour < 10 ? `0${hour}` : `${hour}`;
  innerDiv.textContent = `${hourText}:00`;
  $(innerDiv).click(function cellClick() {
    $('.cell').removeClass('select');
    $(this).addClass('select');
    submitButton.disabled = false;
  });

  outerDiv.appendChild(innerDiv);
  oraHiddenInput.value = hour;

  return outerDiv;
}

// visszateriti a palya adott datumra szabad idopontjait (azaz azokat az orakat, amikre nincs foglalas)
async function getFreeHours(palyaId, date) {
  const response = await fetch(`/api/foglalasok/${palyaId}/freehours/${date}`);
  if (!response.ok) {
    throw new Error('Szerver hiba');
  }
  return response.json();
}

function setupAppointmentCreator() {
  $('.datepicker').datepicker({
    format: 'yyyy-mm-dd',
    autoclose: false,
    startDate: '0d',
    todayHighlight: true,
    weekStart: 1,
  });

  const appointmentCreatorForm = document.querySelector('form.appointment-creator');

  const idotartamInput = document.querySelector('.duration-picker');
  idotartamInput.addEventListener('change', () => {
    const idotartamValue = parseInt(idotartamInput.value, 10);
    if (idotartamValue < 1) {
      idotartamInput.value = 1;
    }
  });

  const timeInputsContainer = appointmentCreatorForm.querySelector('.time-inputs');
  const dateInput = appointmentCreatorForm.querySelector('.card-header #dp1');
  const oraHiddenInput = appointmentCreatorForm.querySelector('input[name=ora]');
  const submitButton = appointmentCreatorForm.querySelector('button[type=submit]');

  $('.cell').click(function cellClick() {
    $('.cell').removeClass('select');
    $(this).addClass('select');
    submitButton.disabled = false;
  });

  $('.datepicker')
    .datepicker()
    .on('changeDate', async () => {
      timeInputsContainer.innerHTML = '';
      const palyaId = appointmentCreatorForm.querySelector('input[name=palyaId]').value;
      const date = dateInput.value;
      try {
        submitButton.disabled = true;
        const freeHours = await getFreeHours(palyaId, date);
        if (freeHours.length === 0) {
          const p = document.createElement('p');
          p.textContent = 'Nincs szabad időpont erra a napra.';
          timeInputsContainer.appendChild(p);
          return;
        }
        freeHours.forEach((hour) => {
          const timeInput = createTimeInputElement(hour, oraHiddenInput, submitButton);
          timeInputsContainer.appendChild(timeInput);
        });
      } catch (err) {
        alert('Szerver hiba');
      }
    });

  const event = new Event('changeDate');
  dateInput.value = new Date().toISOString().slice(0, 10);
  dateInput.dispatchEvent(event);
}

window.onload = () => {
  setupDetailsFetcher();
  setupImgDeleter();
  setupAppointmentDeleter();

  if (document.location.pathname === '/diakok') {
    setupRegistrationApproval();
    setupBanUnban();
  }

  setupAppointmentCreator();
};
