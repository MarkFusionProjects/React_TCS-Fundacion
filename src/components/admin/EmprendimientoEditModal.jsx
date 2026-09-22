import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, ImagePlus, Save, Trash2, X } from 'lucide-react';
import { updateEmprendimiento } from '../../services/emprendimientoService';
import { CATEGORIAS, RELACIONES_TCS, REDES_SOCIALES, CONDICIONES_BENEFICIO } from '../../data/emprendimientos';

const CATEGORIA_LABEL = {
  moda: 'Moda y accesorios',
  belleza: 'Belleza y bienestar',
  hogar: 'Hogar y decoración',
  gastronomia: 'Gastronomía',
  arte: 'Arte y diseño',
  tecnologia: 'Tecnología',
  educacion: 'Educación',
  salud: 'Salud',
  mascotas: 'Mascotas',
  servicios: 'Servicios profesionales',
  deportes: 'Deportes',
  infantil: 'Infantil',
  sostenibilidad: 'Sostenibilidad y manejo ambiental',
  eventos: 'Producción de eventos',
  otro: 'Otro',
};
const RELACION_LABEL = { padre: 'Papá/mamá', egresado: 'Egresado', estudiante: 'Estudiante', staff: 'Staff' };

const MAX_PHOTOS = 3;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const inputCls = 'w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm';

const phoneOk = (v) => { const d = String(v).replace(/\D/g, ''); return d.length >= 7 && d.length <= 15; };

// Estado del formulario a partir del item normalizado (ver normalizeEmprendimiento)
const fromItem = (item) => ({
  nombre_emprendimiento: item.nombre || '',
  nombre_representante: item.dueno || '',
  cedula: item.cedula || '',
  codigo_familia: item.codigoFamilia || '',
  telefono_personal: item.telefonoPersonal || '',
  telefono_marca: item.whatsapp || '',
  email: item.email || '',
  relacion_tcs: item.relacionTcs || [],
  categorias: item.categorias || [],
  categoria_otro: item.categoriaOtro || '',
  historia: item.historia || '',
  descripcion: item.descripcion || '',
  red_social: item.redSocial || '',
  red_social_tipo: item.redSocialTipo || 'instagram',
  web: item.web || '',
  punto_fisico: item.puntoFisico || '',
  horario: item.horario || '',
  envios: item.envios || '',
  beneficio_tcs: item.beneficioTcs ? 'si' : 'no',
  beneficio_descripcion: item.beneficioDescripcion || '',
  beneficio_como: item.beneficioComo || '',
  beneficio_condiciones: item.beneficioCondiciones || [],
  beneficio_condiciones_detalle: item.beneficioCondicionesDetalle || '',
});

