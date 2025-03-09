import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {COLORS, FONTS, SIZES} from '../../theme/theme';

const {width} = Dimensions.get('window');

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNFQ0VDRkYiLz48cGF0aCBkPSJNMTYxLjggMjAwLjJDMTYxLjggMTY4LjQgMTg3LjYgMTQyLjYgMjE5LjQgMTQyLjZDMjUxLjIgMTQyLjYgMjc3IDE2OC40IDI3NyAyMDAuMkMyNzcgMjMyIDI1MS4yIDI1Ny44IDIxOS40IDI1Ny44QzE4Ny42IDI1Ny44IDE2MS44IDIzMiAxNjEuOCAyMDAuMlpNMjE5LjQgMjM5LjRDMjQxIDIzOS40IDI1OC42IDIyMS44IDI1OC42IDIwMC4yQzI1OC42IDE3OC42IDI0MSAxNjEgMjE5LjQgMTYxQzE5Ny44IDE2MSAxODAuMiAxNzguNiAxODAuMiAyMDAuMkMxODAuMiAyMjEuOCAxOTcuOCAyMzkuNCAyMTkuNCAyMzkuNFoiIGZpbGw9IiM2QzYzRkYiLz48L3N2Zz4=';

const OnboardingScreen1 = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: PLACEHOLDER_IMAGE }}
          style={styles.image as ImageStyle}
          resizeMode="contain"
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Ask Anything</Text>
        <Text style={styles.description}>
          Get instant answers to your questions using our AI-powered doubt solving system
        </Text>
        <View style={styles.paginationContainer}>
          <View style={[styles.paginationDot, styles.activeDot]} />
          <View style={styles.paginationDot} />
          <View style={styles.paginationDot} />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('OnboardingScreen2' as never)}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  image: {
    width: width * 0.8,
    height: width * 0.8,
  } as ImageStyle,
  contentContainer: {
    flex: 0.4,
    paddingHorizontal: SIZES.padding,
  } as ViewStyle,
  title: {
    ...FONTS.h1,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.base,
  } as TextStyle,
  description: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  } as TextStyle,
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  } as ViewStyle,
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  } as ViewStyle,
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 20,
  } as ViewStyle,
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.base * 2,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  } as ViewStyle,
  buttonText: {
    color: COLORS.white,
    ...FONTS.h3,
  } as TextStyle,
});

export default OnboardingScreen1; 