import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import { spacing, colors } from '../../utils/theme';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export const LoginScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Image source={require('../../assets/images/login.png')}
          style={{ width: 350, height: 300 }} />
        <Text style={styles.textWelcome}>
          Welcome Back!
        </Text>
        <View style={styles.loginContainer}>
          <Text style={styles.titleText}>Email Address</Text>
          <TextInput
            mode="flat"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            placeholder="Enter your email address"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <Text style={styles.titleText}>Password</Text>
          <TextInput
            mode="flat"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            placeholder="Enter your password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
          />
          <TouchableOpacity >
            <Text
              style={{
                ...styles.titleText, flexDirection: 'row',
                justifyContent: 'flex-end', textAlign: 'right', color: "#8e8b8b"
              }}>
              Forget Password?
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginButton}>
            <Text
              style={{ ...styles.titleText, color: colors.surface, textAlign: 'center', fontWeight: 'bold' }}>
              Login
            </Text>
          </TouchableOpacity>
          <Text
            style={{ ...styles.titleText, color: "#8e8b8b", textAlign: 'center', fontWeight: 'bold' }}>
            Or
          </Text>
          <TouchableOpacity style={{ ...styles.loginButton, backgroundColor: "#F1E6DA", borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
              <Image source={require('../../assets/images/google.png')}
                style={{ width: 20, height: 20 }} />
              <Text
                style={{ ...styles.titleText, color: colors.primary, textAlign: 'center', fontWeight: 'bold' }}>
                Continue with Google
              </Text>
            </View>
          </TouchableOpacity>
          <View
            style={{ flexDirection: 'row' ,justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            <Text
              style={{ ...styles.nonExistingAccountText, color: "#8e8b8b" }}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp' as never)}>
              <Text
                style={{ ...styles.nonExistingAccountText, fontWeight: 'bold', fontSize: 16 }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  textWelcome: {
    fontSize: 30,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: 'bold',

  },
  loginContainer: {
    flex: 1,
    backgroundColor: colors.border,
    padding: spacing.xl,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    shadowColor: colors.shadow,
    width: '100%',
    gap: 15,
  },
  titleText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 500,
  },
  input: {
    backgroundColor: "#f4efef",
    borderRadius: 10,
    height: 48,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    width: '100%',
    borderRadius: 8,
  },
  nonExistingAccountText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 500
  }
});