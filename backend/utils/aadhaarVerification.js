/**
 * Aadhaar Document Verification - Production-grade name normalization and fuzzy matching
 * Blue Carbon Registry - MoES / NCCR
 *
 * LEGAL COMPLIANCE NOTE:
 * System performs document-based validation using OCR for prototype stage.
 * Future integration can include DigiLocker API or official UIDAI verification API
 * upon government approval.
 *
 * SECURITY: Never store full Aadhaar number. Only last 4 digits are stored.
 */

import fs from 'fs';
import path from 'path';

const IS_DEV = process.env.NODE_ENV === 'development';

// ─── 1. Name Normalization ───────────────────────────────────────────────────

const AADHAAR_KEYWORDS = /\b(s\/o|d\/o|w\/o|son of|daughter of|wife of|male|female|dob|date of birth)\b/gi;
const HONORIFICS = /\b(mr|mrs|ms|shri|smt|kumari|dr)\b/gi;
const OCR_NUM_TO_LETTER = [
  [/0/g, 'o'],
  [/1/g, 'l'],
  [/5/g, 's'],
  [/8/g, 'b'],
];

/**
 * Produces a normalized name string for comparison.
 * Removes punctuation, extra spaces, Aadhaar keywords, honorifics; applies OCR corrections.
 */
function cleanName(str) {
  if (!str || typeof str !== 'string') return '';
  let s = str
    .toLowerCase()
    .replace(/\r\n|\n|\r/g, ' ')
    .replace(/[^\w\s\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  s = s.replace(AADHAAR_KEYWORDS, ' ').replace(HONORIFICS, ' ');
  for (const [num, letter] of OCR_NUM_TO_LETTER) {
    s = s.replace(num, letter);
  }
  return s.replace(/\s+/g, ' ').trim();
}

// ─── 2. Tokenization ─────────────────────────────────────────────────────────

const MIN_TOKEN_LENGTH = 3;

/**
 * Split name into tokens; keep only tokens with length >= MIN_TOKEN_LENGTH.
 * Order-independent.
 */
function tokenizeName(cleanedName) {
  if (!cleanedName) return [];
  return cleanedName
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= MIN_TOKEN_LENGTH);
}

// ─── 3. Levenshtein Distance ─────────────────────────────────────────────────

/**
 * Levenshtein distance between two strings. O(n*m). Used for fuzzy token match.
 */
function levenshtein(a, b) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0));
  for (let i = 0; i < rows; i++) d[i][0] = i;
  for (let j = 0; j < cols; j++) d[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  return d[rows - 1][cols - 1];
}

/**
 * True if two tokens are similar: exact, substring, or Levenshtein <= maxDist.
 */
function tokensSimilar(ta, tb, maxDist = 2) {
  if (!ta || !tb) return false;
  if (ta === tb) return true;
  if (ta.includes(tb) || tb.includes(ta)) return true;
  if (Math.abs(ta.length - tb.length) > maxDist) return false;
  return levenshtein(ta, tb) <= maxDist;
}

// ─── 4. Order-independent token matching ──────────────────────────────────────

/**
 * For each token in enteredTokens, find best matching token in extractedTokens (at most one match per).
 * Returns { exactMatches, fuzzyMatches } counts.
 */
function countTokenMatches(extractedTokens, enteredTokens) {
  const used = new Set();
  let exactMatches = 0;
  let fuzzyMatches = 0;
  for (const et of enteredTokens) {
    let foundExact = false;
    let foundFuzzy = false;
    for (let i = 0; i < extractedTokens.length; i++) {
      if (used.has(i)) continue;
      const ex = extractedTokens[i];
      if (ex === et) {
        used.add(i);
        exactMatches++;
        foundExact = true;
        break;
      }
    }
    if (foundExact) continue;
    for (let i = 0; i < extractedTokens.length; i++) {
      if (used.has(i)) continue;
      if (tokensSimilar(extractedTokens[i], et, 2)) {
        used.add(i);
        fuzzyMatches++;
        foundFuzzy = true;
        break;
      }
    }
  }
  return { exactMatches, fuzzyMatches };
}

