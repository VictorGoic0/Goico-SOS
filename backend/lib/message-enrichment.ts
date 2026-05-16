/**
 * Short-message enrichment for RAG embeddings: messages with fewer than
 * {@link SHORT_MESSAGE_WORD_THRESHOLD} words get the previous message’s text
 * prepended before embedding, so short replies (“ok”, “sounds good”) carry
 * semantic context. Original stored text is unchanged; this applies only to
 * embedding input (see PR #4).
 */

export const SHORT_MESSAGE_WORD_THRESHOLD = 10;

export function wordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0).length;
}

/**
 * @param message - Current message (uses `text`)
 * @param previousMessage - Prior message in chronological order, or null for first message
 * @returns Text to embed: long messages unchanged; short messages prepend previous when available
 */
export function enrichMessageText(
  message: { text: string },
  previousMessage: { text: string } | null
): string {
  const raw = message.text ?? "";
  if (wordCount(raw) >= SHORT_MESSAGE_WORD_THRESHOLD) {
    return raw;
  }
  if (previousMessage !== null && previousMessage.text.trim().length > 0) {
    return `${previousMessage.text.trim()} ${raw}`.trim();
  }
  return raw;
}

/**
 * Embedding inputs for a conversation in chronological order. Empty enriched
 * strings become a single space so OpenAI embedding calls always receive non-empty input.
 */
export function buildEnrichedTextsForIndex(messages: { text: string }[]): string[] {
  const texts: string[] = [];
  for (let i = 0; i < messages.length; i++) {
    const previous = i > 0 ? messages[i - 1] : null;
    const raw = enrichMessageText(
      { text: messages[i].text },
      previous ? { text: previous.text } : null
    );
    texts.push(raw.trim() === "" ? " " : raw);
  }
  return texts;
}
