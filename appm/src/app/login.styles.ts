/**
 * Estilos de app/login.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    width: '95%',
    maxWidth: 1180,
    minHeight: 640,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 40,
    overflow: 'hidden',
  },
  leftPanel: {
    width: Platform.OS === 'web' ? '50%' : '100%',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    padding: 30,
    gap: 15,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 28,
    overflow: 'hidden',
  },
  loginCard: {
    padding: 30,
  },
  loginHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandText: {
    fontSize: 26,
    fontWeight: '300',
    letterSpacing: 4,
    color: '#ffffff',
  },
  vMiniLogo: {
    width: 28,
    height: 28,
  },
  loginTitle: {
    fontSize: 30,
    fontWeight: '400',
    color: '#ffffff',
    marginBottom: 20,
  },
  customInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 6,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputIconWrapper: {
    backgroundColor: '#ffffff',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputIconGlyph: {
    fontSize: 14,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    fontSize: 16,
    outlineStyle: 'none',
  } as never,
  togglePasswordBtn: {
    paddingHorizontal: 10,
  },
  loginInfoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
    lineHeight: 19,
    marginVertical: 15,
  },
  errorText: {
    fontSize: 12,
    color: '#ff8080',
    marginBottom: 12,
  },
  loginFooterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnForgotPassword: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  btnForgotPasswordText: {
    color: '#ffffff',
    fontSize: 13,
  },
  btnSubmitArrow: {
    backgroundColor: '#ffffff',
    width: 55,
    height: 40,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSubmitArrowDisabled: {
    opacity: 0.6,
  },
  btnSubmitArrowText: {
    color: '#000000',
    fontSize: 18,
  },
  supportBar: {
    backgroundColor: '#143520',
    borderRadius: 25,
    paddingVertical: 20,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  supportMeta: {
    gap: 2,
  },
  supportTitle: {
    fontSize: 19,
    fontWeight: '400',
    color: '#ffffff',
  },
  supportSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  supportActionBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 5,
    paddingRight: 5,
    paddingLeft: 15,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  supportActionText: {
    color: '#143520',
    fontWeight: '600',
    fontSize: 13,
  },
  arrowCircle: {
    backgroundColor: '#143520',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircleText: {
    color: '#ffffff',
    fontSize: 14,
  },
  rightPanel: {
    width: Platform.OS === 'web' ? '50%' : '100%',
    minHeight: Platform.OS === 'web' ? undefined : 260,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Platform.OS === 'web' ? 0 : 20,
  },
});

export const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    padding: 24,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1a3322', marginBottom: 12 },
  label: { fontSize: 13, color: '#556b5c', marginBottom: 16, lineHeight: 18 },
  error: { color: '#c0392b', fontSize: 13, marginBottom: 12 },
  success: { color: '#146c43', fontSize: 13, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 14,
    color: '#1a3322',
    backgroundColor: '#fff',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1a3322',
  } as never,
  passwordToggleBtn: {
    paddingHorizontal: 12,
  },
  requisitosBox: {
    marginBottom: 14,
    gap: 4,
  },
  requisito: {
    fontSize: 12,
    color: '#a33b3b',
  },
  requisitoCumplido: {
    color: '#146c43',
  },
  button: {
    backgroundColor: '#8fa47e',
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  cancelBtn: { alignItems: 'center', marginTop: 14 },
  cancelText: { color: '#888', fontSize: 13 },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
