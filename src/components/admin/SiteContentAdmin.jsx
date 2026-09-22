import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileText, Image as ImageIcon, Link as LinkIcon, RefreshCw, RotateCcw, Save, Search, Upload } from 'lucide-react';
import { translations } from '../../translations/translations';
import { SITE_ASSETS } from '../../data/siteAssets';
import { getSiteContent, saveSiteContent, uploadSiteImage } from '../../services/siteContentService';
import { useLanguage } from '../../translations/LanguageContext';

// ─── Secciones del sitio (agrupan claves de traducción + imágenes/enlaces) ───
const SECTIONS = [
  { id: 'nav', label: 'Navegación', textPrefixes: ['nav'], assetPrefixes: ['layout.logoNavbar'] },
  { id: 'hero', label: 'Inicio · Portada', textPrefixes: ['hero'], assetPrefixes: ['hero.'] },
  { id: 'about', label: 'Inicio · Quiénes somos', textPrefixes: ['about'], assetPrefixes: [] },
  { id: 'stats', label: 'Inicio · Cifras', textPrefixes: ['stats'], assetPrefixes: ['stats.'] },
  { id: 'programs', label: 'Inicio · Programas', textPrefixes: ['programs'], assetPrefixes: ['programs.'] },
  { id: 'actionLines', label: 'Inicio · Líneas de acción', textPrefixes: ['actionLines'], assetPrefixes: ['actionLines.'] },
  { id: 'testimonials', label: 'Inicio · Testimonios', textPrefixes: ['testimonials'], assetPrefixes: ['testimonials.'] },
  { id: 'impact', label: 'Inicio · Impacto', textPrefixes: ['impact'], assetPrefixes: [] },
  { id: 'nosotros', label: 'Nosotros', textPrefixes: ['nosotros'], assetPrefixes: ['nosotros.'] },
  { id: 'vinculate', label: 'Vincúlate', textPrefixes: ['vinculate'], assetPrefixes: ['vinculate.'] },
  { id: 'marketplace', label: 'Directorio comercial', textPrefixes: ['marketplace'], assetPrefixes: ['marketplace.'] },
  { id: 'donation', label: 'Donar · Formulario', textPrefixes: ['donation', 'donationPrivacy'], assetPrefixes: ['donar.'] },
  { id: 'recurring', label: 'Donar · Pago recurrente', textPrefixes: ['recurring', 'cancelRecurring'], assetPrefixes: [] },
  { id: 'contact', label: 'Contacto', textPrefixes: ['contact'], assetPrefixes: [] },
  { id: 'footer', label: 'Pie de página', textPrefixes: ['footer'], assetPrefixes: ['layout.logoFooter', 'layout.politicaDatos', 'layout.avisoPrivacidad'] },
];

// Aplana translations.es a [{ key: 'hero.title', es: '...', en: '...' }]
const flatten = (obj, prefix = '', out = []) => {
  Object.entries(obj).forEach(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flatten(v, key, out);
    else out.push(key);
  });
  return out;
};
const getPath = (obj, path) => path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj);

const ALL_TEXT_KEYS = flatten(translations.es);
const TEXT_DEFAULTS = Object.fromEntries(ALL_TEXT_KEYS.map((k) => [k, { es: getPath(translations.es, k) ?? '', en: getPath(translations.en, k) ?? '' }]));

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'application/pdf'];

/**
 * Pestaña "Contenido del sitio" del panel admin (CMS).
 * Cada texto e imagen del sitio se puede sobreescribir en español e inglés;
 * un campo vacío vuelve al valor por defecto del código.
 */
