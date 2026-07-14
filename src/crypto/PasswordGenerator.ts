// PasswordGenerator.ts
//
// Deterministically renders a byte-seed (HMAC-SHA256 output) into a
// human-typeable password using the Spectre/Master Password template system.

import { CHAR_CLASSES, ENTROPY_BITS, PasswordType, TEMPLATES } from './PasswordType';

export const PasswordGenerator = {
  /**
   * seed[0] selects the template variant.
   * seed[i+1] selects the character at template position i (offset by +1).
   */
  generate(seed: Uint8Array, type: PasswordType): string {
    const templates = TEMPLATES[type];
    const templateIndex = seed[0] % templates.length;
    const template = templates[templateIndex];

    let result = '';
    for (let i = 0; i < template.length; i++) {
      const glyph = template[i];
      const charClass = CHAR_CLASSES[glyph] ?? ' ';
      const seedByte = seed[i + 1] ?? 0;
      const index = seedByte % charClass.length;
      result += charClass[index];
    }
    return result;
  },

  calculateEntropyBits(type: PasswordType): number {
    return ENTROPY_BITS[type];
  },
};