// ─── 5. Score-based matching ────────────────────────────────────────────────

const TOKEN_WEIGHT = 0.5;
const FUZZY_WEIGHT = 0.3;
const SUBSTRING_WEIGHT = 0.2;
const MATCH_THRESHOLD = 0.75;
const MIN_MATCHING_TOKENS = 2;

/**
 * Production name comparison with score.
 * Requires at least 2 meaningful tokens to match; score >= 0.75 to pass.
 * Returns { match, confidenceScore, cleanedExtractedName, cleanedEnteredName }.
 */
export function compareNames(extracted, entered, fullText = '') {
  const cleanedExtracted = cleanName(extracted);
  const cleanedEntered = cleanName(entered);
  const docCleaned = fullText ? cleanName(fullText) : cleanedExtracted;

  const extractedTokens = tokenizeName(cleanedExtracted);
  const enteredTokens = tokenizeName(cleanedEntered);

  if (enteredTokens.length === 0) {
    if (IS_DEV) console.debug('[Aadhaar] compareNames: no entered tokens after cleaning');
    return { match: false, confidenceScore: 0, cleanedExtractedName: cleanedExtracted, cleanedEnteredName: cleanedEntered };
  }

  const { exactMatches, fuzzyMatches } = countTokenMatches(extractedTokens, enteredTokens);
  const totalEntered = enteredTokens.length;
  const tokenMatchRatio = totalEntered > 0 ? (exactMatches + fuzzyMatches) / totalEntered : 0;
  const fuzzyContribution = Math.min(1, (exactMatches * 1.0 + fuzzyMatches * 0.8) / Math.max(1, totalEntered));

  let substringScore = 0;
  if (cleanedEntered && (docCleaned.includes(cleanedEntered) || cleanedExtracted.includes(cleanedEntered))) {
    substringScore = 1;
  } else if (cleanedExtracted && cleanedEntered.includes(cleanedExtracted)) {
    substringScore = 0.8;
  } else {
    const enteredInDoc = enteredTokens.filter((t) => docCleaned.includes(t)).length;
    substringScore = totalEntered > 0 ? enteredInDoc / totalEntered : 0;
  }

  const confidenceScore =
    TOKEN_WEIGHT * tokenMatchRatio + FUZZY_WEIGHT * fuzzyContribution + SUBSTRING_WEIGHT * substringScore;
  const matchingTokens = exactMatches + fuzzyMatches;
  const match =
    confidenceScore >= MATCH_THRESHOLD && matchingTokens >= MIN_MATCHING_TOKENS;

  if (IS_DEV) {
    console.debug('[Aadhaar] Name verification', {
      rawExtracted: (extracted || '').slice(0, 80),
      cleanedExtractedName: cleanedExtracted,
      cleanedEnteredName: cleanedEntered,
      extractedTokens,
      enteredTokens,
      exactMatches,
      fuzzyMatches,
      tokenMatchRatio: tokenMatchRatio.toFixed(2),
      substringScore: substringScore.toFixed(2),
      confidenceScore: confidenceScore.toFixed(2),
      match,
    });
  }

  return {
    match,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    cleanedExtractedName: cleanedExtracted,
    cleanedEnteredName: cleanedEntered,
  };
}

// ─── DOB (unchanged logic) ───────────────────────────────────────────────────

