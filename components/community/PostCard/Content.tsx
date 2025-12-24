// components/community/PostContent.tsx
import { Image } from 'expo-image';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { getImageUrl } from '@/utils';
import { renderLexicalNode } from '@/utils/lexical';
import { Media } from '@/types/community';

interface PostContentProps {
  content?: any;
  attachments?: { file: Media }[];
}

export function PostContent({ content, attachments }: PostContentProps) {
  return (
    <View style={styles.container}>
      {content && (
        <Text style={styles.text}>
          {renderLexicalNode(content.root)}
        </Text>
      )}

      {attachments && attachments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesContent}
        >
          {attachments.map((att, index) => (
            <Image
              key={index}
              source={{ uri: getImageUrl(att.file) }}
              style={[
                styles.image,
                attachments.length === 1 && styles.singleImage,
              ]}
              placeholder={att.file?.blurhash || 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'}
              contentFit="cover"
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  text: { fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 12 },
  imagesContent: { gap: 8, paddingVertical: 8 },
  image: { width: 280, height: 280, borderRadius: 12 },
  singleImage: { width: '100%', height: 320 },
});