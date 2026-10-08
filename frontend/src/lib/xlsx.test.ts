import { describe, expect, it } from 'vitest';
import { buildXlsx, colName, crc32 } from './xlsx';

describe('xlsx writer', () => {
  it('computes the standard CRC-32', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });

  it('names columns like Excel', () => {
    expect([0, 25, 26, 51, 701, 702].map(colName)).toEqual(['A', 'Z', 'AA', 'AZ', 'ZZ', 'AAA']);
  });

  it('produces a zip with the workbook parts and escaped cells', () => {
    const out = buildXlsx([['Name', 'City'], ['Riad <Atlas> & Co', 'Marrakech'], ['Dar\u0007 Saad', 42]]);
    expect(out[0]).toBe(0x50); expect(out[1]).toBe(0x4b); // "PK"
    const text = new TextDecoder().decode(out);
    for (const part of ['[Content_Types].xml', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml', 'xl/styles.xml']) expect(text).toContain(part);
    expect(text).toContain('Riad &lt;Atlas&gt; &amp; Co');
    expect(text).toContain('<v>42</v>');
    expect(text).toContain('Dar Saad'); // control character stripped from the cell
  });
});
