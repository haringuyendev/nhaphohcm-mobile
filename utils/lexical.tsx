import React from "react";
import { Linking, Text, View } from "react-native";

function isBold(format: number) {
  return (format & 1) !== 0;
}
function isItalic(format: number) {
  return (format & 2) !== 0;
}
function isUnderline(format: number) {
  return (format & 4) !== 0;
}

export function renderLexicalNode(node: any, key: number = 0): any {
  if (!node) return null;

  if (node.type === "root") {
    return (
      <View key={key}>
        {node.children?.map((child: any, i: number) =>
          renderLexicalNode(child, i)
        )}
      </View>
    );
  }

  // ------------------------------
  // PARAGRAPH
  // ------------------------------
  if (node.type === "paragraph") {
    return (
      <View key={key} style={{ marginBottom: 10 }}>
        {node.children?.map((child: any, i: number) =>
          renderLexicalNode(child, i)
        )}
      </View>
    );
  }

  // ------------------------------
  // TEXT NODE (PAYLOAD LEXICAL)
  // ------------------------------
  if (node.type === "text") {
    const f = node.format ?? 0;

    return (
      <Text
        key={key}
        style={{
          fontWeight: isBold(f) ? "700" : "400",
          fontStyle: isItalic(f) ? "italic" : "normal",
          textDecorationLine: isUnderline(f) ? "underline" : "none",
        }}
      >
        {node.text}
      </Text>
    );
  }

  // ------------------------------
  // LIST
  // ------------------------------
  if (node.type === "list") {
    return (
      <View key={key} style={{ marginBottom: 8 }}>
        {node.children?.map((child: any, i: number) =>
          renderLexicalNode(child, i)
        )}
      </View>
    );
  }

  // ------------------------------
  // LIST ITEM
  // ------------------------------
  if (node.type === "listitem") {
    return (
      <View
        key={key}
        style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 6 }}
      >
        <Text style={{ marginRight: 6 }}>•</Text>
        <Text style={{ flex: 1 }}>
          {node.children?.map((child: any, i: number) =>
            renderLexicalNode(child, i)
          )}
        </Text>
      </View>
    );
  }

  // ------------------------------
  // HEADING
  // ------------------------------
  if (node.type === "heading") {
    const size =
      node.tag === "h1" ? 26 :
      node.tag === "h2" ? 22 :
      node.tag === "h3" ? 20 : 18;

    return (
      <Text
        key={key}
        style={{
          fontWeight: "700",
          fontSize: size,
          marginBottom: 8,
        }}
      >
        {node.children?.map((child: any, i: number) =>
          renderLexicalNode(child, i)
        )}
      </Text>
    );
  }

  // ------------------------------
  // LINK
  // ------------------------------
  if (node.type === "link") {
    return (
      <Text
        key={key}
        style={{ color: "#2563EB" }}
        onPress={() => Linking.openURL(node.url)}
      >
        {node.children?.map((child: any, i: number) =>
          renderLexicalNode(child, i)
        )}
      </Text>
    );
  }

  return null;
}
