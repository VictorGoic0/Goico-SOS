import React from "react";
import { StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";
import { colors, typography } from "../styles/tokens";

/**
 * MarkdownText - Renders markdown formatted text
 * @param {string} children - The markdown text to render
 * @param {Object} style - Optional custom styles for the container
 * @param {Object} textStyle - Optional custom styles for the text
 */
export default function MarkdownText({ children, style, textStyle }) {
  // Combine default text styles with custom ones
  const combinedTextStyle = {
    ...(styles.body.fontSize && { fontSize: styles.body.fontSize }),
    ...(styles.body.color && { color: styles.body.color }),
    ...(styles.body.lineHeight && { lineHeight: styles.body.lineHeight }),
    ...textStyle,
  };

  const markdownStyles = {
    body: combinedTextStyle,
    heading1: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: textStyle?.color || colors.neutral.darkest,
      marginTop: 8,
      marginBottom: 8,
    },
    heading2: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: textStyle?.color || colors.neutral.darkest,
      marginTop: 6,
      marginBottom: 6,
    },
    heading3: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: textStyle?.color || colors.neutral.darkest,
      marginTop: 4,
      marginBottom: 4,
    },
    strong: {
      fontWeight: typography.fontWeight.bold,
      color: textStyle?.color || colors.neutral.darkest,
    },
    em: {
      fontStyle: "italic",
    },
    bullet_list: {
      marginVertical: 4,
    },
    ordered_list: {
      marginVertical: 4,
    },
    list_item: {
      flexDirection: "row",
      marginVertical: 2,
    },
    bullet_list_icon: {
      fontSize: typography.fontSize.base,
      color: textStyle?.color || colors.neutral.dark,
      marginRight: 8,
      marginTop: 2,
    },
    code_inline: {
      backgroundColor: colors.neutral.lighter,
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 2,
      fontFamily: "monospace",
      fontSize: typography.fontSize.sm,
      color: colors.primary.dark,
    },
    code_block: {
      backgroundColor: colors.neutral.lighter,
      borderRadius: 8,
      padding: 12,
      marginVertical: 8,
      fontFamily: "monospace",
      fontSize: typography.fontSize.sm,
      color: colors.neutral.darkest,
    },
    fence: {
      backgroundColor: colors.neutral.lighter,
      borderRadius: 8,
      padding: 12,
      marginVertical: 8,
      fontFamily: "monospace",
      fontSize: typography.fontSize.sm,
      color: colors.neutral.darkest,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colors.neutral.light,
      paddingLeft: 12,
      marginVertical: 8,
      fontStyle: "italic",
      color: textStyle?.color || colors.neutral.mediumDark,
    },
    paragraph: {
      marginVertical: 2,
      flexWrap: "wrap",
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "flex-start",
    },
    link: {
      color: colors.primary.base,
      textDecorationLine: "underline",
    },
  };

  return (
    <Markdown style={markdownStyles} mergeStyle={true}>
      {children || ""}
    </Markdown>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.darkest,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
});
