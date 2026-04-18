import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Linking, Alert, Dimensions } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - Theme.spacing.lg * 3) / 2;

type DocumentNode = {
  id: number;
  title: string;
  file_url: string;
  category: string;
  uploaded_by: number;
  date_uploaded: string;
};

export default function DocumentVaultScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents/', token as string);
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const openDocument = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Unable to Open", "No application registered to view this file type.");
      }
    } catch (err) {
      Alert.alert("Error", "Could not open document link.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={18} color={Theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Document Vault</Text>
          <View style={{ width: 44 }} />
        </View>

        <FlatList
          data={documents}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              activeOpacity={0.8}
              onPress={() => openDocument(item.file_url)}
            >
              <View style={styles.docIconHeader}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="description" size={32} color={Theme.colors.primary} />
                </View>
              </View>
              
              <View style={styles.cardFooter}>
                <View style={styles.tagContainer}>
                  <Text style={styles.tag}>{item.category}</Text>
                </View>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.date}>
                  {new Date(item.date_uploaded).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialIcons name="cloud-off" size={40} color={Theme.colors.text.muted} />
              </View>
              <Text style={styles.emptyTitle}>Vault Empty</Text>
              <Text style={styles.emptyText}>No documents found in the centralized cloud storage.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    ...Theme.shadows.soft,
  },
  backBtn: {
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.radius.md,
  },
  headerTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.text.primary,
  },
  listContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  card: {
    width: COLUMN_WIDTH,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    marginBottom: Theme.spacing.lg,
    overflow: 'hidden',
    ...Theme.shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  docIconHeader: {
    backgroundColor: Theme.colors.primaryLight,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.soft,
  },
  cardFooter: {
    padding: Theme.spacing.md,
  },
  tagContainer: {
    backgroundColor: Theme.colors.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  tag: {
    fontSize: 9,
    fontWeight: '900',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.text.primary,
    marginBottom: 6,
    lineHeight: 18,
  },
  date: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.text.muted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 120,
    paddingHorizontal: 40,
    width: width - Theme.spacing.lg * 2,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  emptyTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  }
});
