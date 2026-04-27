import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

// ─── Achievement definitions ───────────────────────────────────────────────
// check(profile) returns true if the achievement is unlocked
const ACHIEVEMENTS = [
  {
    id: 'first_win',
    emoji: '🏆',
    name: 'First Blood',
    description: 'Win your very first game. Every legend has to start somewhere.',
    color: '#00eeff',
    check: (p) => p.wins >= 1,
  },
  {
    id: 'ten_wins',
    emoji: '⚔️',
    name: 'On a Roll',
    description: 'Win 10 games total. You\'re no longer a beginner.',
    color: '#7C3AED',
    check: (p) => p.wins >= 10,
  },
  {
    id: 'fifty_wins',
    emoji: '🔥',
    name: 'Unstoppable',
    description: 'Win 50 games. The arena knows your name.',
    color: '#ff9f00',
    check: (p) => p.wins >= 50,
  },
  {
    id: 'hundred_wins',
    emoji: '💯',
    name: 'Century Club',
    description: 'Win 100 games. A true veteran of the battlefield.',
    color: '#FFD700',
    check: (p) => p.wins >= 100,
  },
  {
    id: 'five_streak',
    emoji: '⚡',
    name: 'On Fire',
    description: 'Win 5 games in a row without losing. Pure momentum.',
    color: '#ff6bff',
    check: (p) => p.longest_streak >= 5,
  },
  {
    id: 'ten_streak',
    emoji: '🌪️',
    name: 'Wrecking Ball',
    description: 'Win 10 games in a row. Opponents fear your name.',
    color: '#ff0066',
    check: (p) => p.longest_streak >= 10,
  },
  {
    id: 'rival',
    emoji: '👊',
    name: 'Rival Crusher',
    description: 'Beat the same opponent 5 times. They keep coming back for more.',
    color: '#00ff88',
    check: (p) => p.rematch_wins >= 5,
  },
  {
    id: 'all_modes',
    emoji: '🎮',
    name: 'Versatile',
    description: 'Play both Friend and Random mode. Try everything the arena offers.',
    color: '#00eeff',
    check: (p) => p.total_friend_games >= 1 && p.total_random_games >= 1,
  },
  {
    id: 'friend_mode_10',
    emoji: '🤝',
    name: 'Social Butterfly',
    description: 'Play 10 games against friends. Loyalty tested, friendship proven.',
    color: '#7C3AED',
    check: (p) => p.total_friend_games >= 10,
  },
  {
    id: 'random_mode_10',
    emoji: '🎲',
    name: 'Wildcard',
    description: 'Play 10 games against random opponents. Embrace the chaos.',
    color: '#0ea5e9',
    check: (p) => p.total_random_games >= 10,
  },
  {
    id: 'play_25',
    emoji: '🎯',
    name: 'Committed',
    description: 'Play 25 total games. You\'re in this for the long haul.',
    color: '#ff9f00',
    check: (p) => (p.wins + p.losses) >= 25,
  },
  {
    id: 'play_100',
    emoji: '🏅',
    name: 'Dedicated',
    description: 'Play 100 total games. The grind is real and you embrace it.',
    color: '#FFD700',
    check: (p) => (p.wins + p.losses) >= 100,
  },
  {
    id: 'comeback',
    emoji: '😤',
    name: 'Never Give Up',
    description: 'Win a game after losing 3 in a row. Resilience defines a champion.',
    color: '#ff6680',
    check: (p) => p.wins >= 1 && p.losses >= 3,   // simplified — full tracking needs game history
  },
  {
    id: 'level_5',
    emoji: '⭐',
    name: 'Rising Star',
    description: 'Reach Level 5. The journey to the top has begun.',
    color: '#C0C0C0',
    check: (p) => Math.max(1, Math.floor((p.wins + p.losses) / 10) + 1) >= 5,
  },
  {
    id: 'level_10',
    emoji: '💎',
    name: 'Diamond in the Rough',
    description: 'Reach Level 10. You\'ve earned your place among the elite.',
    color: '#00eeff',
    check: (p) => Math.max(1, Math.floor((p.wins + p.losses) / 10) + 1) >= 10,
  },
];

