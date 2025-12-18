// src/components/CategoryCard.tsx
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Home, Building, Key, Building2, Map, Briefcase } from "lucide-react-native";
import { PropertyType } from "@/types";
import { getImageUrl } from "@/utils";

interface Props {
  category: PropertyType;
  onPress: () => void;
}

const iconMap: Record<string, any> = {
  home: Home,
  building: Building,
  key: Key,
  "building-2": Building2,
  map: Map,
  briefcase: Briefcase,
};

export function CategoryCard({ category, onPress }: Props) {
  const icon = category.icon;

  const isStringIcon = typeof icon === "string";
  const IconComponent = isStringIcon ? iconMap[icon] || Home : null;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        {isStringIcon && IconComponent ? (
          <IconComponent size={28} color="#EF4444" />
        ) : icon ? (
          <Image
            source={{ uri: getImageUrl(icon) }}
            style={{ width: 32, height: 32 }}
            contentFit="contain"
          />
        ) : (
          <Home size={28} color="#EF4444" />
        )}
      </View>

      <Text style={styles.text} numberOfLines={2}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 90,
    alignItems: "center",
    marginRight: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  text: {
    fontSize: 13,
    color: "#374151",
    textAlign: "center",
    fontWeight: "500",
  },
});
