import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

// Level thresholds — every 10 games played = 1 level
function calcLevel(wins, losses) {
  return Math.max(1, Math.floor((wins + losses) / 10) + 1);
}

// XP progress within current level (0–100)
function calcXP(wins, losses) {
  const totalGames = wins + losses;
  return ((totalGames % 10) / 10) * 100;
}

function getRank(level) {
  if (level >= 50) return { label: 'Legendary', color: '#FFD700', emoji: '👑' };
  if (level >= 30) return { label: 'Master',    color: '#ff6bff', emoji: '💎' };
  if (level >= 20) return { label: 'Diamond',   color: '#00eeff', emoji: '🔷' };
  if (level >= 10) return { label: 'Gold',       color: '#FFA500', emoji: '🥇' };
  if (level >= 5)  return { label: 'Silver',     color: '#C0C0C0', emoji: '🥈' };
  return               { label: 'Bronze',     color: '#cd7f32', emoji: '🥉' };
}

const STAT_CARDS = [
  { key: 'wins',           label: 'Wins',           emoji: '🏆', color: '#00eeff' },
  { key: 'losses',         label: 'Losses',         emoji: '💀', color: '#ff6680' },
  { key: 'longest_streak', label: 'Best Streak',    emoji: '🔥', color: '#ff9f00' },
  { key: 'favorite_mode',  label: 'Fav Mode',       emoji: '🎮', color: '#b36bff' },
];

