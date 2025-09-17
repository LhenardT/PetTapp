import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function VeterinaryServicesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const veterinaryServices = [
    {
      id: 1,
      name: 'PetCo Animal Clinic',
      category: 'Vet Clinic Animal',
      price: 'Price (200PHP)',
      rating: 4.9,
      image: require('../assets/images/serviceimages/18.png'),
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    {
      id: 2,
      name: 'Animed Veterinary Clinic',
      category: 'Vet Clinic',
      price: 'Price (200PHP)',
      rating: 4.8,
      image: require('../assets/images/serviceimages/17.png'),
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    {
      id: 3,
      name: 'Vetfusion Animal Clinic',
      category: 'Vet Clinic',
      price: 'Price (200PHP)',
      rating: 4.7,
      image: require('../assets/images/serviceimages/19.png'),
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
  ];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        // Full star
        stars.push(
          <Text key={i} style={styles.fullStar}>★</Text>
        );
      } else if (i === fullStars && hasHalfStar) {
        // Half star (you can customize this further if needed)
        stars.push(
          <Text key={i} style={styles.halfStar}>★</Text>
        );
      } else {
        // Empty star
        stars.push(
          <Text key={i} style={styles.emptyStar}>☆</Text>
        );
      }
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Search and Bell - Same style as home.jsx */}
      <View style={styles.simpleHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.bellContainer}>
          <Image 
            source={require('../assets/images/service_icon/bell icon.png')}
            style={styles.bellIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Category */}
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryText}>Veterinary</Text>
        <Text style={styles.subcategoryText}>Vet Clinic Animal</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Services List */}
        {veterinaryServices.map((service) => (
          <TouchableOpacity 
            key={service.id} 
            style={styles.serviceCard}
            onPress={() => router.push({
              pathname: 'service-details',
              params: {
                id: service.id,
                name: service.name,
                category: service.category,
                price: service.price,
                rating: service.rating,
                description: service.description
              }
            })}
          >
            <Image source={service.image} style={styles.serviceImage} />
            <View style={styles.serviceContent}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceCategory}>{service.category}</Text>
              <Text style={styles.servicePrice}>{service.price}</Text>
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {renderStars(service.rating)}
                </View>
                <Text style={styles.ratingText}>({service.rating})</Text>
              </View>
              <Text style={styles.serviceDescription}>{service.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  simpleHeader: {
    backgroundColor: '#1C86FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 30,
    gap: 13,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    fontSize: 16,
    color: '#333',
  },
  bellContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    width: 40,
    height: 40,
    tintColor: '#fff',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  categoryText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C86FF',
    marginBottom: 5,
  },
  subcategoryText: {
    fontSize: 14,
    color: '#666',
  },
  servicesContainer: {
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100, // Add padding for bottom navigation
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  serviceContent: {
    padding: 15,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C86FF',
    marginBottom: 5,
  },
  serviceCategory: {
    fontSize: 12,
    color: '#FF9B79',
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  fullStar: {
    color: '#FFD700',
    fontSize: 12,
  },
  halfStar: {
    color: '#FFD700',
    fontSize: 12,
    opacity: 0.6,
  },
  emptyStar: {
    color: '#E0E0E0',
    fontSize: 12,
  },
  ratingText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});