export function compareDob(extracted, entered) {
  if (!extracted || !entered) return false;
  const parseDate = (d) => {
    if (d instanceof Date) return d.getTime();
    const str = String(d).replace(/\D/g, '');
    if (str.length === 8) {
      const y = parseInt(str.slice(4, 8), 10);
      if (y >= 1900 && y <= 2100) {
        const d1 = parseInt(str.slice(0, 2), 10);
        const m1 = parseInt(str.slice(2, 4), 10);
        if (d1 >= 1 && d1 <= 31 && m1 >= 1 && m1 <= 12) return new Date(y, m1 - 1, d1).getTime();
        const y2 = parseInt(str.slice(0, 4), 10);
        const m2 = parseInt(str.slice(4, 6), 10);
        const d2 = parseInt(str.slice(6, 8), 10);
        if (y2 >= 1900 && y2 <= 2100 && m2 >= 1 && m2 <= 12 && d2 >= 1 && d2 <= 31)
          return new Date(y2, m2 - 1, d2).getTime();
      }
      return new Date(d).getTime();
    }
    return new Date(d).getTime();
  };
  const t1 = parseDate(extracted);
  const t2 = parseDate(entered);
  return !isNaN(t1) && !isNaN(t2) && t1 === t2;
}

export function extractAadhaarLast4(text) {
  if (!text) return null;
  const match = text.match(/\b\d{4}\s*\d{4}\s*(\d{4})\b/);
  return match ? match[1].replace(/\D/g, '').slice(-4) : null;
}

// ─── 6. PDF vs Image name extraction ─────────────────────────────────────────

/**
 * Extract name candidate from full text:
 * - Line before DOB
 * - Line after DOB
 * - Longest line that looks like uppercase name (letters/spaces, 3–70 chars)
 */
