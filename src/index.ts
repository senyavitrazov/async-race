import { garageUpdate, updateButtons, render, listen } from './ts/ui';

async function init() {
  await garageUpdate();
  await render();
  updateButtons();
  listen();
}

init();
