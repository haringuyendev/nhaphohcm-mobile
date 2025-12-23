import { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    FlatList,
    Image as RNImage,
    Dimensions
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { X, Upload, ChevronDown } from 'lucide-react-native';
import { TransactionType, Direction, PropertyImage } from '@/types/property';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreatePropertyMutation, useGetPropertyByIdQuery, useUpdatePropertyMutation } from '@/store/api/properties';
import { useGetDistrictsQuery, useGetPropertyTypesQuery, useGetProvincesQuery, useGetWardsQuery } from '@/store/api/filter-api';
import { useCreateMediaMutation } from '@/store/api/media';
import { useUser } from '@/hooks/use-user';
import { District, Property, Province, Ward } from '@/types';
import { lexicalToMarkdown, markdownToLexical } from '@/utils/lexical_converter';

const STEPS = ['Loại BĐS', 'Địa chỉ', 'Thông tin', 'Hình ảnh', 'Hoàn tất'];

export default function PostScreen() {
    const { id } = useLocalSearchParams();
    console.log(id);
    const router = useRouter();
    const { user } = useUser();

    // API mutations
    const [updateProperty] = useUpdatePropertyMutation();
    const [createMedia] = useCreateMediaMutation();

    // Fetch property nếu đang edit
    const { data: propertyData, isLoading: propertyLoading } = useGetPropertyByIdQuery(id as string, {
        skip: !id,
    });
    const property = propertyData as Property | undefined;

    // Data queries
    const { data: propertyTypes = [] } = useGetPropertyTypesQuery();
    const { data: provinces = [] } = useGetProvincesQuery();

    // State
    const [step, setStep] = useState(0);

    const [transactionType, setTransactionType] = useState<TransactionType>('sale');
    const [propertyType, setPropertyType] = useState<string>('');

    const [province, setProvince] = useState<Province | null>(null);
    const [district, setDistrict] = useState<District | null>(null);
    const [ward, setWard] = useState<Ward | null>(null);
    const [street, setStreet] = useState('');

    const [price, setPrice] = useState('');
    const [priceUnit, setPriceUnit] = useState<'million' | 'billion'>('billion');
    const [area, setArea] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [floors, setFloors] = useState('');
    const [direction, setDirection] = useState<Direction>('east');

    const [title, setTitle] = useState('');
    const [markdownDescription, setMarkdownDescription] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    const [images, setImages] = useState<PropertyImage[]>([]); // local + uploaded

    // Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState<any[]>([]);
    const [modalField, setModalField] = useState<{ title: string; value: string }>({
        title: '',
        value: '',
    });

    // Districts & Wards
    const { data: districts = [] } = useGetDistrictsQuery(
        { provinceCode: province?.code },
        { skip: !province }
    );
    const { data: wards = [] } = useGetWardsQuery(
        { districtCode: district?.code },
        { skip: !district }
    );
    console.log(markdownDescription);
    // Load data khi edit
    useEffect(() => {
        if (id && property && !propertyLoading) {
            console.log(property);
            // Basic info
            setTitle(property.title || '');
            setPropertyType((property.type.id as any) || '');
            setPrice(property.price ? (property.price / (property.price >= 1e9 ? 1e9 : 1e6)).toString() : '');
            setPriceUnit(property.price >= 1e9 ? 'billion' : 'million');
            setArea(property.area?.toString() || '');
            setBedrooms(property.bedrooms?.toString() || '');
            setBathrooms(property.bathrooms?.toString() || '');
            if (property.description) {
                const md = lexicalToMarkdown(property.description);
                setMarkdownDescription(md);
            } else {
                setMarkdownDescription('');
            }
            console.log(property.description)
            // Address
            setProvince((property.province as any) || null);
            setDistrict((property.district as any) || null);
            setWard((property.ward as any) || null);
            setStreet(property.address?.split(', ')[0] || '');

            // Description (giả sử là lexical JSON → convert sang markdown nếu cần)
            // Nếu bạn lưu markdown, thì setMarkdownDescription(property.descriptionMarkdown)
            // Nếu là lexical, cần convert ngược

            // Images (đã upload)
            if (property.images) {
                setImages(
                    property.images.map((img: any) => ({
                        id: img.image.id,
                        uri: img.image.url,
                    }))
                );
            }
        }
    }, [property, propertyLoading, id, user]);

    // Modal handlers
    const openModal = (field: { title: string; value: string }) => {
        setModalField(field);
        if (field.value === 'province') setModalData(provinces);
        if (field.value === 'district') setModalData(districts);
        if (field.value === 'ward') setModalData(wards);
        setModalVisible(true);
    };

    const handleSelect = (item: any) => {
        if (modalField.value === 'province') {
            setProvince(item);
            setDistrict(null);
            setWard(null);
        } else if (modalField.value === 'district') {
            setDistrict(item);
            setWard(null);
        } else if (modalField.value === 'ward') {
            setWard(item);
        }
        setModalVisible(false);
    };

    // Image picker
    const pickImage = async () => {
        if (images.length >= 20) {
            Alert.alert('Giới hạn', 'Tối đa 20 ảnh');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newImages: PropertyImage[] = result.assets.map((asset, i) => ({
                id: `local-${Date.now()}-${i}`,
                uri: asset.uri,
            }));
            setImages((prev) => [...prev, ...newImages].slice(0, 20));
        }
    };

    const removeImage = (id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
    };

    const canNext = () => {
        switch (step) {
            case 0:
                return transactionType && propertyType;
            case 1:
                return province && district && ward;
            case 2:
                return price && area;
            case 3:
                return images.length > 0;
            case 4:
                return title && markdownDescription;
            default:
                return true;
        }
    };

    const handleSubmit = async () => {
        try {
            // Upload new images
            const uploadedImages = [...images.filter((img) => img.id.startsWith('local-'))];
            const existingImages = images.filter((img) => !img.id.startsWith('local-'));

            const newMediaIds = [];
            for (let i = 0; i < uploadedImages.length; i++) {
                const img = uploadedImages[i];
                const formData = new FormData();
                formData.append('file', {
                    uri: img.uri,
                    name: `property_${Date.now()}_${i}.jpg`,
                    type: 'image/jpeg',
                } as any);

                const alt = i === 0 ? `Ảnh đại diện: ${title}` : `Ảnh chi tiết ${i + 1}`;
                formData.append('_payload', JSON.stringify({ alt }));

                const res = await createMedia(formData).unwrap();
                newMediaIds.push({ image: res.doc?.id || res.id });
            }

            // Combine old + new images
            const finalImages = [
                ...existingImages.map((img) => ({ image: img.id })),
                ...newMediaIds,
            ];

            const priceVal = parseFloat(price) * (priceUnit === 'billion' ? 1e9 : 1e6);
            const descriptionLexicalJson = markdownToLexical(markdownDescription);
            console.log(markdownDescription, descriptionLexicalJson);
            const data: Partial<Property> = {
                title,
                type: propertyType,
                price: priceVal,
                area: parseFloat(area),
                bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
                bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
                address: `${street ? street + ', ' : ''}${ward?.name}, ${district?.name}, ${province?.name}`,
                description: JSON.parse(descriptionLexicalJson),
                images: finalImages,
                province: province?.id,
                district: district?.id,
                ward: ward?.id,
                is_published: true,
                seller: user?.id,
            };

            await updateProperty({ id: id as string, data }).unwrap();
            Alert.alert('Thành công', 'Tin đăng đã được cập nhật!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err) {
            console.error(err);
            Alert.alert('Lỗi', 'Không thể lưu tin đăng. Vui lòng thử lại.');
        }
    };

    const next = () => {
        if (!canNext()) return;
        if (step === STEPS.length - 1) {
            handleSubmit();
        } else {
            setStep(step + 1);
        }
    };

    const back = () => step > 0 && setStep(step - 1);

    const renderStep = () => {
        if (step === 0) return (
            <View>
                <Text style={styles.title}>Loại giao dịch</Text>

                <View style={{ gap: 10 }}>
                    {[
                        { label: "Bán", value: "sale" },
                        { label: "Cho thuê", value: "rent" },
                    ].map(item => (
                        <TouchableOpacity
                            key={item.value}
                            style={[
                                styles.cardOption,
                                transactionType === item.value && styles.cardOptionActive
                            ]}
                            onPress={() => setTransactionType(item.value as TransactionType)}
                        >
                            <Text style={[
                                styles.cardOptionText,
                                transactionType === item.value && styles.cardOptionTextActive
                            ]}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.title, { marginTop: 20 }]}>Loại BĐS</Text>

                <View style={{ gap: 10 }}>
                    {propertyTypes.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.cardOption,
                                propertyType === item.id && styles.cardOptionActive
                            ]}
                            onPress={() => setPropertyType(item.id)}
                        >
                            <Text style={[
                                styles.cardOptionText,
                                propertyType === item.id && styles.cardOptionTextActive
                            ]}>{item.label || item.value}</Text> {/* Assume 'name' field */}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );

        if (step === 1) return (
            <View>
                <Text style={styles.title}>Địa chỉ</Text>

                <Text style={styles.label}>Tỉnh/Thành phố *</Text>
                <DropdownField
                    value={provinces.find(p => p.id === province?.id)?.name}
                    placeholder="Chọn Tỉnh/Thành phố"
                    onPress={() => openModal({ title: 'Tỉnh/Thành phố', value: 'province' })}
                />

                <Text style={styles.label}>Quận/Huyện *</Text>
                <DropdownField
                    value={districts.find(d => d.id === district?.id)?.name}
                    placeholder="Chọn Quận/Huyện"
                    disabled={!province}
                    onPress={() => province && openModal({ title: 'Quận/Huyện', value: 'district' })}
                />

                <Text style={styles.label}>Phường/Xã *</Text>
                <DropdownField
                    value={wards.find(w => w.id === ward?.id)?.name}
                    placeholder="Chọn Phường/Xã"
                    disabled={!district}
                    onPress={() => district && openModal({ title: 'Phường/Xã', value: 'ward' })}
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

        if (step === 2) return (
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
                        style={[styles.unitBtn, priceUnit === 'million' && styles.unitBtnActive]}
                        onPress={() => setPriceUnit("million")}
                    >
                        <Text style={[styles.unitText, priceUnit === 'million' && styles.unitTextActive]}>Triệu</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.unitBtn, priceUnit === 'billion' && styles.unitBtnActive]}
                        onPress={() => setPriceUnit("billion")}
                    >
                        <Text style={[styles.unitText, priceUnit === 'billion' && styles.unitTextActive]}>Tỷ</Text>
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
                    ].map(item => (
                        <TouchableOpacity
                            key={item.value}
                            style={[styles.cardOption, direction === item.value && styles.cardOptionActive]}
                            onPress={() => setDirection(item.value as Direction)}
                        >
                            <Text style={[styles.cardOptionText, direction === item.value && styles.cardOptionTextActive]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );

        if (step === 3) return (
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

        if (step === 4) return (
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
                            { width: `${((step + 1) / STEPS.length) * 100}%` }
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
                <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
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
                                <Text style={styles.modalItemText}>{item.name}</Text> {/* Assume 'name' field */}
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

const width = Dimensions.get("window").width;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    progress: { padding: 16 },
    progressBg: {
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 4
    },
    progressFill: {
        height: 4,
        backgroundColor: '#EF4444',
        borderRadius: 4
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
        marginBottom: 16
    },

    label: {
        fontSize: 15,
        color: '#374151',
        marginBottom: 6,
        marginTop: 12
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
        alignItems: 'center'
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
        marginBottom: 12
    },

    cardOption: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        padding: 14,
        borderRadius: 10
    },
    cardOptionActive: {
        borderColor: '#EF4444',
        backgroundColor: '#FFECEC'
    },
    cardOptionText: {
        fontSize: 15,
        color: '#374151'
    },
    cardOptionTextActive: {
        color: '#EF4444',
        fontWeight: '700'
    },

    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },

    unitBtn: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB'
    },
    unitBtnActive: {
        borderColor: '#EF4444',
        backgroundColor: "#FFECEC"
    },
    unitText: { fontSize: 14, color: '#374151' },
    unitTextActive: { color: '#EF4444', fontWeight: '700' },

    directionList: {
        marginTop: 6,
        gap: 10
    },

    uploadBtn: {
        borderWidth: 1.5,
        borderColor: "#D1D5DB",
        borderStyle: "dashed",
        borderRadius: 14,
        padding: 40,
        alignItems: "center",
        marginBottom: 20,
        backgroundColor: "#F9FAFB"
    },
    uploadText: { fontSize: 16, fontWeight: "600", marginTop: 12, color: "#111" },
    uploadSub: { color: "#777", marginTop: 4 },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10
    },
    gridItem: {
        width: (width - 80) / 3,
        aspectRatio: 1,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#F3F4F6",
        position: "relative"
    },
    img: { width: "100%", height: "100%" },

    badge: {
        position: "absolute",
        bottom: 6,
        left: 6,
        backgroundColor: "#EF4444",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4
    },
    badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

    removeImg: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 6,
        borderRadius: 15
    },

    sub: { color: '#6B7280', marginBottom: 20 },

    footer: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#E5E7EB'
    },

    back: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center'
    },
    backText: {
        fontWeight: '600',
        color: '#374151'
    },

    next: {
        flex: 2,
        backgroundColor: '#EF4444',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center'
    },
    nextDisabled: {
        backgroundColor: "#F3A9A9"
    },
    nextText: {
        fontWeight: '700',
        color: '#fff'
    },

    modalHeader: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    modalClose: {
        color: '#EF4444',
        fontSize: 16
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600'
    },
    modalItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#F0F0F0'
    },
    modalItemText: {
        fontSize: 15,
        color: '#111'
    }
});