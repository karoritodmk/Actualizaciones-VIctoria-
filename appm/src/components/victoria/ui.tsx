import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { VictoriaColors } from '@/constants/victoria-theme';
import { styles } from './ui.styles';

/** .pane-context-header + .hierarchy-tracker + .pane-main-title */
export function PaneHeader({
  eyebrow,
  title,
  backHref,
}: {
  eyebrow: string;
  title: string;
  backHref?: string;
}) {
  return (
    <View style={styles.paneHeader}>
      {backHref ? (
        <Link href={backHref as never} style={styles.hierarchyTracker}>
          {'< Volver - ' + eyebrow}
        </Link>
      ) : (
        <Text style={styles.hierarchyTracker}>{eyebrow}</Text>
      )}
      <Text style={styles.paneMainTitle}>{title}</Text>
    </View>
  );
}

/** .figma-data-card (si recibe onPress, la tarjeta completa se vuelve tocable) */
export function DataCard({
  icon,
  title,
  subtitle,
  style,
  onPress,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const contenido = (
    <>
      {icon ? (
        <View style={styles.dataCardIcon}>
          <Ionicons name={icon} size={20} color={VictoriaColors.textOnLight} />
        </View>
      ) : null}
      <View style={styles.dataCardText}>
        <Text style={styles.dataCardTitle}>{title}</Text>
        <Text style={styles.dataCardSubtitle}>{subtitle}</Text>
      </View>
    </>
  );


  if (!onPress) {
    return <View style={[styles.dataCard, style] as any}>{contenido}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.dataCard, style, pressed && styles.dataCardPressed] as any}>
      {contenido}
    </Pressable>
  );
}

  
/** .figma-highlight-num + subtitle, centered variant of the data card */
export function HighlightCard({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={[styles.dataCard, styles.highlightCard]}>
      <Text style={styles.highlightNum}>{value}</Text>
      <Text style={styles.dataCardSubtitle}>{label}</Text>
    </View>
  );
}

/** .figma-list-row */
export function ListRow({
  icon,
  title,
  subtitle,
  actionLabel,
  onPressAction,
  actionHref,
  chevronHref,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onPressAction?: () => void;
  actionHref?: string;
  chevronHref?: string;
}) {
  const action = actionLabel ? (
    <Text style={styles.actionButtonText}>{actionLabel}</Text>
  ) : null;

  return (
    <View style={styles.listRow}>
      <View style={styles.listRowMain}>
        {icon ? (
          <View style={styles.rowIconIndicator}>
            <Ionicons name={icon} size={18} color={VictoriaColors.white} />
          </View>
        ) : null}
        <View style={styles.listRowTextWrap}>
          <Text style={styles.rowMainText}>{title}</Text>
          <Text style={styles.rowSubText}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.listRowRight}>
        {actionLabel ? (
          actionHref ? (
            <Link href={actionHref as never} style={styles.actionButton}>
              {action}
            </Link>
          ) : (
            <Pressable style={styles.actionButton} onPress={onPressAction}>
              {action}
            </Pressable>
          )
        ) : null}
        {chevronHref ? (
          <Link href={chevronHref as never} style={styles.chevronButton}>
            <View style={styles.chevronInner}>
              <Ionicons name="chevron-forward" size={16} color={VictoriaColors.textOnLight} />
            </View>
          </Link>
        ) : null}
      </View>
    </View>
  );
}

/** .figma-sub-card */
export function SubCard({
  icon,
  title,
  subtitle,
  actionLabel,
  actionHref,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <View style={styles.subCard}>
      <View style={styles.listRowMain}>
        {icon ? (
          <View style={styles.subCardIcon}>
            <Ionicons name={icon} size={16} color={VictoriaColors.textOnLight} />
          </View>
        ) : null}
        <View style={styles.listRowTextWrap}>
          <Text style={styles.subCardTitle}>{title}</Text>
          <Text style={styles.subCardTeacher}>{subtitle}</Text>
        </View>
      </View>
      {actionLabel && actionHref ? (
        <Link href={actionHref as never} style={styles.badgeButton}>
          {actionLabel}
        </Link>
      ) : null}
    </View>
  );
}

/** .badge.bg-success-subtle */
export function StatusBadge({ label }: { label: string }) {
  return (
    <View style={styles.statusBadge}>
      <Text style={styles.statusBadgeText}>{label}</Text>
    </View>
  );
}

