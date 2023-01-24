export interface ICar {
  id: number;
  name: string;
  color: string;
}

export interface ICarCreate {
  name: string;
  color: string;
}

export interface ICarSpeed {
  distance: number;
  velocity: number;
}

export interface IRace {
  id?: number;
  name?: string;
  color?: string;
  time: number;
}

export interface IWinner {
  id: number;
  car: ICar;
  time: number;
  wins: number;
}

export interface IStorage {
  winners: IWinner[];
  cars: ICar[];
  garagePage: number;
  carsCount: number;
  winnersPage: number;
  winnersCount: number;
  view: string;
  sort: string;
  sortOrder: string;
}

export interface IStartDriving {
  id: number;
  time: number;
  success: boolean;
}
