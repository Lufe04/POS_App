import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type MenuItem = {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
};

const HomeScreen = () => {
  const navigation = useNavigation();

  const menuItems: MenuItem[] = [
    { id: '1', name: 'Pizza Margherita', price: '15.99', image: 'https://example.com/pizza.jpg', category: 'Main Course' },
    { id: '2', name: 'Caesar Salad', price: '8.99', image: 'https://example.com/salad.jpg', category: 'Starters' },
    // Add more items
  ];

  const renderBottomTab = () => (
    <View style={styles.bottomTab}>
      <TouchableOpacity style={styles.tabItem}>
        <Ionicons name="home" size={24} color="#ff6b00" />
        <Text style={styles.tabText}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.tabItem}>
        <Ionicons name="restaurant-outline" size={24} color="#fff" />
        <Text style={styles.tabText}>Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cameraButton}>
        <Ionicons name="camera" size={32} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem}>
        <Ionicons name="calendar-outline" size={24} color="#fff" />
        <Text style={styles.tabText}>Reservations</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem}>
        <Ionicons name="person-outline" size={24} color="#fff" />
        <Text style={styles.tabText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* ...existing header code... */}

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <Text style={styles.searchText}>Search dishes, events...</Text>
        </View>

        <View style={styles.categories}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['All', 'Starters', 'Main Course', 'Desserts', 'Drinks'].map((category) => (
              <TouchableOpacity key={category} style={styles.categoryItem}>
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ...existing banner code... */}

        <Text style={styles.sectionTitle}>Today's Menu</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={menuItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.menuCard}>
              <Image source={{ uri: item.image }} style={styles.menuImage} />
              <View style={styles.menuInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.price}>${item.price}</Text>
                <TouchableOpacity style={styles.orderButton}>
                  <Text style={styles.orderButtonText}>Order Now</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* ...existing events code... */}
      </ScrollView>
      {renderBottomTab()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  price: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchText: {
    color: '#888',
    marginLeft: 8,
  },
  categories: {
    marginBottom: 16,
  },
  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  menuCard: {
    width: 280,
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  menuImage: {
    width: '100%',
    height: 160,
  },
  menuInfo: {
    padding: 16,
  },
  category: {
    color: '#ff6b00',
    fontSize: 14,
    marginBottom: 4,
  },
  itemName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderButton: {
    backgroundColor: '#ff6b00',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  orderButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bottomTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  cameraButton: {
    backgroundColor: '#ff6b00',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    borderWidth: 4,
    borderColor: '#121212',
  },
});

export default HomeScreen;