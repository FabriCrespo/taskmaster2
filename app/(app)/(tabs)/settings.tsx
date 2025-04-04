import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { LogOut, User, Mail, Calendar, Clock, Zap } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type UserProfile = {
  id: string;
  email: string;
  agent_name: string;
  created_at: string;
};

export default function SettingsScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchUserProfile();
    
    // Actualizar la hora cada segundo para el efecto de "tiempo real"
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/login');
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error al cerrar sesión');
    }
  };

  // Función para generar una fecha aleatoria en el futuro
  const getRandomFutureDate = () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + Math.floor(Math.random() * 30) + 1);
    return futureDate.toLocaleDateString('es-BO');
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Image 
            source={require('@/assets/images/car.png')}
            style={styles.deloreanImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Mi Perfil</Text>
          <Text style={styles.subtitle}>Información del Agente del Tiempo</Text>
        </View>

        <View style={styles.timeDisplay}>
          <Clock size={24} color="#e74c3c" />
          <Text style={styles.timeText}>
            {currentTime.toLocaleTimeString('es-BO')}
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <User size={40} color="#e74c3c" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile?.agent_name || 'Usuario'}
              </Text>
              <Text style={styles.profileEmail}>
                {userProfile?.email || 'Cargando...'}
              </Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Mail size={20} color="#e74c3c" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Correo Electrónico</Text>
                <Text style={styles.infoValue}>{userProfile?.email || 'No disponible'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Calendar size={20} color="#e74c3c" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Miembro desde</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.created_at 
                    ? new Date(userProfile.created_at).toLocaleDateString('es-BO')
                    : 'No disponible'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Zap size={20} color="#e74c3c" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Próximo Viaje en el Tiempo</Text>
                <Text style={styles.infoValue}>{getRandomFutureDate()}</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={24} color="white" />
          <Text style={styles.signOutText}>Regresar al Presente</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  deloreanImage: {
    width: width * 0.8,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    color: '#e74c3c',
    fontFamily: 'TVCD',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(231, 76, 60, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    fontFamily: 'TVCD',
    textAlign: 'center',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  timeText: {
    fontSize: 18,
    color: '#e74c3c',
    fontFamily: 'TVCD',
    marginLeft: 10,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    margin: 20,
    padding: 20,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 76, 60, 0.3)',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    color: '#ffffff',
    fontFamily: 'TVCD',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#cccccc',
    fontFamily: 'TVCD',
  },
  infoSection: {
    gap: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 8,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#cccccc',
    fontFamily: 'TVCD',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'TVCD',
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'TVCD',
    marginLeft: 10,
  },
});
