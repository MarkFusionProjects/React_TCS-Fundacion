import { useEffect, useMemo, useState } from 'react';
import { Store, Search, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle, Mail, Phone, Instagram, Globe, User, Calendar, Image as ImageIcon, MapPin, Truck, BadgePercent } from 'lucide-react';
import { getEmprendimientos, aprobarEmprendimiento, rechazarEmprendimiento, ESTADOS } from '../../services/emprendimientoService';
import { clearEmprendimientosCache } from '../../hooks/useEmprendimientos';
import { CATEGORIAS } from '../../data/emprendimientos';

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

const catLabel = (item, id) => (id === 'otro' && item.categoriaOtro ? `Otro: ${item.categoriaOtro}` : CATEGORIA_LABEL[id] || id);

const estadoBadge = (estado) => {
  const map = {
    [ESTADOS.APROBADO]: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Aprobado' },
    [ESTADOS.RECHAZADO]: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rechazado' },
    [ESTADOS.PENDIENTE]: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendiente' },
  };
  const cfg = map[estado] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: estado || 'N/A' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
};

const formatDate = (d) => {
  if (!d) return 'N/A';
  const date = new Date(d);
  return isNaN(date) ? d : date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/**
 * Pestaña "Emprendimientos" del panel administrativo.
 * Lista los registros del directorio comercial y permite aprobarlos o rechazarlos.
 * El backend se encarga de enviar los correos (alerta al admin al registrarse,
 * y al padre de familia al aprobar/rechazar).
 */
const EmprendimientosAdmin = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estado, setEstado] = useState(ESTADOS.PENDIENTE);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [toast, setToast] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getEmprendimientos();
      setItems(list);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los emprendimientos');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const counts = useMemo(() => ({
    total: items.length,
    pendientes: items.filter((i) => i.estado === ESTADOS.PENDIENTE).length,
    aprobados: items.filter((i) => i.estado === ESTADOS.APROBADO).length,
    rechazados: items.filter((i) => i.estado === ESTADOS.RECHAZADO).length,
  }), [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => !estado || i.estado === estado)
      .filter((i) => !q || [i.nombre, i.dueno, i.email, i.whatsapp, ...(i.categorias || []).map((c) => catLabel(i, c))].join(' ').toLowerCase().includes(q));
  }, [items, estado, search]);

  const closeModal = () => {
    setSelected(null);
    setRejecting(false);
    setMotivo('');
    setActionError(null);
  };

  const applyLocal = (id, patch) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
    clearEmprendimientosCache();
  };

  const handleAprobar = async (item) => {
    setActing(true);
    setActionError(null);
    try {
      await aprobarEmprendimiento(item.id);
      applyLocal(item.id, { estado: ESTADOS.APROBADO, motivoRechazo: undefined });
      setToast({ type: 'ok', text: `"${item.nombre}" aprobado. Se notificó por correo a ${item.email}.` });
      closeModal();
    } catch (err) {
      setActionError(err?.response?.data?.message || err?.message || 'No se pudo aprobar. Intenta de nuevo.');
    } finally {
      setActing(false);
    }
  };

  const handleRechazar = async (item) => {
    if (!motivo.trim()) {
      setActionError('Escribe el motivo del rechazo (se enviará al padre de familia).');
      return;
    }
    setActing(true);
    setActionError(null);
    try {
      await rechazarEmprendimiento(item.id, motivo.trim());
      applyLocal(item.id, { estado: ESTADOS.RECHAZADO, motivoRechazo: motivo.trim() });
      setToast({ type: 'ok', text: `"${item.nombre}" rechazado. Se notificó por correo a ${item.email}.` });
      closeModal();
    } catch (err) {
      setActionError(err?.response?.data?.message || err?.message || 'No se pudo rechazar. Intenta de nuevo.');
    } finally {
      setActing(false);
    }
  };

  const catColor = (id) => CATEGORIAS.find((c) => c.id === id)?.color || '#004990';
  const firstCat = (item) => item.categorias?.[0];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5" />
          {toast.text}
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Registros</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{counts.total}</p>
            </div>
            <Store className="h-12 w-12 text-blue-600 opacity-80" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Por aprobar</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{counts.pendientes}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500 opacity-80" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Aprobados</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{counts.aprobados}</p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-emerald-600 opacity-80" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Rechazados</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{counts.rechazados}</p>
            </div>
            <XCircle className="h-12 w-12 text-red-600 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por emprendimiento, padre, correo, WhatsApp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="">Todos los estados</option>
            <option value={ESTADOS.PENDIENTE}>Pendientes</option>
            <option value={ESTADOS.APROBADO}>Aprobados</option>
            <option value={ESTADOS.RECHAZADO}>Rechazados</option>
          </select>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
            Cargando emprendimientos...
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold mb-1">No se pudieron cargar los emprendimientos</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <p className="text-xs text-gray-400">Verifica que el backend exponga GET /api/v1/emprendimientos</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Store className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            No hay emprendimientos {estado ? `con estado "${estado}"` : ''}{search ? ' que coincidan con la búsqueda' : ''}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Emprendimiento', 'Padre / Madre', 'Categoría', 'Contacto', 'Fecha', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.imagenes?.[0] ? (
                          <img src={item.imagenes[0]} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${catColor(firstCat(item))}22` }}>
                            <Store className="h-5 w-5" style={{ color: catColor(firstCat(item)) }} />
                          </div>
                        )}
                        <span className="font-semibold text-gray-900">{item.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.dueno}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {(item.categorias || []).map((c) => (
                          <span key={c} className="text-xs font-semibold text-white px-2 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: catColor(c) }}>
                            {catLabel(item, c)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{item.email}</div>
                      <div className="text-xs text-gray-400">{item.whatsapp ? `+${item.whatsapp}` : ''}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-4">{estadoBadge(item.estado)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(item)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm whitespace-nowrap"
                        >
                          Ver detalle
                        </button>
                        {item.estado !== ESTADOS.APROBADO && (
                          <button
                            onClick={() => handleAprobar(item)}
                            disabled={acting}
                            className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Aprobar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{selected.nombre}</h2>
                <p className="text-blue-100 text-sm mt-1">{(selected.categorias || []).map((c) => catLabel(selected, c)).join(' · ')}</p>
              </div>
              {estadoBadge(selected.estado)}
            </div>

            <div className="p-6 space-y-6">
              {/* Fotos */}
              {selected.imagenes?.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {selected.imagenes.map((src, i) => (
                    <a key={src + i} href={src} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden shadow bg-white relative">
                      <img src={src} alt={`${selected.nombre} ${i + 1}`} className={`w-full h-full ${i === 0 ? 'object-contain' : 'object-cover'} hover:scale-105 transition-transform`} />
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Logo</span>}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-400"><ImageIcon className="h-4 w-4" /> Sin fotos</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Representante de marca</p>
                    <p className="text-gray-900 font-medium">{selected.dueno}</p>
                    {selected.relacionTcs?.length > 0 && (
                      <p className="text-xs text-gray-500">{selected.relacionTcs.map((r) => RELACION_LABEL[r] || r).join(', ')}</p>
                    )}
                    {selected.telefonoPersonal && (
                      <p className="text-xs text-gray-500">Tel. personal: +{selected.telefonoPersonal}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Fecha de registro</p>
                    <p className="text-gray-900 font-medium">{formatDate(selected.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Correo de la marca</p>
                    <a href={`mailto:${selected.email}`} className="text-blue-600 font-medium break-all">{selected.email}</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Contacto de la marca</p>
                    {selected.whatsapp ? (
                      <a href={`https://wa.me/${selected.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium">+{selected.whatsapp}</a>
                    ) : <p className="text-gray-400">N/A</p>}
                  </div>
                </div>
                {selected.redSocial && (
                  <div className="flex items-start gap-3">
                    <Instagram className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Red social principal</p>
                      <a href={`https://instagram.com/${selected.redSocial}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium">@{selected.redSocial}</a>
                    </div>
                  </div>
                )}
                {selected.puntoFisico && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Punto físico</p>
                      <p className="text-gray-900 font-medium">{selected.puntoFisico}</p>
                    </div>
                  </div>
                )}
                {selected.envios && (
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Envíos</p>
                      <p className="text-gray-900 font-medium">{selected.envios}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <BadgePercent className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Beneficio comunidad TCS</p>
                    <p className="text-gray-900 font-medium">{selected.beneficioTcs ? (selected.beneficioDescripcion || 'Sí') : 'No'}</p>
                  </div>
                </div>
                {selected.web && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Sitio web</p>
                      <a href={selected.web} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium break-all">{selected.web}</a>
                    </div>
                  </div>
                )}
              </div>

              {selected.historia && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Historia de la marca</p>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">{selected.historia}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Productos o servicios</p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">{selected.descripcion}</p>
              </div>

              {selected.estado === ESTADOS.RECHAZADO && selected.motivoRechazo && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-xs text-red-600 uppercase font-semibold mb-1">Motivo del rechazo</p>
                  <p className="text-red-800 text-sm">{selected.motivoRechazo}</p>
                </div>
              )}

              {/* Rechazo: motivo */}
              {rejecting && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Motivo del rechazo (se enviará por correo al padre de familia)
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows="3"
                    placeholder="Ej: La descripción no incluye información suficiente sobre los productos..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  />
                </div>
              )}

              {actionError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-xl flex flex-wrap gap-3 justify-end">
              <button onClick={closeModal} disabled={acting} className="px-5 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-200 transition disabled:opacity-50">
                Cerrar
              </button>
              {selected.estado !== ESTADOS.RECHAZADO && !rejecting && (
                <button
                  onClick={() => { setRejecting(true); setActionError(null); }}
                  disabled={acting}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" /> Rechazar
                </button>
              )}
              {rejecting && (
                <button
                  onClick={() => handleRechazar(selected)}
                  disabled={acting}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" /> {acting ? 'Enviando...' : 'Confirmar rechazo'}
                </button>
              )}
              {selected.estado !== ESTADOS.APROBADO && !rejecting && (
                <button
                  onClick={() => handleAprobar(selected)}
                  disabled={acting}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="h-5 w-5" /> {acting ? 'Enviando...' : 'Aprobar y publicar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default EmprendimientosAdmin;
