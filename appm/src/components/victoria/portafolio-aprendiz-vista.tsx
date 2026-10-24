import { Ionicons } from '@expo/vector-icons';
import { Link, router, useFocusEffect } from 'expo-router';
import { Fragment, useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { DocumentoPreviewModal } from '@/components/victoria/documento-preview-modal';
import { LogoV } from '@/components/victoria/logo-v';
import { styles } from '@/components/victoria/portafolio-aprendiz.styles';
import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { ExitButton, PaneHeader } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import {
  CoordinadorApiError,
  obtenerAprendizDetalle,
  obtenerPortafolioAprendizArchivosCarpeta,
  obtenerPortafolioAprendizArchivosSubcarpeta,
  obtenerPortafolioAprendizCarpetas,
  obtenerPortafolioAprendizCarpetasSubcarpeta,
  obtenerPortafolioAprendizDetalleCarpeta,
  obtenerPortafolioAprendizSubcarpetas,
} from '@/lib/coordinador';
import { formatearFechaCorta } from '@/lib/formato-perfil';
import { type ArchivoPortafolio, NOMBRES_CARPETA, NOMBRES_SUBCARPETA } from '@/lib/portafolio';
import { useRoleGuard } from '@/lib/role-guard';

/** Una fila de la tabla: una carpeta (se entra a ella) o un archivo (se abre la vista previa). */
type Fila = {
  clave: string;
  nombre: string;
  fecha: string | null;
  /** Solo las carpetas: cuántos documentos contienen. */
  totalArchivos?: number;
  /** Solo las carpetas: a dónde se navega al tocarlas. */
  href?: string;
  /** Solo los archivos. */
  archivo?: ArchivoPortafolio;
};

const mensajeDe = (err: unknown, porDefecto: string) =>
  err instanceof CoordinadorApiError || err instanceof Error ? err.message : porDefecto;

/**
 * Portafolio de UN aprendiz visto por el coordinador (SOLO LECTURA). Es la misma
 * navegación que ve el aprendiz, de 4 niveles según `ruta`:
 *
 *   []                          -> las 5 carpetas fijas
 *   [categoria]                 -> los 4 trimestres (TRIM_I..IV)
 *   [categoria, subcarpeta]     -> carpetas del aprendiz + archivos sueltos
 *   [categoria, subcarpeta, id] -> archivos de una carpeta del aprendiz
 *
 * Al tocar un archivo se abre la vista previa (PDF, Word o imagen).
 */
export function PortafolioAprendizVista({
  idFicha,
  idAprendiz,
  ruta,
}: {
  idFicha: string;
  idAprendiz: string;
  ruta: string[];
}) {
  const perfil = useRoleGuard(['coordinador']);
  const idAprendizNum = Number(idAprendiz);
  const [categoria, subcarpeta, idCarpetaTxt] = ruta;
  const longitudRuta = ruta.length;
  const nivel = Math.min(longitudRuta, 3);

  const urlPerfil = `/victoria/coordinador/fichas/${idFicha}/aprendices/${idAprendiz}`;
  const base = `${urlPerfil}/portafolio`;

  const [nombreAprendiz, setNombreAprendiz] = useState('');
  const [filas, setFilas] = useState<Fila[] | null>(null);
  const [nombreCarpeta, setNombreCarpeta] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<ArchivoPortafolio | null>(null);

  // La pantalla se reutiliza al bajar de nivel (mismo archivo de ruta, otros
  // parámetros): este contador descarta respuestas de una carga anterior que
  // lleguen tarde y pisarían la de la carpeta actual.
  const cargaActual = useRef(0);

  const cargar = useCallback(() => {
    if (!perfil) return;
    const numeroCarga = ++cargaActual.current;
    const vigente = () => numeroCarga === cargaActual.current;

    setFilas(null);
    setNombreCarpeta(null);
    setError(null);

    const idCarpeta = idCarpetaTxt === undefined ? undefined : Number(idCarpetaTxt);
    if (!idAprendizNum || Number.isNaN(idAprendizNum) || longitudRuta > 3 || (idCarpeta !== undefined && Number.isNaN(idCarpeta))) {
      setError('La ruta del portafolio no es válida.');
      return;
    }

    obtenerAprendizDetalle(idAprendizNum)
      .then((a) => vigente() && setNombreAprendiz(a.nombre_completo))
      .catch((err) => vigente() && setError(mensajeDe(err, 'No se pudo cargar el aprendiz.')));

    const hrefDe = (...partes: (string | number)[]) => [base, ...partes].join('/');
    const deArchivo = (a: ArchivoPortafolio): Fila => ({
      clave: `archivo-${a.id_archivo}`,
      nombre: a.nombre_archivo,
      fecha: a.fecha_subida,
      archivo: a,
    });

    let pedido: Promise<Fila[]>;
    if (categoria === undefined) {
      pedido = obtenerPortafolioAprendizCarpetas(idAprendizNum).then((lista) =>
        lista.map((c) => ({
          clave: c.categoria,
          nombre: c.nombre,
          fecha: c.ultima_modificacion,
          totalArchivos: c.total_archivos,
          href: hrefDe(c.categoria),
        }))
      );
    } else if (subcarpeta === undefined) {
      pedido = obtenerPortafolioAprendizSubcarpetas(idAprendizNum, categoria).then((lista) =>
        lista.map((s) => ({
          clave: s.subcarpeta,
          nombre: s.nombre,
          fecha: s.ultima_modificacion,
          totalArchivos: s.total_archivos,
          href: hrefDe(categoria, s.subcarpeta),
        }))
      );
    } else if (idCarpeta === undefined) {
      pedido = Promise.all([
        obtenerPortafolioAprendizCarpetasSubcarpeta(idAprendizNum, categoria, subcarpeta),
        obtenerPortafolioAprendizArchivosSubcarpeta(idAprendizNum, categoria, subcarpeta),
      ]).then(([carpetas, archivos]) => [
        ...carpetas.map((c) => ({
          clave: `carpeta-${c.id_carpeta}`,
          nombre: c.nombre,
          fecha: c.ultima_modificacion,
          totalArchivos: c.total_archivos,
          href: hrefDe(categoria, subcarpeta, c.id_carpeta),
        })),
        ...archivos.map(deArchivo),
      ]);
    } else {
      pedido = Promise.all([
        obtenerPortafolioAprendizDetalleCarpeta(idAprendizNum, categoria, subcarpeta, idCarpeta),
        obtenerPortafolioAprendizArchivosCarpeta(idAprendizNum, categoria, subcarpeta, idCarpeta),
      ]).then(([carpeta, archivos]) => {
        if (vigente()) setNombreCarpeta(carpeta.nombre);
        return archivos.map(deArchivo);
      });
    }

    pedido
      .then((resultado) => vigente() && setFilas(resultado))
      .catch((err) => vigente() && setError(mensajeDe(err, 'No se pudo cargar el portafolio.')));
  }, [perfil, idAprendizNum, categoria, subcarpeta, idCarpetaTxt, longitudRuta, base]);

  useFocusEffect(cargar);

  if (perfil === undefined) {
    return (
      <VictoriaScreenShell>
        <ActivityIndicator color={VictoriaColors.white} style={styles.loader} />
      </VictoriaScreenShell>
    );
  }
  if (!perfil) return null;

  const titulo = nombreAprendiz ? `Portafolio - ${nombreAprendiz}` : 'Portafolio';

  // Migas de pan: todas las de arriba son enlaces; la última es la "actual".
  const migas: { etiqueta: string; href?: string }[] = [{ etiqueta: titulo, href: base }];
  if (categoria) {
    migas.push({
      etiqueta: (NOMBRES_CARPETA[categoria] ?? categoria).toUpperCase(),
      href: `${base}/${categoria}`,
    });
  }
  if (subcarpeta) {
    migas.push({ etiqueta: NOMBRES_SUBCARPETA[subcarpeta] ?? subcarpeta, href: `${base}/${categoria}/${subcarpeta}` });
  }
  if (idCarpetaTxt) migas.push({ etiqueta: nombreCarpeta ?? '…' });

  const volverA = [urlPerfil, base, `${base}/${categoria}`, `${base}/${categoria}/${subcarpeta}`][nivel];
  const sinContenido = filas !== null && filas.length === 0;

  return (
    <VictoriaScreenShell>
      <PaneHeader eyebrow={`Portafolio ${new Date().getFullYear()}`} title={titulo} backHref={volverA} />

      <View style={styles.breadcrumbRow}>
        {migas.map((miga, i) => {
          const esUltima = i === migas.length - 1;
          return (
            <Fragment key={`${i}-${miga.etiqueta}`}>
              {i > 0 ? <Text style={styles.crumbSep}>›</Text> : null}
              {esUltima && i > 0 ? (
                <Text style={styles.crumbActual}>{miga.etiqueta}</Text>
              ) : miga.href && !(i === 0 && migas.length === 1) ? (
                <Link href={miga.href as never} style={styles.crumb}>
                  {miga.etiqueta}
                </Link>
              ) : (
                <Text style={styles.crumb}>{miga.etiqueta}</Text>
              )}
            </Fragment>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.colNombre, styles.headerNombre]}>Nombre</Text>
          <Text style={[styles.headerCell, styles.colDato]}>Modificado</Text>
          <Text style={[styles.headerCell, styles.colDato]}>Modificado Por</Text>
          <Text style={[styles.headerCell, styles.colDato]}>Archivos</Text>
        </View>

        {!filas && !error ? <ActivityIndicator color={VictoriaColors.darkGreen} style={styles.loader} /> : null}

        {sinContenido ? (
          <View style={styles.vacio}>
            <LogoV size={96} />
            <Text style={styles.vacioTitulo}>Esta carpeta está vacía</Text>
            <Text style={styles.vacioTexto}>
              {nombreAprendiz ? `${nombreAprendiz} todavía no ha subido contenido aquí.` : 'Todavía no hay contenido aquí.'}
            </Text>
          </View>
        ) : null}

        {filas?.map((fila) => {
          const esCarpeta = fila.archivo === undefined;
          const total = fila.totalArchivos ?? 0;
          return (
            <Pressable
              key={fila.clave}
              style={styles.row}
              accessibilityRole="button"
              accessibilityLabel={esCarpeta ? `Abrir carpeta ${fila.nombre}` : `Ver ${fila.nombre}`}
              onPress={() => (esCarpeta ? router.push(fila.href as never) : setVistaPrevia(fila.archivo!))}>
              <View style={[styles.rowMain, styles.colNombre]}>
                <View style={esCarpeta ? styles.folderIcon : styles.fileIcon}>
                  <Ionicons
                    name={esCarpeta ? 'folder' : 'document-text-outline'}
                    size={16}
                    color={VictoriaColors.white}
                  />
                </View>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {fila.nombre}
                </Text>
              </View>
              <Text style={[styles.rowText, styles.colDato]}>{formatearFechaCorta(fila.fecha)}</Text>
              <Text style={[styles.rowText, styles.colDato]}>
                {(!esCarpeta || total > 0) && nombreAprendiz ? nombreAprendiz : '—'}
              </Text>
              <Text style={[styles.rowText, styles.colDato]}>
                {esCarpeta ? `${total} ${total === 1 ? 'doc' : 'docs'}` : '—'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ExitButton />

      <DocumentoPreviewModal
        visible={vistaPrevia !== null}
        titulo={vistaPrevia?.nombre_archivo ?? ''}
        subtitulo={titulo}
        url={vistaPrevia?.url ?? null}
        nombre={vistaPrevia?.nombre_archivo ?? null}
        onClose={() => setVistaPrevia(null)}
      />
    </VictoriaScreenShell>
  );
}
