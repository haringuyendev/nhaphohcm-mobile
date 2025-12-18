import { View, StyleSheet } from "react-native";

export function ConversationSkeleton() {
  return (
    <View style={styles.row}>
      <View style={styles.avatar} />

      <View style={styles.content}>
        <View style={styles.lineShort} />
        <View style={styles.lineLong} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E5E7EB",
    marginRight: 12,
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  lineShort: {
    width: "40%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 10,
  },

  lineLong: {
    width: "70%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
});
