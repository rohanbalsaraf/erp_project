import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
        Alert.alert("Unable to Open Error", "Your mobile does not have a registered application to view this cloud file.");
      }
    } catch (err) {
      Alert.alert("Interception Error", "Cannot route to Safari/Chrome currently.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Vault</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={documents}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.8}
            onPress={() => openDocument(item.file_url)}
          >
            <View style={styles.docIconHeader}>
              <View style={styles.iconWrapper}>
                <MaterialIcons name="description" size={32} color="#4F46E5" />
              </View>
            </View>
            
            <View style={styles.cardFooter}>
              <Text style={styles.tag}>{item.category}</Text>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.date}>{new Date(item.date_uploaded).toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="cloud-off" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>The cloud vault is currently empty.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  docIconHeader: {
    backgroundColor: '#F9FAFB',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  iconWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardFooter: {
    padding: 16,
  },
  tag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#4F46E5',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    backgroundColor: '#EEF2FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 18,
  },
  date: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    width: '100%',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  }
});
