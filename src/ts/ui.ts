import { ICar, ICarCreate } from './interfaces';
import { CONSTANTS } from './constants';
import { storage } from './storage';
import { renderCarImage } from './carsvg';
import { generateCars, race, startDriving, stopDriving } from './utils';
import { getCars, getCar, getWinners, createCar, deleteCar, deleteWinner, updateCar, saveWinner } from './api';

export async function garageUpdate(): Promise<void> {
  const car = await getCars(storage.garagePage);
  storage.carsCount = car.count;
  storage.cars = car.items;
}

export async function winnersUpdate(): Promise<void> {
  const winnersInfo = await getWinners({
    page: storage.winnersPage,
    limit: CONSTANTS.WINNERS_LIMIT,
    sort: storage.sort,
    order: storage.sortOrder,
  });
  storage.winners = winnersInfo.items;
  storage.winnersCount = winnersInfo.count;
}

export function updateButtons(): void {
  const prevButton = document.getElementById('prev') as HTMLButtonElement;
  const nextButton = document.getElementById('next') as HTMLButtonElement;
  const garageButton = document.querySelector('.garage-menu-button') as HTMLButtonElement;
  const winnersButton = document.querySelector('.winners-menu-button') as HTMLButtonElement;

  if (storage.view === 'garage') {
    garageButton.disabled = true;
    winnersButton.disabled = false;
    if (storage.garagePage > 1) {
      prevButton.disabled = false;
    } else {
      prevButton.disabled = true;
    }
    if (storage.garagePage * CONSTANTS.GARAGE_LIMIT < storage.carsCount) {
      nextButton.disabled = false;
    } else {
      nextButton.disabled = true;
    }
  } else if (storage.view === 'winners') {
    garageButton.disabled = false;
    winnersButton.disabled = true;
    if (storage.winnersPage > 1) {
      prevButton.disabled = false;
    } else {
      prevButton.disabled = true;
    }
    if (storage.winnersPage * CONSTANTS.WINNERS_LIMIT < storage.winnersCount) {
      nextButton.disabled = false;
    } else {
      nextButton.disabled = true;
    }
  }
}

const renderCar = ({ id, name, color }: ICar) => `
<div class="car">
  <div class="car__top">
    <div class="car__controls">
      <button class="car__button button select-button" id="select-car-${id}">Select</button>
      <button class="car__button button remove-button" id="remove-car-${id}">Remove</button>  
      <button class="car__button start-engine-button" id="start-engine-car-${id}">Start</button>
      <button class="car__button stop-engine-button" id="stop-engine-car-${id}" disabled>Stop</button>
    </div>
  <div class="car__name">${name}</div>
  </div>
  <div class="car__track">
    <div class="car__image" id="car-${id}">${renderCarImage(color)}</div>
  </div>
</div>
`;

function renderGarage() {
  return `<div class="garage" id="garage">
  <div class="garage__headers">
    <h3>page: ${storage.garagePage} /  ${Math.ceil(storage.carsCount / CONSTANTS.GARAGE_LIMIT)}</h3>
    <h3>garage: ${storage.carsCount}</h3>    
  </div>
  <ul class="garage">
    ${storage.cars.map(car => `<li>${renderCar(car)}</li>`).join('')}
  </ul>    
</div>
</div>`;
}

const renderWinners = () => `
  <div class="winners__headers">
    <h3>page: ${storage.winnersPage} / ${Math.ceil(storage.winnersCount / CONSTANTS.WINNERS_LIMIT)}</h2>
    <h3>number of winners: ${storage.winnersCount}</h1>
  </div>
  <table class="table" cellspasing="0" border="0" cellpadding="0">
    <thead>
      <th>Number</th>
      <th>Car</th>
      <th class="td-string">Name</th>
      <th class="table-button table-wins ${
        storage.sort === 'wins' ? storage.sortOrder : ''
      }" id="sort-by-wins">Wins</th>
      <th class="table-button table-time ${
        storage.sort === 'time' ? storage.sortOrder : ''
      }"" id="sort-by-time">Time(sec)</th>
    </thead>
    <tbody>
      ${storage.winners
        .map(
          (winner, index) => `<tr>
        <td>${(storage.winnersPage - 1) * CONSTANTS.WINNERS_LIMIT + index + 1}</td>
        <td>${renderCarImage(winner.car.color)}</td>
        <td class="td-string">${winner.car.name}</td>
        <td>${winner.wins}</td>
        <td>${winner.time}</td></tr>`
        )
        .join('')}</tbody>
  </table>
`;