const Field = ({ label, error, children, optional }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
      {label} {optional ? <span className="normal-case font-normal text-gray-400">(opcional)</span> : <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
  </div>
);

/**
 * Modal de edición de un emprendimiento (panel admin).
 * @param {object} item - emprendimiento normalizado
 * @param {Function} onClose
 * @param {Function} onSaved - (itemActualizado) => void
 */
const EmprendimientoEditModal = ({ item, onClose, onSaved }) => {
  const [form, setForm] = useState(() => fromItem(item));
  const [logoFile, setLogoFile] = useState(null);
  const [fotosExistentes, setFotosExistentes] = useState(() => (item.imagenes || []).slice(1));
  const [fotosNuevas, setFotosNuevas] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);
  const logoRef = useRef(null);
  const fotosRef = useRef(null);

  const logoActual = item.imagenes?.[0];
  const logoPreview = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : logoActual), [logoFile, logoActual]);
  const nuevasPreviews = useMemo(() => fotosNuevas.map((f) => URL.createObjectURL(f)), [fotosNuevas]);
  useEffect(() => () => { if (logoFile && logoPreview) URL.revokeObjectURL(logoPreview); }, [logoFile, logoPreview]);
  useEffect(() => () => nuevasPreviews.forEach((u) => URL.revokeObjectURL(u)), [nuevasPreviews]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !saving && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [saving, onClose]);

  const set = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  const handleChange = (e) => set(e.target.name, e.target.value);
  const toggle = (name, value) => set(name, form[name].includes(value) ? form[name].filter((v) => v !== value) : [...form[name], value]);

  const totalFotos = fotosExistentes.length + fotosNuevas.length;

  const addFotos = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => ALLOWED_TYPES.includes(f.type) && f.size <= 5 * 1024 * 1024);
    e.target.value = '';
    setFotosNuevas((prev) => [...prev, ...files].slice(0, MAX_PHOTOS - fotosExistentes.length));
  };

  const pickLogo = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) return setErrors((p) => ({ ...p, logo: 'Solo JPG, PNG, WEBP o SVG' }));
    if (f.size > 10 * 1024 * 1024) return setErrors((p) => ({ ...p, logo: 'Máximo 10 MB' }));
    setErrors((p) => ({ ...p, logo: undefined }));
    setLogoFile(f);
  };

  const validate = () => {
    const e = {};
    ['nombre_emprendimiento', 'nombre_representante', 'telefono_personal', 'telefono_marca', 'email', 'historia', 'descripcion', 'red_social', 'web']
      .forEach((k) => { if (!String(form[k]).trim()) e[k] = 'Obligatorio'; });
    if (form.relacion_tcs.length === 0) e.relacion_tcs = 'Selecciona al menos una';
    if (form.categorias.length === 0) e.categorias = 'Selecciona al menos una';
    if (form.categorias.includes('otro') && !form.categoria_otro.trim()) e.categoria_otro = 'Indica cuál';
    if (form.telefono_personal && !phoneOk(form.telefono_personal)) e.telefono_personal = 'Número inválido (7 a 15 dígitos)';
    if (form.telefono_marca && !phoneOk(form.telefono_marca)) e.telefono_marca = 'Número inválido (7 a 15 dígitos)';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido';
    if (form.web && !/^https?:\/\/\S+\.\S+/.test(form.web.trim())) e.web = 'Debe iniciar con http:// o https://';
    if (!String(form.cedula).trim()) e.cedula = 'Obligatorio';
    if (form.beneficio_tcs === 'si') {
      if (!form.beneficio_descripcion.trim()) e.beneficio_descripcion = 'Describe el beneficio';
      if (!form.beneficio_como.trim()) e.beneficio_como = 'Indica cómo se hace efectivo';
      if (form.beneficio_condiciones.length === 0) e.beneficio_condiciones = 'Selecciona al menos una';
    }
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    setServerError(null);
    try {
      const updated = await updateEmprendimiento(item.id, {
        ...form,
        telefono_personal: form.telefono_personal.replace(/\D/g, ''),
        telefono_marca: form.telefono_marca.replace(/\D/g, ''),
        red_social: form.red_social.replace(/^@/, '').trim(),
        web: form.web.trim(),
        categoria_otro: form.categorias.includes('otro') ? form.categoria_otro.trim() : '',
        cedula: String(form.cedula).replace(/\D/g, ''),
        beneficio_descripcion: form.beneficio_tcs === 'si' ? form.beneficio_descripcion.trim() : '',
        beneficio_como: form.beneficio_tcs === 'si' ? form.beneficio_como.trim() : '',
        beneficio_condiciones: form.beneficio_tcs === 'si' ? form.beneficio_condiciones : [],
        beneficio_condiciones_detalle: form.beneficio_tcs === 'si' ? form.beneficio_condiciones_detalle.trim() : '',
      }, { logo: logoFile, fotos: fotosNuevas, fotosExistentes });
      onSaved(updated);
    } catch (err) {
      setServerError(err?.response?.data?.message || err?.message || 'No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => !saving && onClose()}>
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Editar emprendimiento">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-t-xl flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">Editar emprendimiento</h2>
            <p className="text-blue-100 text-sm">{item.nombre}</p>
          </div>
          <button onClick={onClose} disabled={saving} className="p-2 rounded-full hover:bg-white/10 transition disabled:opacity-40" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Emprendimiento */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nombre del emprendimiento" error={errors.nombre_emprendimiento}>
              <input name="nombre_emprendimiento" value={form.nombre_emprendimiento} onChange={handleChange} className={inputCls} maxLength={80} />
            </Field>
            <Field label="Representante de marca" error={errors.nombre_representante}>
              <input name="nombre_representante" value={form.nombre_representante} onChange={handleChange} className={inputCls} maxLength={100} />
            </Field>
            <Field label="Cédula" error={errors.cedula}>
              <input name="cedula" value={form.cedula} onChange={handleChange} className={inputCls} maxLength={20} />
            </Field>
            <Field label="Código de familia" optional>
              <input name="codigo_familia" value={form.codigo_familia} onChange={handleChange} className={inputCls} maxLength={30} />
            </Field>
            <Field label="Teléfono personal" error={errors.telefono_personal}>
              <input name="telefono_personal" value={form.telefono_personal} onChange={handleChange} className={inputCls} />
            </Field>
            <Field label="Teléfono de la marca" error={errors.telefono_marca}>
              <input name="telefono_marca" value={form.telefono_marca} onChange={handleChange} className={inputCls} />
            </Field>
            <Field label="Correo de la marca" error={errors.email}>
              <input type="email" name="email" value={form.email} onChange={handleChange} className={inputCls} />
            </Field>
            <Field label="Relación con TCS" error={errors.relacion_tcs}>
              <div className="flex flex-wrap gap-2 pt-1">
                {RELACIONES_TCS.map((r) => {
                  const on = form.relacion_tcs.includes(r);
                  return (
                    <button key={r} type="button" onClick={() => toggle('relacion_tcs', r)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${on ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                      {RELACION_LABEL[r]}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          {/* Categorías */}
          <Field label="Categorías" error={errors.categorias || errors.categoria_otro}>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {CATEGORIAS.map((c) => {
                const on = form.categorias.includes(c.id);
                return (
                  <label key={c.id} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer text-xs transition ${on ? 'bg-blue-50 border-blue-400' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={on} onChange={() => toggle('categorias', c.id)} className="h-3.5 w-3.5" />
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    {CATEGORIA_LABEL[c.id]}
                  </label>
                );
              })}
            </div>
            {form.categorias.includes('otro') && (
              <input name="categoria_otro" value={form.categoria_otro} onChange={handleChange} placeholder="¿Cuál?" className={`${inputCls} mt-2`} maxLength={60} />
            )}
          </Field>

          {/* Textos */}
          <Field label="Historia de la marca" error={errors.historia}>
            <textarea name="historia" value={form.historia} onChange={handleChange} rows="3" maxLength={1000} className={`${inputCls} resize-none`} />
          </Field>
          <Field label="Productos o servicios" error={errors.descripcion}>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows="4" maxLength={1500} className={`${inputCls} resize-none`} />
          </Field>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Red social">
              <select name="red_social_tipo" value={form.red_social_tipo} onChange={handleChange} className={inputCls}>
                {REDES_SOCIALES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </Field>
            <Field label="Usuario de la red (sin @)" error={errors.red_social}>
              <input name="red_social" value={form.red_social} onChange={handleChange} className={inputCls} maxLength={60} />
            </Field>
            <Field label="Web / portafolio" error={errors.web}>
              <input name="web" value={form.web} onChange={handleChange} className={inputCls} placeholder="https://" />
            </Field>
            <Field label="Punto físico" optional>
              <input name="punto_fisico" value={form.punto_fisico} onChange={handleChange} className={inputCls} maxLength={150} />
            </Field>
            <Field label="Horario de atención" optional>
              <input name="horario" value={form.horario} onChange={handleChange} className={inputCls} maxLength={150} />
            </Field>
            <Field label="Envíos" optional>
              <input name="envios" value={form.envios} onChange={handleChange} className={inputCls} maxLength={150} />
            </Field>
            <Field label="Beneficio comunidad TCS">
              <select name="beneficio_tcs" value={form.beneficio_tcs} onChange={handleChange} className={inputCls}>
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
            </Field>
            {form.beneficio_tcs === 'si' && (
              <>
                <Field label="Descripción del beneficio" error={errors.beneficio_descripcion}>
                  <input name="beneficio_descripcion" value={form.beneficio_descripcion} onChange={handleChange} className={inputCls} maxLength={300} />
                </Field>
                <Field label="Cómo se hace efectivo" error={errors.beneficio_como}>
                  <input name="beneficio_como" value={form.beneficio_como} onChange={handleChange} className={inputCls} maxLength={300} />
                </Field>
                <Field label="Condiciones de la oferta" error={errors.beneficio_condiciones}>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {CONDICIONES_BENEFICIO.map((c) => {
                      const on = form.beneficio_condiciones.includes(c);
                      return (
                        <button key={c} type="button" onClick={() => toggle('beneficio_condiciones', c)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${on ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="Detalle de condiciones" optional>
                  <input name="beneficio_condiciones_detalle" value={form.beneficio_condiciones_detalle} onChange={handleChange} className={inputCls} maxLength={300} />
                </Field>
              </>
            )}
          </div>

          {/* Logo y fotos */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Logo" error={errors.logo}>
              <input ref={logoRef} type="file" accept={ALLOWED_TYPES.join(',')} onChange={pickLogo} className="hidden" />
              <div className="flex items-center gap-3 pt-1">
                <div className="w-20 h-20 rounded-lg border-2 border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                  {logoPreview ? <img src={logoPreview} alt="" className="w-full h-full object-contain" /> : <ImagePlus className="h-6 w-6 text-gray-300" />}
                </div>
                <div className="text-xs space-y-1">
                  <button type="button" onClick={() => logoRef.current?.click()} className="text-blue-600 font-semibold hover:underline">Reemplazar logo</button>
                  {logoFile && (
                    <p className="text-gray-500 flex items-center gap-1">
                      {logoFile.name}
                      <button type="button" onClick={() => setLogoFile(null)} className="text-red-500 hover:underline">deshacer</button>
                    </p>
                  )}
                </div>
              </div>
            </Field>
            <Field label={`Fotos (${totalFotos}/${MAX_PHOTOS})`} optional>
              <input ref={fotosRef} type="file" accept={ALLOWED_TYPES.join(',')} multiple onChange={addFotos} className="hidden" />
              <div className="flex flex-wrap gap-2 pt-1">
                {fotosExistentes.map((url) => (
                  <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFotosExistentes((p) => p.filter((u) => u !== url))} aria-label="Quitar foto"
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {nuevasPreviews.map((src, i) => (
                  <div key={src} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-green-300 group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFotosNuevas((p) => p.filter((_, idx) => idx !== i))} aria-label="Quitar foto nueva"
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {totalFotos < MAX_PHOTOS && (
                  <button type="button" onClick={() => fotosRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center text-gray-500 text-[10px] gap-1 transition">
                    <ImagePlus className="h-5 w-5" /> Agregar
                  </button>
                )}
              </div>
            </Field>
          </div>

          {serverError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-5 rounded-b-xl flex justify-end gap-3 flex-shrink-0 border-t">
          <button onClick={onClose} disabled={saving} className="px-5 py-2.5 rounded-lg font-semibold text-gray-700 hover:bg-gray-200 transition disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EmprendimientoEditModal;
