import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '@/utils/supabase';
import { Redirect, useRouter } from 'expo-router';

const categories = ['Platos fuertes', 'Postres', 'Bebidas', 'Entradas'];

const allPlates: { [key: string]: { name: string; file: string; price: string }[] } = {
  'Platos fuertes': [
    { name: 'Plato1', file: 'plato1.jpg', price: '$10.00' },
  ],
  'Postres': [
    { name: 'Postre1', file: 'postre1.jpg', price: '$6.00' },
  ],
  'Entradas': [
    { name: 'Entrada1', file: 'entrada1.jpg', price: '$5.00' },
  ],
  'Bebidas': [
    { name: 'Café', file: 'bebida1.jpg', price: '$3.00' },
  ],
};

export default function MenuScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Platos fuertes');
  const router = useRouter();

  const getImageUrl = (fileName: string) => {
    const { data } = supabase.storage.from('menu').getPublicUrl(fileName);
    return data?.publicUrl || '';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Icon name="location-on" type="material" color="#ffa500" size={20} />
          <Text style={styles.locationText}>New York, Las Cruces</Text>
        </View>
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        {/* Categorías */}
        <View style={styles.tabs}>
          {categories.map((cat, index) => (
            <TouchableOpacity key={index} onPress={() => setSelectedCategory(cat)}>
              <Text style={[styles.tab, selectedCategory === cat && styles.tabSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista de platos */}
        <FlatList
          data={allPlates[selectedCategory]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.verticalCard}>
              <Image
                source={{ uri: getImageUrl(item.file) }}
                style={styles.verticalImage}
              />
              <View style={styles.verticalTextContainer}>
                <Text style={styles.verticalTitle}>{item.name}</Text>
                <Text style={styles.verticalPrice}>{item.price}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Menú inferior */}
      <View style={styles.bottomNav}>
        <Icon name="restaurant-menu" type="material" color="#ffa500" />
        <TouchableOpacity onPress={() => router.navigate('/(app)/client/car')}>
          <Icon name="shopping-cart" type="material" color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    backgroundColor: '#000',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    marginTop: -10,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    marginRight: 16,
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  tabSelected: {
    color: '#ffa500',
    borderBottomWidth: 2,
    borderBottomColor: '#ffa500',
    paddingBottom: 4,
  },
  verticalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  verticalImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  verticalTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  verticalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  verticalPrice: {
    fontSize: 14,
    color: '#ff6b00',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingVertical: 12,
    backgroundColor: '#000',
  },
});





{/*<FlatList
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
      />*/}
      