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
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import {COLORS, FONTS, SIZES} from '../../theme/theme';

const {width} = Dimensions.get('window');

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNFQ0ZGRUMiLz48cGF0aCBkPSJNMTgwIDIwMEwyMjAgMTYwTDI2MCAyMDBMMjIwIDI0MEwxODAgMjAwWiIgZmlsbD0iIzRDQUY1MCIvPjwvc3ZnPg==';

type OnboardingScreen3Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const OnboardingScreen3: React.FC<OnboardingScreen3Props> = ({navigation}) => {
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
        <Text style={styles.title}>Get Instant Solutions</Text>
        <Text style={styles.description}>
          Receive step-by-step solutions powered by AI and access related educational resources
        </Text>
        <View style={styles.paginationContainer}>
          <View style={styles.paginationDot} />
          <View style={styles.paginationDot} />
          <View style={[styles.paginationDot, styles.activeDot]} />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.buttonText}>Get Started</Text>
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

export default OnboardingScreen3; 