/**
 * Estilos de components/victoria/navbar.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    flexWrap: 'wrap',
    gap: 10,
  },
  brandWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: VictoriaColors.white,
  },
  centralNav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 5,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  menuTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 50,
  },
  menuTabItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  menuTabText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  menuTabTextActive: {
    color: VictoriaColors.white,
    fontWeight: '600',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: '#e05252',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
});
