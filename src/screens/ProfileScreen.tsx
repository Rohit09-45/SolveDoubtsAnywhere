import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, FONTS} from '../theme/theme';
import {useAuth} from '../context/AuthContext';

const ProfileScreen: React.FC = () => {
  const {user, loading, signOut} = useAuth();
  const [imageError, setImageError] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Not logged in</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {user.photoURL && !imageError ? (
            <Image 
              source={{ uri: user.photoURL }} 
              style={styles.avatar}
              onError={() => setImageError(true)}
            />
          ) : (
            <Icon name="person-circle" size={80} color={COLORS.primary} />
          )}
        </View>
        <Text style={styles.name}>{user.name || 'Anonymous User'}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>{user.role || 'Student'}</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="settings-outline" size={24} color={COLORS.text} />
          <Text style={styles.menuText}>Settings</Text>
          <Icon name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.menuItem}>
          <Icon name="notifications-outline" size={24} color={COLORS.text} />
          <Text style={styles.menuText}>Notifications</Text>
          <Icon name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="help-circle-outline" size={24} color={COLORS.text} />
          <Text style={styles.menuText}>Help & Support</Text>
          <Icon name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="information-circle-outline" size={24} color={COLORS.text} />
          <Text style={styles.menuText}>About</Text>
          <Icon name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out-outline" size={24} color={COLORS.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  profileSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.white,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  name: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  role: {
    ...FONTS.body3,
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  menuSection: {
    marginTop: 24,
    backgroundColor: COLORS.white,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuText: {
    ...FONTS.body2,
    color: COLORS.text,
    flex: 1,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    marginTop: 24,
  },
  logoutText: {
    ...FONTS.body2,
    color: COLORS.error,
    marginLeft: 8,
  },
  errorText: {
    ...FONTS.body1,
    color: COLORS.error,
  },
});

export default ProfileScreen; 