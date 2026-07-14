// PasswordType.ts — character classes, templates and entropy table.
// Ported 1:1 from the Kotlin `PasswordType` enum.

export enum PasswordType {
  MAXIMUM = 'MAXIMUM',
  LONG = 'LONG',
  MEDIUM = 'MEDIUM',
  BASIC = 'BASIC',
  SHORT = 'SHORT',
  PIN = 'PIN',
  NAME = 'NAME',
  PHRASE = 'PHRASE',
}

export const ALL_PASSWORD_TYPES: PasswordType[] = [
  PasswordType.MAXIMUM,
  PasswordType.LONG,
  PasswordType.MEDIUM,
  PasswordType.BASIC,
  PasswordType.SHORT,
  PasswordType.PIN,
  PasswordType.NAME,
  PasswordType.PHRASE,
];

export const DEFAULT_PASSWORD_TYPE = PasswordType.LONG;

const UPPER_VOWELS = 'AEIOU';
const LOWER_VOWELS = 'aeiou';
const UPPER_CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ';
const LOWER_CONSONANTS = 'bcdfghjklmnpqrstvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = "@&%?,=[]_:-+*$#'!^~;()/.";
const ALL_LETTERS = UPPER_VOWELS + LOWER_VOWELS + UPPER_CONSONANTS + LOWER_CONSONANTS;
const EXTENDED_SYMBOLS = '!@#$%^&*()';

/** Character class lookup table, keyed by template glyph. */
export const CHAR_CLASSES: Record<string, string> = {
  V: UPPER_VOWELS,
  v: LOWER_VOWELS,
  C: UPPER_CONSONANTS,
  c: LOWER_CONSONANTS,
  A: UPPER_VOWELS + UPPER_CONSONANTS,
  a: ALL_LETTERS,
  n: DIGITS,
  o: SYMBOLS,
  x: ALL_LETTERS + DIGITS + EXTENDED_SYMBOLS,
  ' ': ' ',
};

export const TEMPLATES: Record<PasswordType, string[]> = {
  [PasswordType.MAXIMUM]: ['anoxxxxxxxxxxxxxxxxx', 'axxxxxxxxxxxxxxxxxno'],
  [PasswordType.LONG]: [
    'CvcvnoCvcvCvcv',
    'CvcvCvcvnoCvcv',
    'CvcvCvcvCvcvno',
    'CvccnoCvcvCvcv',
    'CvccCvcvnoCvcv',
    'CvccCvcvCvcvno',
    'CvcvnoCvccCvcv',
    'CvcvCvccnoCvcv',
    'CvcvCvccCvcvno',
    'CvcvnoCvcvCvcc',
    'CvcvCvcvnoCvcc',
    'CvcvCvcvCvccno',
    'CvccnoCvccCvcv',
    'CvccCvccnoCvcv',
    'CvccCvccCvcvno',
    'CvcvnoCvccCvcc',
    'CvcvCvccnoCvcc',
    'CvcvCvccCvccno',
    'CvccnoCvcvCvcc',
    'CvccCvcvnoCvcc',
    'CvccCvcvCvccno',
  ],
  [PasswordType.MEDIUM]: ['CvcnoCvc', 'CvcCvcno'],
  [PasswordType.BASIC]: ['aaanaaan', 'aannaaan', 'aaannaaa'],
  [PasswordType.SHORT]: ['Cvcn'],
  [PasswordType.PIN]: ['nnnn'],
  [PasswordType.NAME]: ['cvccvcvcv'],
  [PasswordType.PHRASE]: ['cvcc cvc cvccvcv cvc', 'cvc cvccvcvcv cvcv', 'cv cvccv cvc cvcvccv'],
};

export const ENTROPY_BITS: Record<PasswordType, number> = {
  [PasswordType.MAXIMUM]: 128,
  [PasswordType.LONG]: 96,
  [PasswordType.MEDIUM]: 72,
  [PasswordType.BASIC]: 64,
  [PasswordType.SHORT]: 48,
  [PasswordType.PIN]: 32,
  [PasswordType.NAME]: 64,
  [PasswordType.PHRASE]: 96,
};

export const PASSWORD_TYPE_LABELS: Record<PasswordType, string> = {
  [PasswordType.MAXIMUM]: 'Maximum',
  [PasswordType.LONG]: 'Long',
  [PasswordType.MEDIUM]: 'Medium',
  [PasswordType.BASIC]: 'Basic',
  [PasswordType.SHORT]: 'Short',
  [PasswordType.PIN]: 'PIN',
  [PasswordType.NAME]: 'Name',
  [PasswordType.PHRASE]: 'Phrase',
};

/** Type <-> int mapping used by SiteRepository's JSON export/import format. */
export const PASSWORD_TYPE_TO_INT: Record<PasswordType, number> = {
  [PasswordType.MAXIMUM]: 0,
  [PasswordType.LONG]: 1,
  [PasswordType.MEDIUM]: 2,
  [PasswordType.BASIC]: 3,
  [PasswordType.SHORT]: 4,
  [PasswordType.PIN]: 5,
  [PasswordType.NAME]: 6,
  [PasswordType.PHRASE]: 7,
};

export const INT_TO_PASSWORD_TYPE: Record<number, PasswordType> = Object.fromEntries(
  Object.entries(PASSWORD_TYPE_TO_INT).map(([type, i]) => [i, type as PasswordType]),
);