/** .btn.rounded-pill trimester tabs used in portafolio / seguimiento */
export function PillTab({
  label,
  count,
  active,
  href,
}: {
  label: string;
  count: number;
  active?: boolean;
  href: string;
}) {
  return (
    <Link href={href as never} style={[styles.pillTab, active && styles.pillTabActive]}>
      <Text style={[styles.pillTabText, active && styles.pillTabTextActive]}>
        {label}
        {'  '}
      </Text>
      <View style={[styles.pillTabBadge, active && styles.pillTabBadgeActive]}>
        <Text style={[styles.pillTabBadgeText, active && styles.pillTabBadgeTextActive]}>
          {count}
        </Text>
      </View>
    </Link>
  );
}

/**
 * El botón de cerrar sesión ahora vive en VictoriaScreenShell (afuera del
 * panel de cristal, esquina inferior izquierda). Se deja este componente
 * vacío para que las pantallas que aún lo usan no se rompan.
 */
export function ExitButton() {
  return null;
}

/**
 * Chip de filtro local (Todos / De Planta / Tecnico / Transversal en la
 * lista de instructores de una sede). A diferencia de PillTab no navega:
 * cambia un estado en la misma pantalla, por eso recibe onPress en vez
 * de href, y un punto de color en vez de un contador.
 */
export function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}>
      <View style={[styles.filterChipDot, active && styles.filterChipDotActive]} />
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

/** Píldora de acción genérica — variantes .btn-accent-solid / .btn-accent-soft */
export function PillButton({
  label,
  icon,
  variant = 'dark',
  onPress,
  href,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'dark' | 'light';
  onPress?: () => void;
  href?: string;
}) {
  const content = (
    <>
      {icon ? (
        <Ionicons
          name={icon}
          size={13}
          color={variant === 'dark' ? VictoriaColors.white : VictoriaColors.textOnLight}
        />
      ) : null}
      <Text style={variant === 'dark' ? styles.pillButtonTextDark : styles.pillButtonTextLight}>
        {icon ? '  ' : ''}
        {label}
      </Text>
    </>
  );

  if (href) {
    return (
      <Link
        href={href as never}
        style={[styles.pillButton, variant === 'dark' ? styles.pillButtonDark : styles.pillButtonLight]}>
        {content}
      </Link>
    );
  }

  return (
    <Pressable
      style={[styles.pillButton, variant === 'dark' ? styles.pillButtonDark : styles.pillButtonLight]}
      onPress={onPress}>
      {content}
    </Pressable>
  );
}

/** Caja de búsqueda translúcida — "Encontrar sede" / "Encontrar instructor" */
export function SearchPill({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.searchPill}>
      <Ionicons name="search-outline" size={15} color="rgba(255,255,255,0.5)" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.45)"
        style={styles.searchPillInput}
      />
    </View>
  );
}

/** Miniatura de archivo — "Hoja de vida" del instructor, evidencias de una competencia */
export function FileThumbnail({ label, href }: { label: string; href?: string }) {
  const inner = (
    <>
      <Text style={styles.fileThumbLabel}>{label}</Text>
      <View style={styles.fileThumbPreview}>
        <Ionicons name="document-text-outline" size={22} color="rgba(28, 53, 45, 0.35)" />
      </View>
    </>
  );

  if (href) {
    return (
      <Link href={href as never} style={styles.fileThumb}>
        {inner}
      </Link>
    );
  }
  return <View style={styles.fileThumb}>{inner}</View>;
}

/**
 * Botón flotante de acción destacada — "Ir a Portafolio". Con
 * `disabled` se ve apagado y no navega ni dispara onPress; úsalo para
 * instructores contratistas, que no tienen portafolio.
 */
export function FloatingActionPill({
  label,
  href,
  onPress,
  disabled,
}: {
  label: string;
  href?: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <View style={[styles.floatingAction, styles.floatingActionDisabled]}>
        <Text style={[styles.floatingActionText, styles.floatingActionTextDisabled]}>
          {label}
        </Text>
      </View>
    );
  }
  if (href) {
    return (
      <Link href={href as never} style={styles.floatingAction}>
        {label}
      </Link>
    );
  }
  return (
    <Pressable style={styles.floatingAction} onPress={onPress}>
      <Text style={styles.floatingActionText}>{label}</Text>
    </Pressable>
  );
}



