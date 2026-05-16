import { describe, expect, it } from "vitest";
import {
  normalizeSimilarityScore,
  parsePineconeMetadataToVectorMetadata,
  sortVectorMetadataByTimestampAsc,
} from "./retrieve-messages-utils";

describe("parsePineconeMetadataToVectorMetadata", () => {
  it("maps full metadata", () => {
    expect(
      parsePineconeMetadataToVectorMetadata(
        {
          messageId: "m1",
          conversationId: "c1",
          senderId: "u1",
          senderUsername: "ada",
          text: "hello",
          timestamp: 1000,
        },
        "vec-id",
        "fallback"
      )
    ).toEqual({
      messageId: "m1",
      conversationId: "c1",
      senderId: "u1",
      senderUsername: "ada",
      text: "hello",
      timestamp: 1000,
    });
  });

  it("uses recordId when messageId missing", () => {
    expect(
      parsePineconeMetadataToVectorMetadata(
        { timestamp: 1, text: "x" },
        "doc-99",
        "conv"
      )
    ).toMatchObject({ messageId: "doc-99", conversationId: "conv" });
  });

  it("returns null when metadata undefined", () => {
    expect(
      parsePineconeMetadataToVectorMetadata(undefined, "id", "c")
    ).toBeNull();
  });
});

describe("normalizeSimilarityScore", () => {
  it("clamps to 0–1", () => {
    expect(normalizeSimilarityScore(0.8)).toBe(0.8);
    expect(normalizeSimilarityScore(-1)).toBe(0);
    expect(normalizeSimilarityScore(2)).toBe(1);
    expect(normalizeSimilarityScore(undefined)).toBe(0);
  });
});

describe("sortVectorMetadataByTimestampAsc", () => {
  it("orders by timestamp ascending", () => {
    const newest = {
      messageId: "a",
      conversationId: "c",
      senderId: "",
      senderUsername: "",
      text: "",
      timestamp: 300,
    };
    const oldest = {
      messageId: "b",
      conversationId: "c",
      senderId: "",
      senderUsername: "",
      text: "",
      timestamp: 100,
    };
    const middle = {
      messageId: "c",
      conversationId: "c",
      senderId: "",
      senderUsername: "",
      text: "",
      timestamp: 200,
    };
    expect(
      sortVectorMetadataByTimestampAsc([newest, oldest, middle])
    ).toEqual([oldest, middle, newest]);
  });
});
