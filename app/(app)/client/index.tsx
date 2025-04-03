import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView>
        <View style={styles.header}> 
          <Ionicons name="location-outline" size={20} color="#ff6b00" />
          <Text style={styles.location}>New York, Las Cruces</Text>
          <TouchableOpacity style={styles.dateSelector}> 
            <Text style={styles.dateText}>Select date to reservation</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.banner}> 
          <Text style={styles.bannerText}>Celebrate Love at GourmetGrove</Text>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsText}>Details</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Specials</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: '' }} style={styles.image} />
              <Text style={styles.itemName}>Item Name</Text>
              <Text style={styles.price}>$0.00</Text>
            </View>
          )}
        />
        
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <FlatList
          data={[]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.eventCard}>
              <Image source={{ uri: '' }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <Text style={styles.itemName}>Event Name</Text>
                <Text style={styles.date}>Event Date</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  location: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginLeft: 5 },
  dateSelector: { padding: 10, backgroundColor: '#222', borderRadius: 10 },
  dateText: { color: '#fff', textAlign: 'center' },
  banner: { backgroundColor: '#333', padding: 20, borderRadius: 15, marginBottom: 20, alignItems: 'center' },
  bannerText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  detailsButton: { backgroundColor: '#ff6b00', padding: 10, borderRadius: 10, marginTop: 10 },
  detailsText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginVertical: 10 },
  card: { marginRight: 16, width: 160, backgroundColor: '#1e1e1e', padding: 10, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
  image: { width: '100%', height: 100, borderRadius: 10 },
  itemName: { fontSize: 16, fontWeight: 'bold', marginTop: 5, color: '#fff' },
  price: { fontSize: 14, color: 'gray' },
  eventCard: { flexDirection: 'row', marginBottom: 16, alignItems: 'center', backgroundColor: '#1e1e1e', padding: 10, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
  eventImage: { width: 80, height: 80, borderRadius: 10 },
  eventInfo: { marginLeft: 10 },
  date: { fontSize: 14, color: 'gray' },
});

