export function validateTime(timeStr) {
  if (!/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/.test(timeStr)) {
    throw new Error(`helytelen időpont formátum: ${timeStr}`);
  }
}

export function validateStringNotLongerThan(str, maxLength) {
  if (str.length > maxLength) {
    throw new Error(`túl hosszú szöveg: ${str.length}/${maxLength} karakter`);
  }
}

export function validateNonNegative(num) {
  if (num < 0) {
    throw new Error(`nem lehet negatív: ${num}`);
  }
}

export function validateDefined(...args) {
  if (!args.every((arg) => arg !== undefined && arg !== '')) {
    throw new Error('hiányzó adatok');
  }
}

export function validateInt(num) {
  num = parseInt(num, 10);
  if (Number.isNaN(num)) {
    throw new Error(`nem 'int' típusú: ${num}`);
  }
  return num;
}

export function validateFloat(num) {
  num = parseFloat(num);
  if (Number.isNaN(num)) {
    throw new Error(`nem 'float' tipusú: ${num}`);
  }
  return num;
}

export function validatePasswordsMatch(pw1, pw2) {
  if (pw1 !== pw2) {
    throw new Error('a két jelszó nem egyezik');
  }
}
