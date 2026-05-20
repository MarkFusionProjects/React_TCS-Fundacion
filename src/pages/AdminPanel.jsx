import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Search, Download, RefreshCw, Calendar, Mail, Phone, User, DollarSign, CreditCard, Hash, AlertCircle, MapPin, IdCard, Target, Repeat, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getRecurringCharges } from '../services/paymentSourceService';

const AdminPanel = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // === Tabs ===
  const [activeTab, setActiveTab] = useState('donations'); // 'donations' | 'recurring'

  // === Cobros recurrentes ===
  const [charges, setCharges] = useState([]);
  const [chargesLoading, setChargesLoading] = useState(false);
  const [chargesError, setChargesError] = useState(null);
  const [chargeStatus, setChargeStatus] = useState(''); // '', 'approved', 'declined', 'pending', 'voided', 'error'
  const [chargeEmail, setChargeEmail] = useState('');
  const [selectedCharge, setSelectedCharge] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (activeTab === 'recurring') {
      fetchCharges();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCharges = async () => {
    setChargesLoading(true);
    setChargesError(null);
    try {
      const result = await getRecurringCharges({
        status: chargeStatus || undefined,
        customer_email: chargeEmail || undefined
      });
      const list = Array.isArray(result?.data) ? result.data : [];
      setCharges(list);
    } catch (err) {
      console.error('❌ Error al obtener cobros recurrentes:', err);
      setChargesError(err?.message || 'No se pudieron cargar los cobros recurrentes');
      setCharges([]);
    } finally {
      setChargesLoading(false);
    }
  };

  const exportChargesToCSV = () => {
    if (charges.length === 0) return;
    const rows = charges.map((c) => ({
      reference: c.reference || '',
      amount: c.amount || 0,
      status: c.status || '',
      createdAt: c.createdAt || '',
      customer_email: c.paymentSource?.customer_email || '',
      name: c.paymentSource?.name || '',
      last_name: c.paymentSource?.last_name || '',
      type: c.paymentSource?.type || '',
      donation_destination: c.paymentSource?.donation_destination || '',
      billing_frequency: c.paymentSource?.billing_frequency || ''
    }));
    const headers = Object.keys(rows[0]).join(',');
    const body = rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${body}`], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cobros_recurrentes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const totalChargesAmount = charges.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
  const approvedCount = charges.filter((c) => c.status === 'approved').length;
  const declinedCount = charges.filter((c) => c.status === 'declined').length;

  const statusBadge = (status) => {
    const map = {
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Aprobado' },
      declined: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rechazado' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendiente' },
      voided: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Anulado' },
      error: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Error' }
    };
    const cfg = map[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: status || 'N/A' };
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
        <Icon className="h-3 w-3" />
        {cfg.label}
      </span>
    );
  };

  const frequencyLabel = (freq) => {
    const map = { weekly: 'Semanal', biweekly: 'Quincenal', monthly: 'Mensual' };
    return map[freq] || freq || 'N/A';
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Conectando al backend...');
      
      // 🔄 CAMBIA ESTA URL por la de tu backend
      const response = await axios.get('https://5qz4wrdx-3000.use2.devtunnels.ms/api/v1/wompitransaction/', {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('✅ Respuesta del backend:', response.data);
      
      // Transformar los datos del backend al formato del frontend
      if (response.data.success && Array.isArray(response.data.data)) {
        const transformedData = response.data.data.map((item, index) => ({
          id: index + 1,
          referencia: item.reference,
          total: item.value,
          metodoPago: item.payment_method_type,
          // DATOS DEL DONANTE
          nombre: item.donation?.name || 'N/A',
          apellido: item.donation?.last_name || 'N/A',
          documento: item.donation?.identity_document || 'N/A',
          telefono: item.donation?.phone || 'N/A',
          correo: item.donation?.email || 'N/A',
          direccion: item.donation?.address || 'N/A',
          // DESTINO DE LA DONACIÓN
          donacion_destino: Array.isArray(item.donation?.donation_destination) 
            ? item.donation.donation_destination.join(', ')
            : item.donation?.donation_destination || 'N/A',
          // FECHA
          fecha: item.date
        }));
        
        console.log('✅ Datos transformados:', transformedData);
        setSubmissions(transformedData);
      } else {
        console.error('❌ Formato incorrecto:', response.data);
        throw new Error('Formato de datos incorrecto');
      }
    } catch (error) {
      console.error('❌ Error detallado:', error);
      
      let errorMessage = '';
      
      if (error.message?.includes('ERR_BLOCKED_BY_CLIENT') || error.message?.includes('blocked')) {
        errorMessage = '🚫 Petición bloqueada por extensión del navegador (AdBlock, uBlock, etc.). Por favor desactívalas o prueba en modo incógnito.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = '⏱️ Timeout - El servidor no respondió a tiempo. Verifica que el backend esté corriendo.';
      } else if (error.response) {
        errorMessage = `❌ Error del servidor: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`;
      } else if (error.request) {
        errorMessage = '🌐 No se pudo conectar con el servidor. Verifica que el backend esté corriendo en la URL correcta.';
      } else {
        errorMessage = `❌ Error: ${error.message}`;
      }
      
      setError(errorMessage);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = Array.isArray(submissions) 
    ? submissions.filter(sub =>
        Object.values(sub).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : [];

  // Calcular total de donaciones
  const totalDonaciones = submissions.reduce((acc, sub) => acc + (Number(sub.total) || 0), 0);

  const exportToCSV = () => {
    if (submissions.length === 0) return;

    const headers = Object.keys(submissions[0]).join(',');
    const rows = submissions.map(sub => 
      Object.values(sub).map(val => `"${val}"`).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donaciones_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPaymentMethod = (method) => {
    const methods = {
      'BANCOLOMBIA_TRANSFER': 'Transferencia Bancolombia',
      'CARD': 'Tarjeta',
      'PSE': 'PSE',
      'NEQUI': 'Nequi',
      'DAVIPLATA': 'Daviplata'
    };
    return methods[method] || method;
  };

  if (loading && activeTab === 'donations') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando donaciones...</p>
          <p className="mt-2 text-gray-500 text-sm">Conectando con el servidor...</p>
        </div>
      </div>
    );
  }

  if (error && activeTab === 'donations') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl bg-white rounded-xl shadow-lg p-8">
          <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error al cargar donaciones</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-left whitespace-pre-wrap">{error}</p>
          </div>
          
          <div className="space-y-3 mb-6 text-left">
            <p className="text-gray-700 font-semibold">Posibles soluciones:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Verifica que el backend esté corriendo</li>
              <li>Desactiva extensiones de bloqueo (AdBlock, uBlock)</li>
              <li>Prueba en modo incógnito sin extensiones</li>
              <li>Verifica la URL del backend en AdminPanel.jsx línea 22</li>
              <li>Asegúrate de que CORS esté configurado en el backend</li>
            </ul>
          </div>

          <button
            onClick={fetchSubmissions}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Panel de Administración
                </h1>
                <p className="text-sm text-gray-600">Gestión de Donaciones - Fundación TCS</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchSubmissions}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Actualizar</span>
              </button>
              <button
                onClick={exportToCSV}
                disabled={submissions.length === 0}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-5 w-5" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('donations')}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'donations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Donaciones
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'recurring'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Repeat className="h-4 w-4" />
            Pagos Recurrentes
          </button>
        </div>
      </div>

      {/* Contenido */}
      {activeTab === 'donations' && (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Donaciones</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{submissions.length}</p>
              </div>
              <FileText className="h-12 w-12 text-blue-600 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Monto Total</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {formatCurrency(totalDonaciones)}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-600 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Esta Semana</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {submissions.filter(s => {
                    if (!s.fecha) return false;
                    const date = new Date(s.fecha);
                    const today = new Date();
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return date >= weekAgo;
                  }).length}
                </p>
              </div>
              <Calendar className="h-12 w-12 text-purple-600 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Resultados</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{filteredSubmissions.length}</p>
              </div>
              <Search className="h-12 w-12 text-orange-600 opacity-80" />
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento, referencia, correo, teléfono, dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Tabla de datos */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Referencia
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Donante
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Destino
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission, index) => (
                  <tr key={submission.id || index} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-mono text-gray-900">
                          {submission.referencia || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {submission.fecha 
                            ? new Date(submission.fecha).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {`${submission.nombre || ''} ${submission.apellido || ''}`.trim() || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <IdCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {submission.documento || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {submission.correo || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {submission.telefono || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-gray-900 max-w-xs truncate">
                          {submission.donacion_destino || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(submission.total || 0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatPaymentMethod(submission.metodoPago)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubmissions.length === 0 && submissions.length > 0 && (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No se encontraron resultados</p>
              <p className="text-gray-400 text-sm mt-2">Intenta con otros términos de búsqueda</p>
            </div>
          )}

          {submissions.length === 0 && (
            <div className="text-center py-16">
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No hay donaciones registradas aún</p>
              <p className="text-gray-400 text-sm mt-2">Las donaciones aparecerán aquí automáticamente</p>
            </div>
          )}
        </div>
      </main>
      )}

      {/* === TAB: PAGOS RECURRENTES === */}
      {activeTab === 'recurring' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Cobros</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{charges.length}</p>
                </div>
                <Repeat className="h-12 w-12 text-blue-600 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Monto Total</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {formatCurrency(totalChargesAmount)}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-green-600 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Aprobados</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{approvedCount}</p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-emerald-600 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Rechazados</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{declinedCount}</p>
                </div>
                <XCircle className="h-12 w-12 text-red-600 opacity-80" />
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Filtrar por email del cliente..."
                  value={chargeEmail}
                  onChange={(e) => setChargeEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <select
                value={chargeStatus}
                onChange={(e) => setChargeStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Todos los estados</option>
                <option value="approved">Aprobados</option>
                <option value="declined">Rechazados</option>
                <option value="pending">Pendientes</option>
                <option value="voided">Anulados</option>
                <option value="error">Error</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={fetchCharges}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  <Search className="h-5 w-5" />
                  <span>Filtrar</span>
                </button>
                <button
                  onClick={exportChargesToCSV}
                  disabled={charges.length === 0}
                  className="flex items-center justify-center bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Exportar CSV"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Estados */}
          {chargesLoading && (
            <div className="bg-white rounded-xl shadow-md p-16 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando cobros recurrentes...</p>
            </div>
          )}

          {chargesError && !chargesLoading && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
              <p className="text-red-800 font-semibold mb-2">Error</p>
              <p className="text-gray-600 mb-4">{chargesError}</p>
              <button
                onClick={fetchCharges}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Tabla de cobros */}
          {!chargesLoading && !chargesError && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Referencia</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Destino</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Frecuencia</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Monto</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {charges.map((c) => (
                      <tr key={c.id} className="hover:bg-blue-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Hash className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-mono text-gray-900">{c.reference || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {c.createdAt
                                ? new Date(c.createdAt).toLocaleDateString('es-ES', {
                                    day: '2-digit', month: '2-digit', year: 'numeric'
                                  })
                                : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {`${c.paymentSource?.name || ''} ${c.paymentSource?.last_name || ''}`.trim() || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500">{c.paymentSource?.customer_email || ''}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 max-w-xs truncate block">
                            {c.paymentSource?.donation_destination || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {frequencyLabel(c.paymentSource?.billing_frequency)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(c.amount || 0)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{statusBadge(c.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedCharge(c)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {charges.length === 0 && (
                <div className="text-center py-16">
                  <Repeat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No hay cobros recurrentes</p>
                  <p className="text-gray-400 text-sm mt-2">Ajusta los filtros o espera a que se generen.</p>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* Modal de detalles del cobro recurrente */}
      {selectedCharge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedCharge(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-blue-600 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Detalle del Cobro Recurrente</h3>
                  <p className="text-blue-100 text-sm mt-1">{selectedCharge.reference}</p>
                </div>
                <button
                  onClick={() => setSelectedCharge(null)}
                  className="text-white hover:bg-blue-700 rounded-lg p-2 transition"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-green-50 rounded-lg p-5">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center text-lg">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Información del Cobro
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Referencia</p>
                    <p className="text-gray-900 font-mono font-medium mt-1">{selectedCharge.reference}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Estado</p>
                    <div className="mt-1">{statusBadge(selectedCharge.status)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Fecha</p>
                    <p className="text-gray-900 mt-1">
                      {selectedCharge.createdAt
                        ? new Date(selectedCharge.createdAt).toLocaleString('es-ES')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Monto</p>
                    <p className="text-green-600 font-bold text-2xl mt-1">
                      {formatCurrency(selectedCharge.amount || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-5">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center text-lg">
                  <User className="h-5 w-5 mr-2" />
                  Fuente de Pago
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Cliente</p>
                    <p className="text-gray-900 font-medium mt-1">
                      {`${selectedCharge.paymentSource?.name || ''} ${selectedCharge.paymentSource?.last_name || ''}`.trim() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Correo
                    </p>
                    <p className="text-gray-900 mt-1">{selectedCharge.paymentSource?.customer_email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                      <CreditCard className="h-3 w-3" /> Método
                    </p>
                    <p className="text-gray-900 mt-1">{formatPaymentMethod(selectedCharge.paymentSource?.type)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Frecuencia</p>
                    <p className="text-gray-900 mt-1">
                      {frequencyLabel(selectedCharge.paymentSource?.billing_frequency)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                      <Target className="h-3 w-3" /> Destino
                    </p>
                    <p className="text-gray-900 mt-1">{selectedCharge.paymentSource?.donation_destination || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-xl">
              <button
                onClick={() => setSelectedCharge(null)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles COMPLETO */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedSubmission(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-blue-600 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Detalles Completos de la Donación</h3>
                  <p className="text-blue-100 text-sm mt-1">{selectedSubmission.referencia}</p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-white hover:bg-blue-700 rounded-lg p-2 transition"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información del donante */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center text-lg">
                  <User className="h-5 w-5 mr-2" />
                  Información del Donante
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Nombre</p>
                    <p className="text-gray-900 font-medium mt-1">{selectedSubmission.nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Apellido</p>
                    <p className="text-gray-900 font-medium mt-1">{selectedSubmission.apellido}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                      <IdCard className="h-3 w-3" /> Número de Documento
                    </p>
                    <p className="text-gray-900 mt-1">{selectedSubmission.documento}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Teléfono
                    </p>
                    <p className="text-gray-900 mt-1">{selectedSubmission.telefono}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Correo
                    </p>
                    <p className="text-gray-900 mt-1">{selectedSubmission.correo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Dirección
                    </p>
                    <p className="text-gray-900 mt-1">{selectedSubmission.direccion}</p>
                  </div>
                </div>
              </div>

              {/* Información de la donación */}
              <div className="bg-purple-50 rounded-lg p-5">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center text-lg">
                  <Target className="h-5 w-5 mr-2 text-purple-600" />
                  Destino de la Donación
                </h4>
                <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                  <p className="text-gray-900 font-medium">{selectedSubmission.donacion_destino}</p>
                </div>
              </div>

              {/* Información de la transacción */}
              <div className="bg-green-50 rounded-lg p-5">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center text-lg">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Información de la Transacción
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Referencia</p>
                    <p className="text-gray-900 font-mono font-medium mt-1">{selectedSubmission.referencia}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Fecha</p>
                    <p className="text-gray-900 mt-1">
                      {selectedSubmission.fecha 
                        ? new Date(selectedSubmission.fecha).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Monto Total</p>
                    <p className="text-green-600 font-bold text-3xl mt-1">{formatCurrency(selectedSubmission.total)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Método de Pago</p>
                    <div className="flex items-center gap-2 mt-1">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <p className="text-gray-900 font-medium">{formatPaymentMethod(selectedSubmission.metodoPago)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-xl">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;