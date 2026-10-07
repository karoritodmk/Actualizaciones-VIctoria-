/**
 * Estilos de components/victoria/panels.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'flex-end',
  },
  panelWrap: {
    marginTop: 80,
    marginRight: 24,
    width: 320,
    maxWidth: '90%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  panel: {
    backgroundColor: 'rgba(225, 232, 222, 0.95)',
    padding: 24,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  panelHeaderRight: {
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a3322',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  notifDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8fa47e',
    marginTop: 5,
  },
  notifDotLeida: {
    backgroundColor: 'rgba(85, 107, 92, 0.25)',
  },
  notifDeleteBtn: {
    padding: 4,
    marginTop: 2,
  },
  notifLoader: {
    marginVertical: 20,
  },
  notifError: {
    color: '#a33b3b',
    fontSize: 13,
  },
  notifEmpty: {
    color: '#6b6b6b',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 20,
  },
  notifTextWrap: {
    flex: 1,
    gap: 2,
  },
  notifLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b6b6b',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a3322',
    lineHeight: 18,
  },
  notifText: {
    fontSize: 13,
    color: '#242424',
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: '#7a7a7a',
  },
  profileCenter: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: 18,
  },
  profileInfo: {
    gap: 12,
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#8fa47e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#4a4a4a',
    flexShrink: 1,
  },
  logoutButton: {
    backgroundColor: '#8fa47e',
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});