export const render = async (): Promise<void> => {
  const template = `
    <header>
        <h1>ASYNC-RACE</h1>
        <nav class="navigation">
          <button class="garage-menu-button navigation__item primary" id="garage-menu" disabled>> to garage</button>
          <button class="winners-menu-button navigation__item primary" id="winners-menu">> to winners</button>
        </nav>
    </header>
    <main>
      <div class="wrapper" id="garage-view">
        <div class="message" id="message"></div>  
        <div class="garage-menu">
          <form class="form" id="create">
            <input type="text" class="form__name" id="create-name" name="name" placeholder="name of car">
            <input type="color" class="form__color" id="create-color" name="color" value="#000000">
            <button class="form__button">create</button>
          </form>
          <form class="form" id="update">
            <input type="text" class="form__name" id="update-name" name="name" disabled dplaceholder="new name of car">
            <input type="color" class="form__color" id="update-color" disabled name="color" value="#ffffff">
            <button disabled class="form__button" id="update-submit">update</button>
          </form>
        </div>
        <div class="race-controls buttons">
          <button class="garage-menu__button race-button" id="race">race</button>
          <button class="garage-menu__button reset-button" disabled id="reset">reset</button>
          <button class="garage-menu__button generator-button" id="generator">generate</button>
        </div>
        <div id="garage-cars">
          ${renderGarage()}
        </div>
      </div>
      <div class="wrapper" id="winners-view" style="display: none">
        ${renderWinners()}
      </div>
      <div class="pagination">
        <button class="padination__button prev-button" disabled id="prev">prev</button>
        <button class="padination__button next-button" disabled id="next">next</button>
      </div>
    </main>
  `;
  const el = document.createElement('div');
  el.innerHTML = template;
  document.body.appendChild(el);
};

