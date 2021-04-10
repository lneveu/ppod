// see http://marsclock.com/

const TAI_UTC: number = 37;
const PERS_SOL_0: number = 52303;
const PERS_DEG_EAST: number = 77.4326;

function julianTerrestrialTimeToJulian(time: number): number {
  return time - 2451545;
}

function daysSinceJulianEpoch(date: Date): number {
  return julianTerrestrialTimeToJulian((2440587.5 + date.getTime() / 864e5 + (TAI_UTC + 32.184) / 86400));
}

function julianToMSD(time: number): number {
  return (time - 4.5) / 1.0274912517 + 44796 - 9626e-7
}

function UTCToMSD(date: Date): number {
  return julianToMSD(daysSinceJulianEpoch(date));
}

function resetTo24Range(time: number): number {
  return time < 0 ? time += 24 : time >= 24 && (time -= 24), time;
}

function formatTime(time: number) {
  const n = 3600 * time;
  const h = Math.floor(n / 3600);
  const hrs = h < 10 ? '0' + h : h.toString();

  const i = n % 3600;
  const m = Math.floor(i / 60);
  const mins = m < 10 ? '0' + m : m.toString();

  const s = Math.round(i % 60);
  const secs = s < 10 ? '0' + s : s.toString();

  return { hrs, mins, secs };
}

export function getMissionSol(earthDate: Date): number {
  const nowMSD = UTCToMSD(earthDate);
  return Math.floor(nowMSD - ((360 - PERS_DEG_EAST) / 360) - PERS_SOL_0);
}

export interface FormatedMissionTime {
  sol: string;
  hrs: string;
  mins: string;
  secs: string;
}

export function getFormatedMissionTime(): FormatedMissionTime {
  const now = new Date();
  const sol = getMissionSol(now).toString();
  const julianDate = daysSinceJulianEpoch(now);
  const time = resetTo24Range(24 * julianToMSD(julianDate) % 24 - 24 * (360 - PERS_DEG_EAST) / 360);
  const { hrs, mins, secs } = formatTime(time);

  return {
    sol,
    hrs,
    mins,
    secs
  }
}
