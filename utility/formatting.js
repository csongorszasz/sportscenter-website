import { format } from 'date-fns';

export function formatFoglalasok(foglalasok) {
  return foglalasok.map((foglalas) => ({
    ...foglalas,
    Idopont: format(foglalas.Idopont, 'yyyy-MM-dd HH:mm'),
  }));
}

function hhmmssTohhmm(hhmmss) {
  return hhmmss.slice(0, 5);
}

export function formatPalya(palya) {
  const newNyitas = hhmmssTohhmm(palya.Nyitas);
  const newZaras = hhmmssTohhmm(palya.Zaras);
  return {
    ...palya,
    Nyitas: newNyitas,
    Zaras: newZaras,
  };
}