export default function ProfileScreen({ navigation, route }) {
  const username = route?.params?.username ?? null;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!username) {
      setError('No username provided.');
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [username]);

  async function fetchProfile() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('username, wins, losses, longest_streak, favorite_mode, created_at')
        .eq('username', username)
        .single();

      if (err) throw err;
      setProfile(data);
    } catch (e) {
      setError('Could not load profile.');
    } finally {
      setLoading(false);
    }
  }

  const wins    = profile?.wins            ?? 0;
  const losses  = profile?.losses          ?? 0;
  const streak  = profile?.longest_streak  ?? 0;
  const favMode = profile?.favorite_mode   ?? '—';
  const level   = calcLevel(wins, losses);
  const xp      = calcXP(wins, losses);
  const rank    = getRank(level);
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  const statValues = { wins, losses, longest_streak: streak, favorite_mode: favMode };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#08001a" />

      {/* Background — matches HomeScreen */}
      <LinearGradient colors={['#08001a', '#08001a']} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['#00eeffaa', '#00eeff22', 'transparent']} start={{ x: 0, y: 1 }} end={{ x: 0.65, y: 0.3 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['#ff00ccaa', '#ff00cc22', 'transparent']} start={{ x: 1, y: 1 }} end={{ x: 0.35, y: 0.3 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['#9900ffbb', '#6600ff44', 'transparent']} start={{ x: 0.5, y: 0.2 }} end={{ x: 0.5, y: 0.9 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['transparent', '#000000cc']} start={{ x: 0.5, y: 0.4 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#b36bff" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchProfile}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Avatar + name card */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)']}
              style={styles.heroCardGradient}
            >
              {/* Glowing avatar */}
              <View style={styles.avatarWrapper}>
                <View style={[styles.avatarGlow, { shadowColor: rank.color }]} />
                <View style={styles.avatarCircle}>
                  <LinearGradient
                    colors={['#2a0060', '#1a0040']}
                    style={styles.avatarCircleGradient}
                  >
                    <Text style={styles.avatarEmoji}>👤</Text>
                  </LinearGradient>
                </View>
                {/* Rank badge */}
                <View style={[styles.rankBadge, { borderColor: rank.color }]}>
                  <Text style={styles.rankBadgeEmoji}>{rank.emoji}</Text>
                </View>
              </View>

              <Text style={styles.usernameText}>{profile?.username ?? username}</Text>
              <Text style={[styles.rankLabel, { color: rank.color }]}>{rank.label}</Text>

              {/* Level + XP bar */}
              <View style={styles.levelRow}>
                <Text style={styles.levelLabel}>LVL</Text>
                <Text style={styles.levelNumber}>{level}</Text>
              </View>

              <View style={styles.xpBarTrack}>
                <LinearGradient
                  colors={['#b36bff', '#00eeff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.xpBarFill, { width: `${xp}%` }]}
                />
              </View>
              <Text style={styles.xpLabel}>
                {Math.round(xp * 0.1)}/10 XP to Level {level + 1}
              </Text>
            </LinearGradient>
          </View>

          {/* Win rate highlight */}
          <View style={styles.winRateRow}>
            <LinearGradient
              colors={['rgba(0,238,255,0.12)', 'rgba(0,238,255,0.04)']}
              style={styles.winRateCard}
            >
              <Text style={styles.winRateNumber}>{winRate}%</Text>
              <Text style={styles.winRateLabel}>Win Rate</Text>
            </LinearGradient>
            <LinearGradient
              colors={['rgba(179,107,255,0.12)', 'rgba(179,107,255,0.04)']}
              style={styles.winRateCard}
            >
              <Text style={styles.winRateNumber}>{totalGames}</Text>
              <Text style={styles.winRateLabel}>Total Games</Text>
            </LinearGradient>
          </View>

          {/* Stat cards grid */}
          <View style={styles.statsGrid}>
            {STAT_CARDS.map((card) => (
              <View key={card.key} style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)']}
                  style={styles.statCardGradient}
                >
                  <View style={[styles.statCardAccent, { backgroundColor: card.color + '33' }]} />
                  <Text style={styles.statCardEmoji}>{card.emoji}</Text>
                  <Text style={[styles.statCardValue, { color: card.color }]}>
                    {statValues[card.key] ?? '—'}
                  </Text>
                  <Text style={styles.statCardLabel}>{card.label}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Member since */}
          {profile?.created_at && (
            <Text style={styles.memberSince}>
              Member since{' '}
              {new Date(profile.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 26 },
  topBarTitle: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 1 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  retryBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: 'rgba(179,107,255,0.2)', borderRadius: 20,
  },
  retryText: { color: '#b36bff', fontWeight: '700' },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    alignItems: 'center',
  },

  /* Hero card */
  heroCard: {
    width: '100%', borderRadius: 28, overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#9900ff', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 12,
  },
  heroCardGradient: {
    padding: 28, alignItems: 'center', gap: 8,
  },

  avatarWrapper: {
    width: 96, height: 96,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  avatarGlow: {
    position: 'absolute',
    width: 96, height: 96, borderRadius: 48,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 24, elevation: 0,
  },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44, overflow: 'hidden',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.18)',
  },
  avatarCircleGradient: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 44 },

  rankBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#08001a',
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  rankBadgeEmoji: { fontSize: 14 },

  usernameText: {
    color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 0.5,
  },
  rankLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },

  levelRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  levelLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  levelNumber: { color: '#fff', fontSize: 32, fontWeight: '900' },

  xpBarTrack: {
    width: '100%', height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden', marginTop: 2,
  },
  xpBarFill: { height: '100%', borderRadius: 3 },
  xpLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 4 },

  /* Win rate row */
  winRateRow: {
    flexDirection: 'row', gap: 12, width: '100%', marginBottom: 12,
  },
  winRateCard: {
    flex: 1, borderRadius: 20, padding: 20, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  winRateNumber: { color: '#fff', fontSize: 28, fontWeight: '900' },
  winRateLabel:  { color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: '600', letterSpacing: 1 },

  /* Stats grid */
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12, width: '100%', marginBottom: 16,
  },
  statCard: {
    width: (width - 40 - 12) / 2,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  statCardGradient: { padding: 20, alignItems: 'center', gap: 6 },
  statCardAccent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: 20,
  },
  statCardEmoji: { fontSize: 28 },
  statCardValue: { fontSize: 26, fontWeight: '900' },
  statCardLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },

  memberSince: {
    color: 'rgba(255,255,255,0.25)', fontSize: 12,
    letterSpacing: 0.5, marginTop: 4,
  },
});