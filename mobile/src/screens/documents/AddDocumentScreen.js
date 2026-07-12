import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import SourceOptionCard from "../../components/documents/SourceOptionCard";
import { ensureCameraPermission, ensureMediaLibraryPermission } from "../../services/PermissionService";
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, withOpacity } from "../../constants/theme";
import { ROUTES } from "../../navigation/routes";

/**
 * "Add Document — Choose Source" (Mobile.jpg screen 3). Each option uses
 * PermissionService to request camera/gallery access before launching the
 * picker, then hands the picked image/file URI to DocumentFormScreen for
 * the editable extracted-fields step.
 */
export default function AddDocumentScreen({ navigation, route }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { familyMemberId } = route.params || {};

  const goToForm = (imageUri) => {
    navigation.replace(ROUTES.DOCUMENT_FORM, { imageUri, familyMemberId });
  };

  const handleTakePhoto = async () => {
    const granted = await ensureCameraPermission();
    if (!granted) {
      Alert.alert("Camera permission needed", "Please allow camera access to take a photo of your document.");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
      if (!result.canceled && result.assets?.length) {
        goToForm(result.assets[0].uri);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChooseGallery = async () => {
    const granted = await ensureMediaLibraryPermission();
    if (!granted) {
      Alert.alert("Photo library permission needed", "Please allow photo library access to choose a document image.");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.length) {
        goToForm(result.assets[0].uri);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadFile = async () => {
    setIsProcessing(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length) {
        goToForm(result.assets[0].uri);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnterManually = () => {
    goToForm(null);
  };

  return (
    <ScreenContainer>
      <Header variant="back" title="Add Document" />
      <View style={styles.content}>
        <View style={styles.illustrationWrap}>
          <View style={styles.illustrationCircle}>
            <Ionicons name="document-attach-outline" size={40} color={COLORS.accent} />
          </View>
        </View>

        <Text style={styles.heading}>Add a new document</Text>
        <Text style={styles.subheading}>Choose how you'd like to add your document</Text>

        <SourceOptionCard
          icon="camera-outline"
          title="Take Photo"
          subtitle="Use your camera to scan a document"
          color={COLORS.accent}
          onPress={handleTakePhoto}
        />
        <SourceOptionCard
          icon="image-outline"
          title="Choose from Gallery"
          subtitle="Select an existing photo"
          color={COLORS.primary}
          onPress={handleChooseGallery}
        />
        <SourceOptionCard
          icon="document-outline"
          title="Upload File"
          subtitle="Pick a PDF or image file"
          color={COLORS.warning}
          onPress={handleUploadFile}
        />
        <SourceOptionCard
          icon="mic-outline"
          title="Speak It"
          subtitle="Describe it in your own words — AI fills the form"
          color={COLORS.accentDark}
          onPress={() => navigation.navigate(ROUTES.VOICE_ADD, { familyMemberId })}
        />

        <TouchableOpacity onPress={handleEnterManually} disabled={isProcessing} style={styles.manualLink}>
          <Text style={styles.manualLinkText}>Enter details manually instead</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  illustrationWrap: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  illustrationCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: withOpacity(COLORS.accent, 0.12),
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  subheading: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  manualLink: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  manualLinkText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.accent,
  },
});
