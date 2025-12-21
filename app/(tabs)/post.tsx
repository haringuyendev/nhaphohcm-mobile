import { useUser } from '@/hooks/use-user';
import {
  useGetDistrictsQuery,
  useGetPropertyTypesQuery,
  useGetProvincesQuery,
  useGetWardsQuery,
} from '@/store/api/filter-api';
import { useCreateMediaMutation } from '@/store/api/media';
import { useCreatePropertyMutation } from '@/store/api/properties';
import { District, Province, Ward } from '@/types';
import { Direction, PropertyImage, TransactionType } from '@/types/property';
import { markdownToLexical } from '@/utils/lexical_converter';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { ChevronDown, Upload, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Adjust path as needed

const STEPS = ['Loại BĐS', 'Địa chỉ', 'Thông tin', 'Hình ảnh', 'Hoàn tất'];

export default function PostScreen() {
  const router = useRouter();
  const [createProperty] = useCreatePropertyMutation();
  const [createMedia] = useCreateMediaMutation();

  const { user } = useUser();
  const [province, setProvince] = useState<Province | null>(null); // ID
  const [district, setDistrict] = useState<District | null>(null); // ID
  const [ward, setWard] = useState<Ward | null>(null); // ID
  const [street, setStreet] = useState('');
  const [markdownDescription, setMarkdownDescription] = useState<string>('');

  const { data: propertyTypes = [] } = useGetPropertyTypesQuery();
  const { data: provinces = [] } = useGetProvincesQuery();
  const { data: districts = [] } = useGetDistrictsQuery(
    { provinceCode: province?.code },
    { skip: !province }
  );
  const { data: wards = [] } = useGetWardsQuery(
    { districtCode: district?.code },
    { skip: !district }
  );

  const [step, setStep] = useState(0);

  const [transactionType, setTransactionType] =
    useState<TransactionType>('sale');
  const [propertyType, setPropertyType] = useState<string>(''); // ID of property_type

  const [modalData, setModalData] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalField, setModalField] = useState({
    title: '',
    value: '',
  });

  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState<'million' | 'billion'>('billion');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [floors, setFloors] = useState('');
  const [direction, setDirection] = useState<Direction>('east');

  const [images, setImages] = useState<PropertyImage[]>([]);

  const [title, setTitle] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const openModal = (field: { title: string; value: string }) => {
    setModalField(field);

    if (field.value === 'province') setModalData(provinces);
    if (field.value === 'district') setModalData(districts);
    if (field.value === 'ward') setModalData(wards);
    if (field.value === 'propertyType') setModalData(propertyTypes); // Added for propertyType if needed, but using cards

    setModalVisible(true);
  };

  const handleSelect = (item: any) => {
    if (modalField.value === 'province') {
      setProvince(item);
      setDistrict(null);
      setWard(null);
    }
    if (modalField.value === 'district') {
      setDistrict(item);
      setWard(null);
    }
    if (modalField.value === 'ward') {
      setWard(item);
    }
    setModalVisible(false);
  };

  const pickImage = async () => {
    if (images.length >= 20) {
      Alert.alert('Giới hạn 20 ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      // allowsEditing: true, // nếu muốn crop
    });

    if (!result.canceled) {
      const newImgs: PropertyImage[] = result.assets.map((asset, index) => ({
        id: `${Date.now()}-${index}`,
        uri: asset.uri,
      }));
      setImages((prev) => [...prev, ...newImgs].slice(0, 20));
    }
  };

  const removeImage = (id: string) => {
    setImages(images.filter((i) => i.id !== id));
  };

  const canNext = () => {
    if (step === 0) return transactionType && propertyType;
    if (step === 1) return province && district && ward;
    if (step === 2) return price && area;
    if (step === 3) return images.length > 0;
    if (step === 4)
      return title && markdownDescription && contactName && contactPhone;
    return true;
  };

  const handleSubmit = async () => {
    try {
      // Upload images
      const uploadedImages = [];
      for (let index = 0; index < images.length; index++) {
        const img = images[index];
        const formData = new FormData();

        // Append file (field name PHẢI là 'file')
        formData.append('file', {
          uri: img.uri,
          name: `property_${Date.now()}_${index}.jpg`,
          type: 'image/jpeg',
        } as any);

        // Append alt text (và các field khác nếu cần)
        // Ở đây mình dùng title property làm alt, hoặc fallback "Ảnh đại diện" / "Ảnh chi tiết"
        const altText =
          index === 0
            ? `Ảnh đại diện: ${title || 'Tin đăng bất động sản'}`
            : `Ảnh chi tiết ${index + 1}: ${title || 'Tin đăng bất động sản'}`;

        const payloadJson = JSON.stringify({
          alt: altText,
          // Nếu có field khác required (ví dụ caption, title...), thêm vào đây
        });

        formData.append('_payload', payloadJson);

        const mediaResponse = await createMedia(formData).unwrap();

        // Payload thường trả về { doc: { id } } hoặc trực tiếp { id }
        const mediaId = mediaResponse.doc?.id || mediaResponse.id;
        uploadedImages.push({ image: mediaId });
      }

      // Prepare data
      const wardName = wards.find((w) => w.id === ward?.id)?.name || '';
      const districtName =
        districts.find((d) => d.id === district?.id)?.name || '';
      const provinceName =
        provinces.find((p) => p.id === province?.id)?.name || '';

      const fullAddress = `${
        street ? street + ', ' : ''
      }${wardName}, ${districtName}, ${provinceName}`;

      const priceVal =
        parseFloat(price) * (priceUnit === 'billion' ? 1000000000 : 1000000);
      const descriptionLexicalJson = markdownToLexical(markdownDescription);
      console.log(descriptionLexicalJson);

      const data = {
        title,
        type: propertyType, // ID from relationship
        price: priceVal,
        area: parseFloat(area),
        bedrooms: parseInt(bedrooms) || undefined,
        bathrooms: parseInt(bathrooms) || undefined,
        address: fullAddress,
        description: JSON.parse(descriptionLexicalJson),
        // description, // Assume server converts to richText if needed
        images: uploadedImages,
        province: province?.id,
        district: district?.id,
        ward: ward?.id,
        is_published: true,
        is_hidden: false,
        is_vip: false,
        seller: user?.id,
      };

      await createProperty(data).unwrap();

      Alert.alert('Thành công', 'Tin đăng của bạn đã được đăng!', [
        { text: 'OK', onPress: () => router.push('/myposts' as any) },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đăng tin. Vui lòng thử lại.');
      console.error(error);
    }
  };

  const next = () => {
    if (!canNext()) return;
    if (step < STEPS.length - 1) return setStep(step + 1);
    handleSubmit();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const renderStep = () => {
    if (step === 0)
      return (
        <View>
          <Text style={styles.title}>Loại giao dịch</Text>

          <View style={{ gap: 10 }}>
            {[
              { label: 'Bán', value: 'sale' },
              { label: 'Cho thuê', value: 'rent' },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.cardOption,
                  transactionType === item.value && styles.cardOptionActive,
                ]}
                onPress={() =>
                  setTransactionType(item.value as TransactionType)
                }
              >
                <Text
                  style={[
                    styles.cardOptionText,
                    transactionType === item.value &&
                      styles.cardOptionTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.title, { marginTop: 20 }]}>Loại BĐS</Text>

          <View style={{ gap: 10 }}>
            {propertyTypes.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.cardOption,
                  propertyType === item.id && styles.cardOptionActive,
                ]}
                onPress={() => setPropertyType(item.id)}
              >
                <Text
                  style={[
                    styles.cardOptionText,
                    propertyType === item.id && styles.cardOptionTextActive,
                  ]}
                >
                  {item.label || item.value || ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );

    if (step === 1)
      return (
        <View>
          <Text style={styles.title}>Địa chỉ</Text>

          <Text style={styles.label}>Tỉnh/Thành phố *</Text>
          <DropdownField
            value={provinces.find((p) => p.id === province?.id)?.name}
            placeholder="Chọn Tỉnh/Thành phố"
            onPress={() =>
              openModal({ title: 'Tỉnh/Thành phố', value: 'province' })
            }
          />

          <Text style={styles.label}>Quận/Huyện *</Text>
          <DropdownField
            value={districts.find((d) => d.id === district?.id)?.name}
            placeholder="Chọn Quận/Huyện"
            disabled={!province}
            onPress={() =>
              province && openModal({ title: 'Quận/Huyện', value: 'district' })
            }
          />

          <Text style={styles.label}>Phường/Xã *</Text>
          <DropdownField
            value={wards.find((w) => w.id === ward?.id)?.name}
            placeholder="Chọn Phường/Xã"
            disabled={!district}
            onPress={() =>
              district && openModal({ title: 'Phường/Xã', value: 'ward' })
            }
          />

          <Text style={styles.label}>Tên đường</Text>
          <TextInput
            style={styles.input}
            value={street}
            onChangeText={setStreet}
            placeholder="Ví dụ: Nguyễn Văn Linh"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      );

    if (step === 2)
      return (
        <View>
          <Text style={styles.title}>Thông tin chi tiết</Text>

          <Text style={styles.label}>Giá *</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={price}
              onChangeText={setPrice}
              placeholder="Nhập giá"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity
              style={[
                styles.unitBtn,
                priceUnit === 'million' && styles.unitBtnActive,
              ]}
              onPress={() => setPriceUnit('million')}
            >
              <Text
                style={[
                  styles.unitText,
                  priceUnit === 'million' && styles.unitTextActive,
                ]}
              >
                Triệu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.unitBtn,
                priceUnit === 'billion' && styles.unitBtnActive,
              ]}
              onPress={() => setPriceUnit('billion')}
            >
              <Text
                style={[
                  styles.unitText,
                  priceUnit === 'billion' && styles.unitTextActive,
                ]}
              >
                Tỷ
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Diện tích (m²) *</Text>
          <TextInput
            style={styles.input}
            value={area}
            onChangeText={setArea}
            placeholder="Ví dụ: 100"
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Phòng ngủ</Text>
              <TextInput
                style={styles.input}
                value={bedrooms}
                onChangeText={setBedrooms}
                placeholder="Ví dụ: 2"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={{ width: 12 }} />

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>WC</Text>
              <TextInput
                style={styles.input}
                value={bathrooms}
                onChangeText={setBathrooms}
                placeholder="Ví dụ: 1"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <Text style={styles.label}>Số tầng</Text>
          <TextInput
            style={styles.input}
            value={floors}
            onChangeText={setFloors}
            placeholder="Ví dụ: 3"
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Hướng nhà</Text>
          <View style={styles.directionList}>
            {[
              { value: 'east', label: 'Đông' },
              { value: 'west', label: 'Tây' },
              { value: 'south', label: 'Nam' },
              { value: 'north', label: 'Bắc' },
              { value: 'northeast', label: 'Đông Bắc' },
              { value: 'southeast', label: 'Đông Nam' },
              { value: 'southwest', label: 'Tây Nam' },
              { value: 'northwest', label: 'Tây Bắc' },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.cardOption,
                  direction === item.value && styles.cardOptionActive,
                ]}
                onPress={() => setDirection(item.value as Direction)}
              >
                <Text
                  style={[
                    styles.cardOptionText,
                    direction === item.value && styles.cardOptionTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );

    if (step === 3)
      return (
        <View>
          <Text style={styles.title}>Hình ảnh (tối đa 20 ảnh)</Text>
          <Text style={styles.sub}>Ảnh đầu tiên sẽ là ảnh đại diện</Text>

          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
            <Upload size={32} color="#EF4444" />
            <Text style={styles.uploadText}>Chọn ảnh từ thư viện</Text>
            <Text style={styles.uploadSub}>{images.length}/20 ảnh</Text>
          </TouchableOpacity>

          <View style={styles.grid}>
            {images.map((img, index) => (
              <View key={img.id} style={styles.gridItem}>
                <RNImage source={{ uri: img.uri }} style={styles.img} />

                {index === 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Đại diện</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.removeImg}
                  onPress={() => removeImage(img.id)}
                >
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      );

    if (step === 4)
      return (
        <View>
          <Text style={styles.title}>Thông tin liên hệ</Text>

          <Text style={styles.label}>Tiêu đề *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ví dụ: Bán nhà mặt tiền Q.7, 100m²"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Mô tả *</Text>
          <TextInput
            style={[styles.input, { height: 150, textAlignVertical: 'top' }]}
            multiline
            placeholder="Nhập mô tả..."
            value={markdownDescription}
            onChangeText={setMarkdownDescription}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Tên liên hệ *</Text>
          <TextInput
            style={styles.input}
            value={contactName}
            onChangeText={setContactName}
            placeholder="Họ và tên"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Số điện thoại *</Text>
          <TextInput
            style={styles.input}
            value={contactPhone}
            onChangeText={setContactPhone}
            keyboardType="phone-pad"
            placeholder="0912345678"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      );

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <Stack.Screen
        options={{
          headerTitle: 'Đăng tin',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />

      <View style={styles.progress}>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${((step + 1) / STEPS.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>{STEPS[step]}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity style={styles.back} onPress={back}>
            <Text style={styles.backText}>Quay lại</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.next, !canNext() && styles.nextDisabled]}
          disabled={!canNext()}
          onPress={next}
        >
          <Text style={styles.nextText}>
            {step === STEPS.length - 1 ? 'Đăng tin' : 'Tiếp theo'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView
          edges={['top']}
          style={{ flex: 1, backgroundColor: '#fff' }}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Chọn {modalField.title}</Text>
            <View style={{ width: 40 }} />
          </View>

          <FlatList
            data={modalData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.modalItemText}>{item.name || ''}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function DropdownField({ value, onPress, placeholder, disabled }: any) {
  return (
    <TouchableOpacity
      style={[styles.dropdown, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
        {value || placeholder}
      </Text>
      <ChevronDown size={20} color="#EF4444" />
    </TouchableOpacity>
  );
}

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  progress: { padding: 16 },
  progressBg: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  progressLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  label: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },

  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownPlaceholder: { color: '#9CA3AF', fontSize: 15 },
  dropdownValue: { color: '#111827', fontSize: 15, fontWeight: '500' },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
  },

  cardOption: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 14,
    borderRadius: 10,
  },
  cardOptionActive: {
    borderColor: '#EF4444',
    backgroundColor: '#FFECEC',
  },
  cardOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  cardOptionTextActive: {
    color: '#EF4444',
    fontWeight: '700',
  },

  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  unitBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  unitBtnActive: {
    borderColor: '#EF4444',
    backgroundColor: '#FFECEC',
  },
  unitText: { fontSize: 14, color: '#374151' },
  unitTextActive: { color: '#EF4444', fontWeight: '700' },

  directionList: {
    marginTop: 6,
    gap: 10,
  },

  uploadBtn: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  uploadText: { fontSize: 16, fontWeight: '600', marginTop: 12, color: '#111' },
  uploadSub: { color: '#777', marginTop: 4 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: (width - 80) / 3,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  img: { width: '100%', height: '100%' },

  badge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  removeImg: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 15,
  },

  sub: { color: '#6B7280', marginBottom: 20 },

  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },

  back: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  backText: {
    fontWeight: '600',
    color: '#374151',
  },

  next: {
    flex: 2,
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextDisabled: {
    backgroundColor: '#F3A9A9',
  },
  nextText: {
    fontWeight: '700',
    color: '#fff',
  },

  modalHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalClose: {
    color: '#EF4444',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  modalItemText: {
    fontSize: 15,
    color: '#111',
  },
});