function extractNameFromText(text) {
  const raw = (text || '').replace(/\r\n/g, '\n');
  const lines = raw
    .split(/\n/)
    .map((l) => l.replace(/[^\w\s\-\.]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((l) => l.length >= 2);

  const candidates = [];
  const dobPattern = /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b|\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/;

  for (let i = 0; i < lines.length; i++) {
    if (dobPattern.test(lines[i])) {
      if (i > 0 && /[A-Za-z]{3,}/.test(lines[i - 1]) && !/^\d[\d\s\/\-]+$/.test(lines[i - 1]))
        candidates.push(lines[i - 1]);
      if (i + 1 < lines.length && /[A-Za-z]{3,}/.test(lines[i + 1]) && !/^\d[\d\s\/\-]+$/.test(lines[i + 1]))
        candidates.push(lines[i + 1]);
    }
  }

  const nameLike = lines.filter(
    (l) =>
      l.length >= 3 &&
      l.length <= 70 &&
      /[A-Za-z]{2,}/.test(l) &&
      !/\d{4}/.test(l) &&
      !/^(male|female|m|f)$/i.test(l.trim())
  );
  const longestUppercase = nameLike
    .filter((l) => /^[A-Z\s\.\-]+$/.test(l) || l === l.toUpperCase())
    .sort((a, b) => b.length - a.length)[0];
  if (longestUppercase) candidates.push(longestUppercase);

  const byLabel = lines.findIndex((l) => /^(to|name)\s*:?\s*/i.test(l));
  if (byLabel >= 0) {
    const rest = lines[byLabel].replace(/^(to|name)\s*:?\s*/i, '').trim();
    if (rest.length >= 3) candidates.push(rest);
    if (lines[byLabel + 1] && /[A-Za-z]{2,}/.test(lines[byLabel + 1])) candidates.push(lines[byLabel + 1]);
  }

  const govIdx = lines.findIndex((l) => /government|india|unique|uidai/i.test(l));
  if (govIdx > 0 && lines[govIdx - 1] && /[A-Za-z]{2,}/.test(lines[govIdx - 1]))
    candidates.push(lines[govIdx - 1]);

  for (const l of nameLike) {
    if (!candidates.includes(l)) candidates.push(l);
  }

  const firstNonNumeric = lines.find((l) => /[A-Za-z]{2,}/.test(l) && !/^\d[\d\s\/\-]*$/.test(l));
  if (firstNonNumeric && !candidates.length)
    candidates.push(firstNonNumeric.split(/\d{4}/)[0].trim() || firstNonNumeric);

  return candidates[0] || '';
}

function extractDobFromText(text) {
  const raw = (text || '').replace(/\r\n/g, '\n');
  const ymdMatch = raw.match(/\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/);
  if (ymdMatch) {
    const [, y, mo, d] = ymdMatch;
    const yr = parseInt(y, 10);
    const mn = parseInt(mo, 10);
    const dy = parseInt(d, 10);
    if (yr >= 1900 && yr <= 2100 && mn >= 1 && mn <= 12 && dy >= 1 && dy <= 31)
      return `${yr}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const dmyMatch =
    raw.match(/\b(?:dob|date\s*of\s*birth)\s*:?\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/i) ||
    raw.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (dmyMatch) {
    const [, d, mo, y] = dmyMatch;
    const dy = parseInt(d, 10);
    const mn = parseInt(mo, 10);
    const yr = parseInt(y, 10);
    if (yr >= 1900 && yr <= 2100 && mn >= 1 && mn <= 12 && dy >= 1 && dy <= 31)
      return `${yr}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return '';
}

const extractFromText = (text, userName = '') => {
  const name = extractNameFromText(text);
  const dob = extractDobFromText(text);
  const aadhaarMatch = (text || '').match(/(\d{4})\s*(\d{4})\s*(\d{4})/);
  const aadhaarLast4 = aadhaarMatch ? aadhaarMatch[3] : null;

  let chosenName = name;
  if (userName && name) {
    const result = compareNames(name, userName, text);
    if (result.match) chosenName = name;
  }

  return { name: chosenName || name, dob, aadhaarLast4 };
};

// ─── File text extraction (PDF / Image) ──────────────────────────────────────

const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  if (ext === '.pdf') {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    const text = (data.text || '').trim();
    return text || '';
  }

  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    try {
      const Tesseract = (await import('tesseract.js')).default;
      const { data } = await Tesseract.recognize(buffer, 'eng');
      return (data.text || '').trim();
    } catch (err) {
      if (IS_DEV) console.warn('[Aadhaar] OCR failed for image:', err.message);
      return '';
    }
  }

  return '';
};

// ─── Public verification API ──────────────────────────────────────────────────

/**
 * Verify Aadhaar document. Returns nameMatch (boolean), confidenceScore, cleaned names, etc.
 */
export async function verifyAadhaarDocument(filePath, userName, userDob) {
  const text = await extractTextFromFile(filePath);

  if (IS_DEV) {
    console.debug('[Aadhaar] OCR text length:', (text || '').length, 'first 200 chars:', (text || '').slice(0, 200));
  }

  const noUsableText = !text || text.trim().length < 20;
  if (noUsableText) {
    if (IS_DEV) console.debug('[Aadhaar] No usable text; manual review');
    return {
      nameMatch: null,
      dobMatch: null,
      aadhaarLast4: null,
      extractedName: '',
      extractedDob: '',
      allMatch: false,
      confidenceScore: 0,
      cleanedExtractedName: '',
      cleanedEnteredName: cleanName(userName),
      manualReviewReason:
        'Document could not be read automatically. Please ensure PDF has selectable text, or upload a clear image (JPG/PNG).',
    };
  }

  const { name, dob, aadhaarLast4 } = extractFromText(text, userName);
  const nameResult = compareNames(name || '', userName, text);
  const dobMatch = dob ? compareDob(dob, userDob) : false;

  if (IS_DEV) {
    console.debug('[Aadhaar] Final', {
      extractedName: name,
      nameMatch: nameResult.match,
      confidenceScore: nameResult.confidenceScore,
      dobMatch,
    });
  }

  return {
    nameMatch: nameResult.match,
    dobMatch,
    aadhaarLast4: aadhaarLast4 || extractAadhaarLast4(text),
    extractedName: name,
    extractedDob: dob,
    allMatch: nameResult.match && dobMatch,
    confidenceScore: nameResult.confidenceScore,
    cleanedExtractedName: nameResult.cleanedExtractedName,
    cleanedEnteredName: nameResult.cleanedEnteredName,
    manualReviewReason: null,
  };
}

export { cleanName, tokenizeName, levenshtein, tokensSimilar };
