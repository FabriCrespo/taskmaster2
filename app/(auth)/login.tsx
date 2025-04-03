import { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Animated, Easing } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [matrixChars] = useState('MATRIX1234567890'.split(''));
  const [rainDrops] = useState(Array(15).fill(0).map(() => new Animated.Value(0)));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    rainDrops.forEach((drop, i) => {
      startRainAnimation(drop, i);
    });
  }, []);

  const startRainAnimation = (drop: Animated.Value, index: number) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(drop, {
          toValue: 1,
          duration: 3000 + (index * 500),
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(drop, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.replace('/(app)/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#000000', '#001a00']}
      style={styles.container}
    >
      {/* Efecto Lluvia Matrix */}
      {rainDrops.map((drop, index) => (
        <Animated.Text
          key={index}
          style={[
            styles.matrixRain,
            {
              left: `${(index / rainDrops.length) * 100}%`,
              transform: [{
                translateY: drop.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 800]
                })
              }],
              opacity: drop.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 0]
              })
            }
          ]}
        >
          {matrixChars[Math.floor(Math.random() * matrixChars.length)]}
        </Animated.Text>
      ))}

      <Animated.View style={[styles.form, { opacity: fadeAnim }]}>
        <Text style={styles.title}>TaskMaster</Text>
        
        {error && <Text style={styles.error}>{error}</Text>}
        
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor="#00ff00"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#00ff00"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Conectando...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>
        
        <Link href="/register" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>
              ¿No tienes cuenta? Regístrate aquí
            </Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  matrixRain: {
    color: '#00ff00',
    fontSize: 20,
    fontFamily: 'TVCD',
    position: 'absolute',
    top: 0,
  },
  form: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#00ff00',
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    fontFamily: 'TVCD',
  },
  input: {
    borderWidth: 1,
    borderColor: '#00ff00',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    color: '#00ff00',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    fontFamily: 'TVCD',
  },
  button: {
    backgroundColor: '#00cc00', // Verde más brillante para el botón
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#004400', // Verde más oscuro cuando está deshabilitado
    borderColor: '#004400',
  },
  buttonText: {
    color: '#000000', // Texto negro para mejor contraste
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'TVCD',
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 0, 0.1)', // Fondo semi-transparente
  },
  linkText: {
    color: '#00ff00',
    fontFamily: 'TVCD',
    fontSize: 14,
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  error: {
    color: '#ff0000',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'TVCD',
  },
});