export const listen = function (): void {
  const garageCars: HTMLElement | null = document.getElementById('garage-cars');
  const updateNameInput = document.getElementById('update-name') as HTMLInputElement;
  const createNameInput = document.getElementById('create-name') as HTMLInputElement;
  const updateColorInput = document.getElementById('update-color') as HTMLInputElement;
  const createColorInput = document.getElementById('create-color') as HTMLInputElement;

  const updateBtn = document.getElementById('update-submit') as HTMLButtonElement;

  const updateForm = document.getElementById('update') as HTMLFormElement;
  const createForm = document.getElementById('create') as HTMLFormElement;

  let selectedCar: ICar | null = null;

  document.body.addEventListener('click', async event => {
    const eventTarget = event.target as HTMLButtonElement;
    const winnersView = document.getElementById('winners-view') as HTMLElement;
    const garageView = document.getElementById('garage-view') as HTMLElement;
    const resetBtn = document.getElementById('reset') as HTMLButtonElement;
    const raceBtn = document.getElementById('race') as HTMLButtonElement;

    if (eventTarget.classList.contains('prev-button')) {
      if (storage.view === 'garage') {
        storage.garagePage -= 1;
        await garageUpdate();
        updateButtons();
        if (garageCars) garageCars.innerHTML = renderGarage();
      } else {
        storage.winnersPage -= 1;
        await winnersUpdate();
        updateButtons();
        winnersView.innerHTML = renderWinners();
      }
    }

    if (eventTarget.classList.contains('next-button')) {
      if (storage.view === 'garage') {
        storage.garagePage += 1;
        await garageUpdate();
        updateButtons();
        if (garageCars) garageCars.innerHTML = renderGarage();
      } else {
        storage.winnersPage += 1;
        await winnersUpdate();
        updateButtons();
        winnersView.innerHTML = renderWinners();
      }
    }

    if (eventTarget.classList.contains('garage-menu-button')) {
      winnersView.style.display = 'none';
      garageView.style.display = 'block';

      storage.view = 'garage';
      updateButtons();
    }

    if (eventTarget.classList.contains('winners-menu-button')) {
      winnersView.style.display = 'block';
      garageView.style.display = 'none';

      await winnersUpdate();
      winnersView.innerHTML = renderWinners();
      storage.view = 'winners';
      updateButtons();
    }

    if (eventTarget.classList.contains('generator-button')) {
      eventTarget.disabled = true;
      const cars = generateCars(CONSTANTS.GENERATE_CARS_AMOUNT);
      await Promise.all(cars.map(async car => createCar(car)));
      await garageUpdate();
      updateButtons();
      if (garageCars) garageCars.innerHTML = renderGarage();
      disableButtons(false);
      eventTarget.disabled = false;
    }

    if (eventTarget.classList.contains('select-button')) {
      selectedCar = await getCar(+eventTarget.id.split('select-car-')[1]);
      updateNameInput.value = selectedCar.name;
      updateColorInput.value = selectedCar.color;

      updateNameInput.disabled = false;
      updateColorInput.disabled = false;
      updateBtn.disabled = false;
    }

    if (eventTarget.classList.contains('remove-button')) {
      const id = +eventTarget.id.split('remove-car-')[1];
      await deleteCar(id);
      await deleteWinner(id);
      await garageUpdate();
      if (garageCars) garageCars.innerHTML = renderGarage();
      updateButtons();
    }

    if (eventTarget.classList.contains('start-engine-button')) {
      const id = +eventTarget.id.split('start-engine-car-')[1];
      startDriving(id);
    }
    if (eventTarget.classList.contains('stop-engine-button')) {
      const id = +eventTarget.id.split('stop-engine-car-')[1];
      stopDriving(id);
    }

    if (eventTarget.classList.contains('race-button')) {
      disableButtons(true);
      eventTarget.disabled = true;
      const winner = await race(startDriving);
      await saveWinner(winner);
      const message: HTMLElement | null = document.getElementById('message');
      if (message) {
        message.innerHTML = `winner: ${winner.name} - ${winner.time}sec`;
        message.classList.toggle('visible', true);
        setTimeout(() => {
          message.classList.toggle('visible');
        }, 7000);
      }
      resetBtn.disabled = false;
    }
    if (eventTarget.classList.contains('reset-button')) {
      disableButtons(false);
      eventTarget.disabled = true;
      storage.cars.map(({ id }) => stopDriving(id));
      const message = document.getElementById('message');
      message?.classList.toggle('visible', false);
      raceBtn.disabled = false;
    }

    if (eventTarget.classList.contains('table-wins')) {
      setSortOrder('wins');
    }
    if (eventTarget.classList.contains('table-time')) {
      setSortOrder('time');
    }
  });

  createForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (createNameInput.value) {
      const newCar = {
        name: createNameInput.value,
        color: createColorInput.value,
      };
      await createCar(newCar);
      await garageUpdate();
      if (garageCars) garageCars.innerHTML = renderGarage();
      updateButtons();
      createNameInput.value = '';
      createColorInput.value = '#000000';
    } else {
      alert('enter car name');
    }
  });

  updateForm.addEventListener('submit', async event => {
    event.preventDefault();
    const car: ICarCreate = {
      name: updateNameInput.value,
      color: updateColorInput.value,
    };
    if (selectedCar) {
      await updateCar(selectedCar.id, car);
    }
    await garageUpdate();
    if (garageCars) garageCars.innerHTML = renderGarage();
    updateNameInput.value = '';

    updateNameInput.disabled = true;
    updateColorInput.disabled = true;
    updateColorInput.value = '#000000';
    updateBtn.disabled = true;
    selectedCar = null;
  });
};

function disableButtons(operator: boolean): void {
  const buttons = document.querySelectorAll('.primary') as NodeListOf<HTMLButtonElement>;
  if (operator) {
    buttons.forEach(button => (button.disabled = true));
  } else {
    updateButtons();
  }
}

async function setSortOrder(sort: string) {
  if (storage.sortOrder === 'asc') {
    storage.sortOrder = 'desc';
  } else {
    storage.sortOrder = 'asc';
  }
  storage.sort = sort;
  await winnersUpdate();
  const winnersView: HTMLElement | null = document.getElementById('winners-view');
  if (winnersView) winnersView.innerHTML = renderWinners();
}
