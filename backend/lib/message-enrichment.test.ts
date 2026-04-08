import { describe, expect, it } from "vitest";
import {
  SHORT_MESSAGE_WORD_THRESHOLD,
  buildEnrichedTextsForIndex,
  enrichMessageText,
  wordCount,
} from "./message-enrichment";

describe("wordCount", () => {
  it("counts words separated by whitespace", () => {
    expect(wordCount("hello world")).toBe(2);
    expect(wordCount("  a  b  c  ")).toBe(3);
  });

  it("returns 0 for empty or whitespace-only", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("   ")).toBe(0);
  });
});

describe("enrichMessageText", () => {
  it("leaves long messages unchanged", () => {
    const long = "one two three four five six seven eight nine ten";
    expect(wordCount(long)).toBeGreaterThanOrEqual(SHORT_MESSAGE_WORD_THRESHOLD);
    expect(enrichMessageText({ text: long }, { text: "ignored" })).toBe(long);
  });

  it("prepends previous text for short messages when previous exists", () => {
    expect(
      enrichMessageText({ text: "ok" }, { text: "Can you send the file?" })
    ).toBe("Can you send the file? ok");
  });

  it("leaves short first message unchanged when there is no previous", () => {
    expect(enrichMessageText({ text: "ok" }, null)).toBe("ok");
  });

  it("does not prepend when previous is empty", () => {
    expect(enrichMessageText({ text: "hi" }, { text: "   " })).toBe("hi");
  });

  it("keeps enriched text non-empty when original has text", () => {
    const out = enrichMessageText({ text: "yes" }, { text: "Are you coming?" });
    expect(out.length).toBeGreaterThan(0);
    expect(out).toContain("yes");
  });
});

describe("buildEnrichedTextsForIndex", () => {
  it("prepends prior text for short replies in sequence", () => {
    const texts = buildEnrichedTextsForIndex([
      { text: "Please confirm you received the contract." },
      { text: "ok" },
    ]);
    expect(texts[0]).toBe("Please confirm you received the contract.");
    expect(texts[1]).toContain("ok");
    expect(texts[1]).toContain("contract");
  });

  it("uses space placeholder when enriched string would be empty", () => {
    expect(buildEnrichedTextsForIndex([{ text: "" }])).toEqual([" "]);
  });
});
