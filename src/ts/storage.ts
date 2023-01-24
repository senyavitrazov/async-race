import { IStorage } from './interfaces';
import { CONSTANTS } from './constants';

export const storage: IStorage = {
  cars: [],
  winners: [],
  garagePage: CONSTANTS.DEFAULT_GARAGE_PAGE,
  winnersPage: CONSTANTS.DEFAULT_GARAGE_PAGE,
  carsCount: 0,
  winnersCount: 0,
  view: 'garage',
  sort: 'time',
  sortOrder: 'asc',
};
