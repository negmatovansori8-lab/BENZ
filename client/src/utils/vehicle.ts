import type { Car } from '../types';
import type { Msg } from '../i18n/dict';

const FUEL: Record<string, Msg> = {
  Petrol: 'fuelPetrol',
  Diesel: 'fuelDiesel',
  Hybrid: 'fuelHybrid',
  Electric: 'fuelElectric',
  Gas: 'fuelGas',
};

const TRANS: Record<string, Msg> = {
  Automatic: 'transAuto',
  Manual: 'transManual',
};

const BODY: Record<string, Msg> = {
  Sedan: 'bodySedan',
  SUV: 'bodySuv',
  Coupe: 'bodyCoupe',
  Hatchback: 'bodyHatchback',
  Wagon: 'bodyWagon',
  Pickup: 'bodyPickup',
  Minivan: 'bodyMinivan',
};

const CAT: Record<string, Msg> = {
  passenger: 'catPassenger',
  commercial: 'catCommercial',
  kamaz: 'catKamaz',
  special: 'catSpecial',
  parts: 'catParts',
};

export function fuelMsg(v?: string | null): Msg {
  return (v && FUEL[v]) || 'fuel';
}

export function transMsg(v?: string | null): Msg {
  return (v && TRANS[v]) || 'transmission';
}

export function bodyMsg(v?: string | null): Msg {
  return (v && BODY[v]) || 'body';
}

export function categoryMsg(v?: string | null): Msg {
  return (v && CAT[v]) || 'category';
}

export function inferDrive(car: Car): Msg | null {
  const blob = `${car.engine || ''} ${car.description || ''} ${car.model}`.toUpperCase();
  if (/\b(AWD|4MATIC|XDRIVE|QUATTRO|4WD|4X4|ALL.?WHEEL)\b/.test(blob)) return 'driveAwd';
  if (/\b(RWD|REAR.?WHEEL)\b/.test(blob)) return 'driveRwd';
  if (/\b(FWD|FRONT.?WHEEL)\b/.test(blob)) return 'driveFwd';
  return null;
}

export function conditionMsg(km: number): Msg {
  if (km <= 80) return 'condNew';
  if (km < 25000) return 'condExcellent';
  if (km < 90000) return 'condGood';
  return 'condUsed';
}

export function powerKw(hp?: number | null) {
  if (!hp) return null;
  return Math.round(hp * 0.7355);
}
