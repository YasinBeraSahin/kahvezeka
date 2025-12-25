npm run androidimport React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';

import { authService } from '../../services/auth';
import type { RootStackParamList } from '../../types/navigation';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

const registerSchema = yup
  .object()
  .shape({
    email: yup.string().email('Geçerli bir email girin').required('Email zorunlu'),
    password: yup
      .string()
      .min(6, 'Şifre en az 6 karakter olmalı')
      .required('Şifre zorunlu'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password'), undefined], 'Şifreler eşleşmiyor')
      .required('Şifre tekrarı zorunlu'),
  })
  .required();

const RegisterScreen = (): JSX.Element => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    try {
      setLoading(true);
      await authService.register({ email: values.email, password: values.password });
      Alert.alert('Başarılı', 'Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Kayıt başarısız', 'Bu email zaten kayıtlı olabilir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>Hesap Oluştur</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            label="Email"
            mode="outlined"
            style={styles.input}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={Boolean(errors.email)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />
      {errors.email?.message && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            label="Şifre"
            mode="outlined"
            style={styles.input}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={Boolean(errors.password)}
            secureTextEntry
          />
        )}
      />
      {errors.password?.message && <Text style={styles.error}>{errors.password.message}</Text>}

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            label="Şifre Tekrarı"
            mode="outlined"
            style={styles.input}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={Boolean(errors.confirmPassword)}
            secureTextEntry
          />
        )}
      />
      {errors.confirmPassword?.message && (
        <Text style={styles.error}>{errors.confirmPassword.message}</Text>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        style={styles.button}
      >
        Kayıt Ol
      </Button>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.link, { color: theme.colors.primary }]}>Zaten hesabınız var mı? Giriş yapın</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    paddingVertical: 4,
  },
  link: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});

export default RegisterScreen;
