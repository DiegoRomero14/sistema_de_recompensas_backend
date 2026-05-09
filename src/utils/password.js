const crypto = require('crypto');

const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';
const PREFIX = `pbkdf2_${DIGEST}`;

const generarHashContrasena = (contrasena) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(contrasena, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString('hex');

  return `${PREFIX}$${ITERATIONS}$${salt}$${hash}`;
};

const validarContrasena = (contrasena, contrasenaHash) => {
  if (typeof contrasena !== 'string' || !contrasena || !contrasenaHash) {
    return false;
  }

  const [prefix, iterations, salt, hash] = contrasenaHash.split('$');

  if (prefix !== PREFIX || !iterations || !salt || !hash) {
    return false;
  }

  const iterationsNumber = Number(iterations);

  if (!Number.isInteger(iterationsNumber) || iterationsNumber <= 0) {
    return false;
  }

  const hashGuardado = Buffer.from(hash, 'hex');

  if (hashGuardado.length === 0) {
    return false;
  }

  const hashIngresado = crypto.pbkdf2Sync(
    contrasena,
    salt,
    iterationsNumber,
    hashGuardado.length,
    DIGEST
  );

  if (hashGuardado.length !== hashIngresado.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashGuardado, hashIngresado);
};

const generarTokenSesion = () => crypto.randomBytes(32).toString('hex');

module.exports = {
  generarHashContrasena,
  validarContrasena,
  generarTokenSesion
};
