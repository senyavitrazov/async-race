import { drive, startEngine, stopEngine } from './api';
import { ICarCreate, IRace, IStartDriving } from './interfaces';
import { storage } from './storage';

const models = [
  'BMW',
  'Mercedes-Benz',
  'Ford',
  'Chevrolet',
  'Mitsubishi',
  'Nissan',
  'Volvo',
  'Audi',
  'Toyota',
  'Volkswagen',
];

const names = ['XT6', 'ZCT33', '94', 'e34', 'o81', 'GT-311', 'NAZ', '91j', 'Sa8AI', 'M0DE1'];

export function generateCars(count: number): ICarCreate[] {
  return new Array(count).fill(1).map(() => ({ name: getRandomName(), color: getRandomColor() }));
}

export function getRandomColor(): string {
  const color = () => Math.floor(Math.random() * 256);
  return `rgb(${color()}, ${color()}, ${color()})`;
}

export function getRandomName(): string {
  const model = models[Math.floor(Math.random() * models.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  return `${model} ${name}`;
}

export async function startDriving(id: number): Promise<IStartDriving> {
  const startButton = document.getElementById(`start-engine-car-${id}`);
  const stopButton = document.getElementById(`stop-engine-car-${id}`);

  if (startButton instanceof HTMLButtonElement) {
    startButton.disabled = true;
    startButton.classList.toggle('enabling', true);
  }
  const { velocity, distance } = await startEngine(id);
  const time = Math.round(distance / velocity);

  if (stopButton instanceof HTMLButtonElement && startButton instanceof HTMLButtonElement) {
    startButton.classList.toggle('enabling', false);
    stopButton.disabled = false;
  }

  const car = document.getElementById(`car-${id}`);

  if (car instanceof HTMLElement) {
    car.style.animationName = `car-animation`;
    car.style.animationDuration = `${time.toString()}ms`;
  }

  const { success } = await drive(id);

  if (!success && car instanceof HTMLElement) {
    car.style.animationPlayState = 'paused';
    car.classList.add('broken');
  }
  return { success, id, time };
}

export async function stopDriving(id: number): Promise<void> {
  const startButton = document.getElementById(`start-engine-car-${id}`);
  const stopButton = document.getElementById(`stop-engine-car-${id}`);

  if (stopButton instanceof HTMLButtonElement) {
    stopButton.disabled = true;
    stopButton.classList.toggle('enabling', true);
    await stopEngine(id);
    stopButton.classList.toggle('enabling', false);
    if (startButton instanceof HTMLButtonElement) startButton.disabled = false;
  }

  const car = document.getElementById(`car-${id}`);
  if (car instanceof HTMLElement) {
    car.style.animationName = 'none';
    car.style.animationPlayState = 'initial';
    car.classList.remove('broken');
  }
}

export async function raceAll(promises: Promise<IStartDriving>[], indexes: number[]): Promise<IRace> {
  const { success, id, time } = await Promise.race(promises);

  if (!success) {
    const indexFailed = indexes.findIndex(i => i === id);
    const restOfIndexes = [...indexes.slice(0, indexFailed), ...indexes.slice(indexFailed + 1, indexes.length)];
    const restOfPromises = [...promises.slice(0, indexFailed), ...promises.slice(indexFailed + 1, promises.length)];
    return raceAll(restOfPromises, restOfIndexes);
  }

  return { ...storage.cars.find(car => car.id === id), time: +(time / 1000).toFixed(2) };
}

export async function race(action: (id: number) => Promise<IStartDriving>): Promise<IRace> {
  const promises = storage.cars.map(({ id }) => action(id));
  const winner = await raceAll(
    promises,
    storage.cars.map(car => car.id)
  );
  return winner;
}
