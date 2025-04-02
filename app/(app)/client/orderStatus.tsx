import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.locationLabel}>Your location</Text>
        <Text style={styles.location}>New York, Las Cruces</Text>
        <TouchableOpacity>
          <Text style={styles.selectDate}>Select date to reservation</Text>
        </TouchableOpacity>
      </View>

      {/* Promotions */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Image
            source={{ uri: 'https://via.placeholder.com/400x200' }}
            style={styles.promoImage}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Celebrate Love at GourmetGrove</Text>
            <Text style={styles.cardText}>Treat your special someone to our exclusive Valentine's menu.</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu categories (simulados) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {['Specials', 'Seasonal', 'Appetizers', 'Main Courses', 'Desserts'].map((tab, index) => (
            <Text key={index} style={styles.tab}>{tab}</Text>
          ))}
        </ScrollView>

        {/* Food cards */}
        <View style={styles.foodContainer}>
          {[
            { name: "Lemon Butter Salmon", price: "$22.00", rating: "4.8", img: 'https://via.placeholder.com/150' },
            { name: "Herb-Crusted Chicken", price: "$20.00", rating: "4.6", img: 'https://via.placeholder.com/150' }
          ].map((item, i) => (
            <View key={i} style={styles.foodCard}>
              <Image source={{ uri: item.img }} style={styles.foodImage} />
              <Text style={styles.foodTitle}>{item.name}</Text>
              <Text style={styles.foodPrice}>{item.price}</Text>
              <Text style={styles.foodRating}>⭐ {item.rating}</Text>
            </View>
          ))}
        </View>

        {/* Upcoming Events */}
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <View style={styles.eventCard}>
          <Text style={styles.eventTitle}>Secret Menu Access</Text>
          <Text style={styles.eventText}>Order a surprise dish and enjoy a unique creation.</Text>
          <Text style={styles.eventSeats}>2 Seats Left - Feb 16, 2024</Text>
        </View>
        <View style={styles.eventCard}>
          <Text style={styles.eventTitle}>Mystery Dish Challenge</Text>
          <Text style={styles.eventText}>Exclusive dishes not listed on the regular menu.</Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {['home', 'restaurant-menu', 'shopping-cart', 'person'].map((icon, i) => (
          <Icon key={i} name={icon} type="material" color="#000" />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#000', padding: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  locationLabel: { color: '#aaa', fontSize: 12 },
  location: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  selectDate: { color: '#ffa500', fontSize: 14, marginTop: 4 },
  scroll: { padding: 16 },
  card: { backgroundColor: '#f4f4f4', borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  promoImage: { width: '100%', height: 180 },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardText: { fontSize: 14, color: '#555' },
  button: { backgroundColor: '#ff6600', padding: 10, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff' },
  tabs: { flexDirection: 'row', marginVertical: 10 },
  tab: { marginRight: 16, fontSize: 14, color: '#333' },
  foodContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  foodCard: { width: '48%', backgroundColor: '#fafafa', padding: 10, borderRadius: 12 },
  foodImage: { width: '100%', height: 100, borderRadius: 10 },
  foodTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 6 },
  foodPrice: { fontSize: 13, color: '#888' },
  foodRating: { fontSize: 12, color: '#ffa500' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  eventCard: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 10, marginBottom: 12 },
  eventTitle: { fontWeight: 'bold', fontSize: 14 },
  eventText: { fontSize: 13, color: '#555' },
  eventSeats: { fontSize: 12, color: '#ff6600', marginTop: 4 },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
  },
});