const TOTAL = ACHIEVEMENTS.length;

export default function AchievementsScreen({ navigation, route }) {
  const username = route?.params?.username ?? null;

  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [selected, setSelected]   = useState(null); // achievement shown in modal
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!username) { setError('No username provided.'); setLoading(false); return; }
    fetchProfile();
  }, [username]);

  async function fetchProfile() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('wins, losses, longest_streak, current_streak, favorite_mode, friend_wins, random_wins, total_friend_games, total_random_games, rematch_wins')
        .eq('username', username)
        .single();
      if (err) throw err;
      setProfile(data);
    } catch {
      setError('Could not load achievements.');
    } finally {
      setLoading(false);
    }
  }

  function openModal(achievement) {
    setSelected(achievement);
    Animated.spring(modalAnim, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }).start();
  }

  function closeModal() {
    Animated.timing(modalAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setSelected(null));
  }

  const unlockedIds = profile
    ? new Set(ACHIEVEMENTS.filter((a) => a.check(profile)).map((a) => a.id))
    : new Set();
  const unlockedCount = unlockedIds.size;

  const progressPct = (unlockedCount / TOTAL) * 100;

  // Sort: unlocked first, then locked
  const sorted = [...ACHIEVEMENTS].sort((a, b) => {
    const au = unlockedIds.has(a.id) ? 0 : 1;
    const bu = unlockedIds.has(b.id) ? 0 : 1;
    return au - bu;
  });

  const modalScale = modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const modalOpacity = modalAnim;
  const selectedUnlocked = selected ? unlockedIds.has(selected.id) : false;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#08001a" />

      {/* Background */}
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
        <Text style={styles.topBarTitle}>Achievements</Text>
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

          {/* Header card — tally + progress bar */}
          <View style={styles.headerCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)']}
              style={styles.headerCardGradient}
            >
              <Text style={styles.tallyEmoji}>🏆</Text>
              <Text style={styles.tallyText}>
                <Text style={styles.tallyDone}>{unlockedCount}</Text>
                <Text style={styles.tallyOf}> / {TOTAL}</Text>
              </Text>
              <Text style={styles.tallyLabel}>Achievements Unlocked</Text>

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={['#b36bff', '#00eeff']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${progressPct}%` }]}
                />
              </View>
              <Text style={styles.progressLabel}>{Math.round(progressPct)}% complete</Text>
            </LinearGradient>
          </View>

          {/* Achievement rows */}
          {sorted.map((achievement) => {
            const unlocked = unlockedIds.has(achievement.id);
            return (
              <TouchableOpacity
                key={achievement.id}
                style={[styles.row, !unlocked && styles.rowLocked]}
                activeOpacity={0.75}
                onPress={() => openModal(achievement)}
              >
                <LinearGradient
                  colors={
                    unlocked
                      ? [`${achievement.color}22`, `${achievement.color}08`]
                      : ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.01)']
                  }
                  style={styles.rowGradient}
                >
                  {/* Left accent bar */}
                  <View style={[styles.rowAccent, { backgroundColor: unlocked ? achievement.color : 'rgba(255,255,255,0.1)' }]} />

                  {/* Emoji badge */}
                  <View style={[styles.emojiBadge, { backgroundColor: unlocked ? achievement.color + '22' : 'rgba(255,255,255,0.06)' }]}>
                    <Text style={[styles.rowEmoji, !unlocked && styles.dimmed]}>
                      {unlocked ? achievement.emoji : '🔒'}
                    </Text>
                  </View>

                  {/* Name */}
                  <Text style={[styles.rowName, !unlocked && styles.rowNameLocked]}>
                    {achievement.name}
                  </Text>

                  {/* Checkmark or chevron */}
                  {unlocked
                    ? <Text style={[styles.checkmark, { color: achievement.color }]}>✓</Text>
                    : <Text style={styles.chevron}>›</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Detail modal */}
      <Modal transparent visible={!!selected} animationType="none" onRequestClose={closeModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal}>
          <Animated.View style={[styles.modalBox, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
            <LinearGradient colors={['#1a0040', '#0d0030']} style={StyleSheet.absoluteFill} borderRadius={28} />

            {/* Glow ring */}
            {selected && (
              <View style={[styles.modalGlowRing, { borderColor: selectedUnlocked ? selected.color : 'rgba(255,255,255,0.15)', shadowColor: selectedUnlocked ? selected.color : 'transparent' }]}>
                <Text style={[styles.modalEmoji, !selectedUnlocked && styles.dimmed]}>
                  {selectedUnlocked ? selected?.emoji : '🔒'}
                </Text>
              </View>
            )}

            <Text style={[
              styles.modalName,
              selected && selectedUnlocked && { color: selected.color }
            ]}>
              {selected?.name}
            </Text>

            <View style={[styles.modalBadge, { backgroundColor: selectedUnlocked ? '#00ff8833' : 'rgba(255,255,255,0.08)' }]}>
              <Text style={[styles.modalBadgeText, { color: selectedUnlocked ? '#00ff88' : 'rgba(255,255,255,0.35)' }]}>
                {selectedUnlocked ? '✓  UNLOCKED' : '🔒  LOCKED'}
              </Text>
            </View>

            <Text style={styles.modalDescription}>{selected?.description}</Text>

            <TouchableOpacity style={styles.modalClose} onPress={closeModal} activeOpacity={0.8}>
              <LinearGradient colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']} style={styles.modalCloseGradient}>
                <Text style={styles.modalCloseText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12,
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
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: 'rgba(179,107,255,0.2)', borderRadius: 20 },
  retryText: { color: '#b36bff', fontWeight: '700' },

  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },

  /* Header card */
  headerCard: {
    borderRadius: 24, overflow: 'hidden', marginBottom: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  headerCardGradient: { padding: 24, alignItems: 'center', gap: 6 },
  tallyEmoji: { fontSize: 36, marginBottom: 2 },
  tallyText: { fontSize: 42, fontWeight: '900' },
  tallyDone: { color: '#fff' },
  tallyOf: { color: 'rgba(255,255,255,0.35)', fontSize: 28 },
  tallyLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  progressTrack: {
    width: '100%', height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginTop: 8,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 },

  /* Achievement row */
  row: {
    borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  rowLocked: { borderColor: 'rgba(255,255,255,0.05)' },
  rowGradient: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 16, gap: 14,
  },
  rowAccent: { width: 3, height: 36, borderRadius: 2 },
  emojiBadge: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  rowEmoji: { fontSize: 22 },
  rowName: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' },
  rowNameLocked: { color: 'rgba(255,255,255,0.35)' },
  checkmark: { fontSize: 20, fontWeight: '900' },
  chevron: { color: 'rgba(255,255,255,0.25)', fontSize: 22, fontWeight: '300' },
  dimmed: { opacity: 0.4 },

  /* Modal */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    width: width * 0.84, borderRadius: 28, overflow: 'hidden',
    padding: 32, alignItems: 'center', gap: 12,
  },
  modalGlowRing: {
    width: 84, height: 84, borderRadius: 42,
    borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 16, elevation: 0,
  },
  modalEmoji: { fontSize: 40 },
  modalName: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  modalBadge: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20,
  },
  modalBadgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  modalDescription: {
    color: 'rgba(255,255,255,0.6)', fontSize: 15,
    textAlign: 'center', lineHeight: 22, marginVertical: 4,
  },
  modalClose: { width: '100%', borderRadius: 50, overflow: 'hidden', marginTop: 4 },
  modalCloseGradient: { paddingVertical: 14, alignItems: 'center' },
  modalCloseText: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: '700' },
});