const SiteContentAdmin = () => {
  const { refreshContent } = useLanguage();
  const [saved, setSaved] = useState({ es: {}, en: {} }); // lo que hay en el backend
  const [draft, setDraft] = useState({ es: {}, en: {} }); // edición local
  const [section, setSection] = useState(SECTIONS[0].id);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploadingKey, setUploadingKey] = useState(null);
  const fileRef = useRef(null);
  const pendingUpload = useRef(null); // { key, lang }
  const loadSeq = useRef(0);
  const initialized = useRef(false);

  const load = async () => {
    const seq = ++loadSeq.current;
    setLoading(true);
    setError(null);
    try {
      const data = await getSiteContent();
      if (seq !== loadSeq.current) return; // llegó una carga más reciente
      setSaved(data);
      setDraft(JSON.parse(JSON.stringify(data)));
    } catch (err) {
      if (seq === loadSeq.current) setError(err?.message || 'No se pudo cargar el contenido');
    } finally {
      if (seq === loadSeq.current) setLoading(false);
    }
  };
  // Una sola carga inicial (en desarrollo React monta dos veces y la segunda
  // respuesta pisaría lo que el admin ya empezó a escribir)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const current = SECTIONS.find((s) => s.id === section);

  const textKeys = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_TEXT_KEYS
      .filter((k) => current.textPrefixes.some((p) => k === p || k.startsWith(`${p}.`)))
      .filter((k) => !q || k.toLowerCase().includes(q) || TEXT_DEFAULTS[k].es.toLowerCase().includes(q) || TEXT_DEFAULTS[k].en.toLowerCase().includes(q));
  }, [current, search]);

  const assets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SITE_ASSETS
      .filter((a) => current.assetPrefixes.some((p) => a.key === p || a.key.startsWith(p)))
      .filter((a) => !q || a.label.toLowerCase().includes(q) || a.key.toLowerCase().includes(q));
  }, [current, search]);

  // Valor actual (borrador) o por defecto
  const valueOf = (key, lang, def) => (draft[lang]?.[key] !== undefined ? draft[lang][key] : (saved[lang]?.[key] ?? def));
  const isOverridden = (key, lang) => Boolean((draft[lang]?.[key] ?? saved[lang]?.[key])?.trim?.());
  const setValue = (key, lang, value) => setDraft((prev) => ({ ...prev, [lang]: { ...prev[lang], [key]: value } }));

  // Cambios pendientes: claves cuyo borrador difiere de lo guardado
  const changes = useMemo(() => {
    const items = [];
    ['es', 'en'].forEach((lang) => {
      Object.entries(draft[lang] || {}).forEach(([key, value]) => {
        if ((saved[lang]?.[key] ?? '') !== (value ?? '')) {
          items.push({ clave: key, idioma: lang, valor: value ?? '', tipo: key.startsWith('img.') ? 'image' : 'text' });
        }
      });
    });
    return items;
  }, [draft, saved]);

  const sectionHasChanges = (sec) => changes.some((c) => {
    const bare = c.clave.replace(/^img\./, '');
    return c.clave.startsWith('img.')
      ? sec.assetPrefixes.some((p) => bare === p || bare.startsWith(p))
      : sec.textPrefixes.some((p) => c.clave === p || c.clave.startsWith(`${p}.`));
  });

  const handleSave = async () => {
    if (!changes.length) return;
    setSaving(true);
    setError(null);
    try {
      await saveSiteContent(changes);
      const next = JSON.parse(JSON.stringify(saved));
      changes.forEach((c) => {
        if (c.valor.trim()) next[c.idioma][c.clave] = c.valor;
        else delete next[c.idioma][c.clave];
      });
      setSaved(next);
      setDraft(JSON.parse(JSON.stringify(next)));
      await refreshContent();
      setToast(`${changes.length} cambio(s) publicado(s). Ya se ven en el sitio.`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => setDraft(JSON.parse(JSON.stringify(saved)));

  const askUpload = (key, lang) => {
    pendingUpload.current = { key, lang };
    fileRef.current?.click();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const target = pendingUpload.current;
    if (!file || !target) return;
    if (!IMAGE_TYPES.includes(file.type)) return setError('Solo se permiten imágenes (JPG, PNG, WEBP, SVG, GIF) o PDF');
    if (file.size > 10 * 1024 * 1024) return setError('El archivo debe pesar menos de 10 MB');
    setUploadingKey(`${target.key}:${target.lang}`);
    setError(null);
    try {
      const url = await uploadSiteImage(file);
      setValue(target.key, target.lang, url);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo subir el archivo');
    } finally {
      setUploadingKey(null);
    }
  };

  const LangBadge = ({ lang }) => (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${lang === 'es' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{lang.toUpperCase()}</span>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <input ref={fileRef} type="file" accept={IMAGE_TYPES.join(',')} className="hidden" onChange={handleFile} />

      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5" /> {toast}
        </div>
      )}

      {/* Barra superior */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar un texto o imagen en esta sección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
          />
        </div>
        <button onClick={load} disabled={loading || saving} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Recargar
        </button>
        <button onClick={discard} disabled={!changes.length || saving} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold disabled:opacity-50">
          <RotateCcw className="h-4 w-4" /> Descartar
        </button>
        <button onClick={handleSave} disabled={!changes.length || saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Publicando...' : `Publicar cambios${changes.length ? ` (${changes.length})` : ''}`}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0" /> <span>{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-[240px_1fr] gap-6">
        {/* Secciones */}
        <nav className="bg-white rounded-xl shadow-md p-3 h-fit md:sticky md:top-6">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSection(s.id); setSearch(''); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between transition ${
                section === s.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {s.label}
              {sectionHasChanges(s) && <span className={`w-2 h-2 rounded-full ${section === s.id ? 'bg-white' : 'bg-orange-500'}`} />}
            </button>
          ))}
        </nav>

        {/* Editor */}
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
              Cargando contenido...
            </div>
          ) : (
            <>
              {assets.length > 0 && (
                <section className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><ImageIcon className="h-5 w-5 text-blue-600" /> Imágenes y enlaces</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {assets.map((a) => (
                      <div key={a.key} className="border border-gray-200 rounded-lg p-3">
                        <p className="text-sm font-semibold text-gray-800 mb-2">{a.label}</p>
                        {['es', 'en'].map((lang) => {
                          const key = `img.${a.key}`;
                          const value = valueOf(key, lang, '');
                          const shown = value || a[lang];
                          const busy = uploadingKey === `${key}:${lang}`;
                          return (
                            <div key={lang} className="flex items-center gap-3 py-2 border-t border-gray-100 first:border-t-0">
                              <LangBadge lang={lang} />
                              {a.type === 'image' ? (
                                <a href={shown} target="_blank" rel="noopener noreferrer" className="w-16 h-12 rounded border bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
                                  {/\.pdf($|\?)/i.test(shown) ? <FileText className="h-5 w-5 text-gray-400" /> : <img src={shown} alt="" className="max-w-full max-h-full object-contain" />}
                                </a>
                              ) : (
                                <LinkIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                {a.type === 'link' ? (
                                  <input
                                    value={value}
                                    placeholder={a[lang]}
                                    onChange={(e) => setValue(key, lang, e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                  />
                                ) : (
                                  <p className="text-[11px] text-gray-500 truncate" title={shown}>{isOverridden(key, lang) ? 'Personalizada' : 'Por defecto'} · {shown.split('/').pop()}</p>
                                )}
                                <div className="flex gap-2 mt-1">
                                  <button onClick={() => askUpload(key, lang)} disabled={busy} className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 disabled:opacity-50">
                                    <Upload className="h-3 w-3" /> {busy ? 'Subiendo...' : (a.type === 'link' ? 'Subir archivo' : 'Cambiar')}
                                  </button>
                                  {isOverridden(key, lang) && (
                                    <button onClick={() => setValue(key, lang, '')} className="text-xs text-gray-500 hover:underline inline-flex items-center gap-1">
                                      <RotateCcw className="h-3 w-3" /> Restablecer
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-1"><FileText className="h-5 w-5 text-blue-600" /> Textos</h3>
                <p className="text-xs text-gray-500 mb-4">Edita en español e inglés. Conserva los textos entre llaves como <code>{'{email}'}</code>: el sitio los reemplaza por datos reales. Vacía un campo para volver al texto original.</p>
                {textKeys.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay textos que coincidan.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {textKeys.map((key) => (
                      <div key={key} className="py-4 grid md:grid-cols-[200px_1fr_1fr] gap-3 items-start">
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-gray-500 break-all">{key}</p>
                          {(isOverridden(key, 'es') || isOverridden(key, 'en')) && (
                            <button onClick={() => { setValue(key, 'es', ''); setValue(key, 'en', ''); }} className="text-[11px] text-gray-500 hover:underline inline-flex items-center gap-1 mt-1">
                              <RotateCcw className="h-3 w-3" /> Restablecer
                            </button>
                          )}
                        </div>
                        {['es', 'en'].map((lang) => {
                          const def = TEXT_DEFAULTS[key][lang];
                          const value = valueOf(key, lang, '');
                          const long = def.length > 70;
                          const cls = `w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isOverridden(key, lang) ? 'border-orange-300 bg-orange-50/40' : 'border-gray-200'}`;
                          return (
                            <div key={lang} className="flex gap-2 items-start">
                              <LangBadge lang={lang} />
                              {long ? (
                                <textarea value={value} placeholder={def} onChange={(e) => setValue(key, lang, e.target.value)} rows={Math.min(8, Math.max(2, Math.ceil(def.length / 60)))} className={`${cls} resize-y`} />
                              ) : (
                                <input value={value} placeholder={def} onChange={(e) => setValue(key, lang, e.target.value)} className={cls} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default SiteContentAdmin;
