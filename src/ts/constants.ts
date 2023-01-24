export const CONSTANTS = {
  DEFAULT_GARAGE_PAGE: 1,
  DEFAULT_WINNERS_PAGE: 1,
  GARAGE_LIMIT: 7,
  WINNERS_LIMIT: 10,
  GENERATE_CARS_AMOUNT: 100,
};

const base = 'http://localhost:3000';

export const path = {
  garage: `${base}/garage`,
  engine: `${base}/engine`,
  winners: `${base}/winners`,
};
