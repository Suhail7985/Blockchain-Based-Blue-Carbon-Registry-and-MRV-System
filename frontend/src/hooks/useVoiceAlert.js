/**
 * useVoiceAlert — Web Speech API hook for announcing BCC token credit events.
 * No external libraries needed; works natively in Chrome, Edge, Firefox.
 */
export function useVoiceAlert() {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  /**
   * Speak a token minted announcement.
   * @param {object} params
   * @param {number} params.tokens - Number of BCC tokens minted
   * @param {number} params.co2eq - CO₂ captured in tonnes
   * @param {string} params.plantationId - Plantation ID
   * @param {string} [params.userName] - Optional user name for personalization
   */
  const announceTokenCredit = ({ tokens, co2eq, plantationId, userName }) => {
    if (!isSupported) {
      console.warn('[VoiceAlert] Web Speech API not supported in this browser.');
      return;
    }

    // Cancel any pending speech first
    window.speechSynthesis.cancel();

    const name = userName ? `, ${userName}` : '';
    const text = [
      `Congratulations${name}!`,
      `Your Blue Carbon Credits have been successfully credited.`,
      `${tokens} Blue Carbon Tokens have been minted`,
      `for plantation ${plantationId.split('').join(' ')},`, // spell out ID for clarity
      `capturing ${co2eq} tonnes of carbon dioxide.`,
      `Visit your dashboard to view your full token balance.`,
    ].join(' ');

    const utterance = new SpeechSynthesisUtterance(text);

    // Prefer Indian English, fallback to any English
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang === 'en-IN') ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null;
    if (preferred) utterance.voice = preferred;

    utterance.lang = 'en-IN';
    utterance.rate = 0.88;   // Slightly slow — clear and formal
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    utterance.onerror = (e) => {
      console.warn('[VoiceAlert] Speech synthesis error:', e.error);
    };

    window.speechSynthesis.speak(utterance);
  };

  /**
   * Speak a custom message.
   * @param {string} message
   */
  const speak = (message) => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const cancelSpeech = () => {
    if (isSupported) window.speechSynthesis.cancel();
  };

  return { announceTokenCredit, speak, cancelSpeech, isSupported };
}
