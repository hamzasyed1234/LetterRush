import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  TouchableWithoutFeedback,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

export default function HomeScreen({ navigation, route }) {
  const username = route?.params?.username ?? null;
  const isGuest = !username;
  const displayName = isGuest ? 'Guest' : username;

  // Left sidebar
  const leftAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const leftOpenRef = useRef(false);
  const [leftOpen, setLeftOpen] = useState(false);

  // Right sidebar
  const rightAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const rightOpenRef = useRef(false);
  const [rightOpen, setRightOpen] = useState(false);

  // Overlay
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Logout confirmation modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Guest lock modal
  const [showGuestModal, setShowGuestModal] = useState(false);

  function openLeft() {
    leftOpenRef.current = true;
    setLeftOpen(true);
    const animations = [
      Animated.spring(leftAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ];
    if (rightOpenRef.current) {
      rightOpenRef.current = false;
      setRightOpen(false);
      animations.push(Animated.spring(rightAnim, { toValue: SIDEBAR_WIDTH, friction: 8, tension: 60, useNativeDriver: true }));
    }
    Animated.parallel(animations).start();
  }

  function closeLeft() {
    leftOpenRef.current = false;
    Animated.parallel([
      Animated.spring(leftAnim, { toValue: -SIDEBAR_WIDTH, friction: 8, tension: 60, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setLeftOpen(false));
  }

  function openRight() {
    if (isGuest) {
      setShowGuestModal(true);
      return;
    }
    rightOpenRef.current = true;
    setRightOpen(true);
    const animations = [
      Animated.spring(rightAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ];
    if (leftOpenRef.current) {
      leftOpenRef.current = false;
      setLeftOpen(false);
      animations.push(Animated.spring(leftAnim, { toValue: -SIDEBAR_WIDTH, friction: 8, tension: 60, useNativeDriver: true }));
    }
    Animated.parallel(animations).start();
  }

  function closeRight() {
    rightOpenRef.current = false;
    Animated.parallel([
      Animated.spring(rightAnim, { toValue: SIDEBAR_WIDTH, friction: 8, tension: 60, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setRightOpen(false));
  }

  function closeAll() {
    if (leftOpenRef.current) closeLeft();
    else if (rightOpenRef.current) closeRight();
  }

  function handleLogout() {
    setShowLogoutModal(true);
  }

  function confirmLogout() {
    setShowLogoutModal(false);
    closeLeft();
    navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
  }

  function handleCreateAccount() {
    closeLeft();
    navigation.navigate('Login');
  }

  function handleGuestLoginRedirect() {
    setShowGuestModal(false);
    navigation.navigate('Login');
  }

  // Left menu — Profile and Achievements are locked for guests
  // Each item can declare custom params to pass on navigation
  const leftMenuItems = [
    { icon: '👤', label: 'View Profile',  screen: 'Profile',      params: { username }, guestLocked: true  },
    { icon: '🏆', label: 'Achievements',  screen: 'Achievements', params: { username }, guestLocked: true  },
    { icon: '🛒', label: 'Shop',          screen: 'Shop',         params: {},           guestLocked: false },
    { icon: '⚙️', label: 'Settings',      screen: 'Settings',     params: {},           guestLocked: false },
  ];

  const rightMenuItems = [
    { icon: '👥', label: 'Friends List',    screen: 'FriendsList'    },
    { icon: '➕', label: 'Add Friend',      screen: 'AddFriend'      },
    { icon: '📬', label: 'Friend Requests', screen: 'FriendRequests' },
  ];

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
        <TouchableOpacity style={styles.iconBtn} onPress={openLeft} activeOpacity={0.7}>
          <Text style={styles.iconBtnText}>☰</Text>
        </TouchableOpacity>

        <View style={styles.userPill}>
          <Text style={styles.userEmoji}>{isGuest ? '👻' : '👤'}</Text>
          <Text style={styles.userPillText}>{displayName}</Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={openRight} activeOpacity={0.7}>
          <Text style={styles.iconBtnText}>🫂</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Let's Play!</Text>
        <Text style={styles.subText}>Choose your battle</Text>

        <View style={styles.modeCards}>
          {/* You vs Friend — locked for guests */}
          <TouchableOpacity
            style={[styles.modeCard, isGuest && styles.modeCardLocked]}
            activeOpacity={isGuest ? 0.6 : 0.85}
            onPress={() => {
              if (isGuest) {
                setShowGuestModal(true);
              } else {
                navigation?.navigate('Game', { mode: 'friend', username });
              }
            }}
          >
            <LinearGradient
              colors={isGuest ? ['#3a2a5a', '#2a1a45'] : ['#7C3AED', '#4f1db5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeCardGradient}
            >
              {isGuest && <Text style={styles.lockBadge}>🔒</Text>}
              <Text style={[styles.modeCardEmoji, isGuest && styles.dimmed]}>🤝</Text>
              <Text style={[styles.modeCardTitle, isGuest && styles.dimmed]}>You vs Friend</Text>
              <Text style={[styles.modeCardSub, isGuest && styles.dimmedSub]}>
                {isGuest ? 'Log in to challenge friends' : 'Challenge someone you know'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* You vs Random — always available */}
          <TouchableOpacity
            style={styles.modeCard}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate('Game', { mode: 'random', username })}
          >
            <LinearGradient colors={['#0ea5e9', '#0369a1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modeCardGradient}>
              <Text style={styles.modeCardEmoji}>🎲</Text>
              <Text style={styles.modeCardTitle}>You vs Random</Text>
              <Text style={styles.modeCardSub}>Play against a stranger</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Overlay */}
      {(leftOpen || rightOpen) && (
        <TouchableWithoutFeedback onPress={closeAll}>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </TouchableWithoutFeedback>
      )}

      {/* Left Sidebar */}
      <Animated.View style={[styles.sidebar, styles.sidebarLeft, { transform: [{ translateX: leftAnim }] }]}>
        <LinearGradient colors={['#1a0040', '#0d0030', '#08001a']} style={StyleSheet.absoluteFill} />

        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarAvatarEmoji}>{isGuest ? '👻' : '👤'}</Text>
          <Text style={styles.sidebarUsername}>{displayName}</Text>
        </View>
        <View style={styles.sidebarDivider} />

        <ScrollView style={{ flex: 1 }}>
          {leftMenuItems.map((item, i) => {
            const locked = isGuest && item.guestLocked;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.sidebarItem, locked && styles.sidebarItemLocked]}
                activeOpacity={locked ? 0.5 : 0.7}
                onPress={() => {
                  if (locked) {
                    closeLeft();
                    setShowGuestModal(true);
                  } else {
                    closeLeft();
                    navigation?.navigate(item.screen, item.params);
                  }
                }}
              >
                <Text style={[styles.sidebarItemIcon, locked && styles.dimmed]}>{item.icon}</Text>
                <Text style={[styles.sidebarItemLabel, locked && styles.sidebarItemLabelLocked]}>{item.label}</Text>
                {locked && <Text style={styles.sidebarLockIcon}>🔒</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sidebarDivider} />
        {isGuest ? (
          <TouchableOpacity style={styles.sidebarBottomBtn} activeOpacity={0.8} onPress={handleCreateAccount}>
            <LinearGradient colors={['#7C3AED', '#4f1db5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sidebarBottomGradient}>
              <Text style={styles.sidebarBottomIcon}>✦</Text>
              <Text style={styles.sidebarBottomText}>Log In</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.sidebarBottomBtn} activeOpacity={0.8} onPress={handleLogout}>
            <LinearGradient colors={['#ff003322', '#ff003344']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sidebarBottomGradient}>
              <Text style={styles.sidebarBottomIcon}>🚪</Text>
              <Text style={[styles.sidebarBottomText, { color: '#ff6680' }]}>Log Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        <View style={{ height: 32 }} />
      </Animated.View>

      {/* Right Sidebar */}
      <Animated.View style={[styles.sidebar, styles.sidebarRight, { transform: [{ translateX: rightAnim }] }]}>
        <LinearGradient colors={['#001a40', '#000d30', '#08001a']} style={StyleSheet.absoluteFill} />
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarAvatarEmoji}>🫂</Text>
          <Text style={styles.sidebarUsername}>Friends</Text>
        </View>
        <View style={styles.sidebarDivider} />
        <ScrollView>
          {rightMenuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.sidebarItem}
              activeOpacity={0.7}
              onPress={() => {
                closeRight();
                navigation?.navigate(item.screen, { username });
              }}
            >
              <Text style={styles.sidebarItemIcon}>{item.icon}</Text>
              <Text style={styles.sidebarItemLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Logout confirmation modal */}
      <Modal transparent visible={showLogoutModal} animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <LinearGradient colors={['#1a0040', '#0d0030']} style={StyleSheet.absoluteFill} borderRadius={24} />
            <Text style={styles.modalTitle}>Log Out?</Text>
            <Text style={styles.modalSub}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowLogoutModal(false)} activeOpacity={0.8}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmLogout} activeOpacity={0.8}>
                <LinearGradient colors={['#ff0033', '#cc0022']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalConfirmGradient}>
                  <Text style={styles.modalConfirmText}>Yes, Log Out</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Guest lock modal */}
      <Modal transparent visible={showGuestModal} animationType="fade" onRequestClose={() => setShowGuestModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <LinearGradient colors={['#1a0040', '#0d0030']} style={StyleSheet.absoluteFill} borderRadius={24} />
            <Text style={styles.guestModalEmoji}>🔒</Text>
            <Text style={styles.modalTitle}>Members Only</Text>
            <Text style={styles.modalSub}>Log in or create an account to access this feature.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowGuestModal(false)} activeOpacity={0.8}>
                <Text style={styles.modalCancelText}>Not Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleGuestLoginRedirect} activeOpacity={0.8}>
                <LinearGradient colors={['#7C3AED', '#4f1db5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalConfirmGradient}>
                  <Text style={styles.modalConfirmText}>Log In</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 20 },
  userPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, gap: 6,
  },
  userEmoji: { fontSize: 16 },
  userPillText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, gap: 12,
  },
  welcomeText: { color: '#fff', fontSize: 38, fontWeight: '900', letterSpacing: 1 },
  subText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 24 },
  modeCards: { width: '100%', gap: 16 },
  modeCard: {
    width: '100%', borderRadius: 24, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  modeCardLocked: { opacity: 0.7 },
  modeCardGradient: { padding: 28, alignItems: 'center', gap: 6 },
  modeCardEmoji: { fontSize: 40 },
  modeCardTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  modeCardSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  lockBadge: { fontSize: 18, position: 'absolute', top: 14, right: 18 },
  dimmed: { opacity: 0.45 },
  dimmedSub: { color: 'rgba(255,255,255,0.35)', fontSize: 14 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 10,
  },

  sidebar: {
    position: 'absolute', top: 0, bottom: 0,
    width: SIDEBAR_WIDTH, zIndex: 20, overflow: 'hidden',
  },
  sidebarLeft: { left: 0 },
  sidebarRight: { right: 0 },

  sidebarHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 64, paddingHorizontal: 24, paddingBottom: 20, gap: 14,
  },
  sidebarAvatarEmoji: { fontSize: 36 },
  sidebarUsername: { color: '#fff', fontSize: 20, fontWeight: '800' },
  sidebarDivider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 20, marginBottom: 8,
  },
  sidebarItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 18, paddingHorizontal: 24, gap: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  sidebarItemLocked: { opacity: 0.5 },
  sidebarItemIcon: { fontSize: 22 },
  sidebarItemLabel: { color: '#fff', fontSize: 17, fontWeight: '600', flex: 1 },
  sidebarItemLabelLocked: { color: 'rgba(255,255,255,0.45)' },
  sidebarLockIcon: { fontSize: 14 },

  sidebarBottomBtn: {
    marginHorizontal: 16, marginTop: 10,
    borderRadius: 16, overflow: 'hidden',
  },
  sidebarBottomGradient: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 20, gap: 12,
  },
  sidebarBottomIcon: { fontSize: 20 },
  sidebarBottomText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    width: width * 0.82, borderRadius: 24, overflow: 'hidden',
    padding: 28, alignItems: 'center', gap: 10,
  },
  guestModalEmoji: { fontSize: 40, marginBottom: 4 },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 },
  modalSub: { color: 'rgba(255,255,255,0.55)', fontSize: 15, textAlign: 'center', marginBottom: 8 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancel: {
    flex: 1, paddingVertical: 14, borderRadius: 50,
    alignItems: 'center', borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalCancelText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '600' },
  modalConfirm: { flex: 1, borderRadius: 50, overflow: 'hidden' },
  modalConfirmGradient: { paddingVertical: 14, alignItems: 'center' },
  modalConfirmText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});