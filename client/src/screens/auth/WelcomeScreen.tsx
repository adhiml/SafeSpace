
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../utils/theme';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';

const spacing = { md: 16 };

export const WelcomeScreen = () => {

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.textWelcome}>
          Let's get started!
        </Text>
        <View>
          <Image source={require('../../assets/images/welcomeScreen.png')}
            style={{ width: 350, height: 250 }} />
        </View>
        <View style={{ width: '100%' }}>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp' as never)}
            style={styles.signUpButton}>
            <Text style={styles.signUpButtonText}>
              Sign Up
            </Text>
          </TouchableOpacity>

        </View>
        <View
          style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <Text
            style={styles.existingAccountText}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text
              style={{ ...styles.existingAccountText, fontWeight: 'bold', fontSize: 16 }}>
              Log In
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={() => navigation.navigate('RoleSelectScreen' as never)}>
            <Text style={{ ...styles.existingAccountText, color: colors.textMuted }}>
              Continue as Developer
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: spacing.md,
    gap: 15,
  },
  textWelcome: {
    fontSize: 50,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: 'bold',
  },
  signUpButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    width: '100%',
    borderRadius: 8,
    shadowColor: colors.shadow,
  },
  signUpButtonText: {
    color: colors.surface,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 500
  },
  existingAccountText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 500
  },
});