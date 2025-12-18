import { View, Text, StyleSheet } from "react-native";
import { CheckCircle, Heart, XCircle, Info } from "lucide-react-native";
import { JSX } from "react";

type ToastType = "success" | "removed" | "error" | "info";

interface RealEstateToastProps {
  text1: string;
  text2?: string;
  type?: ToastType;
}

export function RealEstateToast({ text1, text2, type = "info" }: RealEstateToastProps) {
  const icons: Record<ToastType, JSX.Element> = {
    success: <Heart size={26} color="#fff" />,
    removed: <XCircle size={26} color="#fff" />,
    error: <XCircle size={26} color="#fff" />,
    info: <Info size={26} color="#fff" />,
  };

  const backgrounds: Record<ToastType, string> = {
    success: "#EF4444",
    removed: "#6B7280",
    error: "#DC2626",
    info: "#3B82F6",
  };

  return (
    <View style={[styles.container, { backgroundColor: backgrounds[type] }]}>
      <View style={styles.icon}>{icons[type]}</View>

      <View style={styles.textBox}>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.sub}>{text2}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  icon: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 999,
  },
  textBox: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  sub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 2,
  },
});
