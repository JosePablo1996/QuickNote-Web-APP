import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  HelpCircle,
  Mail,
  MessageCircle,
  FileText,
  Star,
  BookOpen,
  Settings,
  Tag,
  Archive,
  Trash2,
  Calendar,
  Cloud,
  Search,
  ChevronDown,
  ChevronUp,
  Zap,
  X,
  Sparkles,
  Shield,
  Database,
  Layout,
  Users,
  Clock,
  Download,
  Share2,
  Filter,
  RefreshCw,
  HardDrive,
  Lock
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
  icon?: React.ReactNode;
}

const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { info, success } = useToast();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = [
    { name: 'Todos', icon: <BookOpen className="w-4 h-4" />, color: 'blue', count: 0 },
    { name: 'General', icon: <HelpCircle className="w-4 h-4" />, color: 'purple', count: 0 },
    { name: 'Notas', icon: <FileText className="w-4 h-4" />, color: 'green', count: 0 },
    { name: 'Etiquetas', icon: <Tag className="w-4 h-4" />, color: 'pink', count: 0 },
    { name: 'Organización', icon: <Archive className="w-4 h-4" />, color: 'teal', count: 0 },
    { name: 'Backups', icon: <Cloud className="w-4 h-4" />, color: 'indigo', count: 0 },
    { name: 'Seguridad', icon: <Shield className="w-4 h-4" />, color: 'red', count: 0 },
    { name: 'Exportación', icon: <Download className="w-4 h-4" />, color: 'orange', count: 0 },
  ];

  const faqs: FaqItem[] = [
    // General
    {
      question: '¿Qué es QuickNote?',
      answer: 'QuickNote es una aplicación moderna de gestión de notas que combina simplicidad con características avanzadas. Ofrece sincronización en la nube, autenticación biométrica (Passkeys), autenticación de dos factores (2FA), backups automáticos y exportación a múltiples formatos. Diseñada para ser rápida, segura y fácil de usar.',
      category: 'General',
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      question: '¿Cómo funciona la sincronización?',
      answer: 'Tus notas se sincronizan automáticamente con Supabase en la nube cuando hay conexión a internet. Puedes ver el estado de sincronización en el menú lateral y forzar una sincronización manual desde el menú de opciones. La sincronización es bidireccional y en tiempo real.',
      category: 'General',
      icon: <RefreshCw className="w-5 h-5" />
    },
    {
      question: '¿Es segura mi información?',
      answer: 'Sí, QuickNote implementa múltiples capas de seguridad: autenticación biométrica (Passkeys/WebAuthn), autenticación de dos factores (2FA con Google Authenticator), verificación por email OTP, y Row Level Security en Supabase que asegura que solo tú puedas acceder a tus datos.',
      category: 'Seguridad',
      icon: <Shield className="w-5 h-5" />
    },
    // Notas
    {
      question: '¿Cómo crear una nota?',
      answer: 'Para crear una nota, haz clic en el botón "+" en la esquina inferior derecha de la pantalla principal. Luego, completa el título y el contenido, selecciona un color y guarda. También puedes agregar etiquetas para mejor organización. Las notas se guardan automáticamente en la nube.',
      category: 'Notas',
      icon: <FileText className="w-5 h-5" />
    },
    {
      question: '¿Cómo editar una nota existente?',
      answer: 'Puedes editar una nota haciendo clic en ella para abrir el detalle, luego haz clic en el botón "Editar". También puedes hacer clic en el icono de edición (✏️) directamente en la tarjeta de la nota para acceder al formulario de edición.',
      category: 'Notas',
      icon: <FileText className="w-5 h-5" />
    },
    {
      question: '¿Cómo eliminar una nota?',
      answer: 'Puedes eliminar una nota desde el detalle (botón Eliminar), desde el menú de opciones en la tarjeta, o mediante selección múltiple. Las notas eliminadas van a la Papelera, donde pueden ser restauradas por 30 días antes de eliminarse permanentemente.',
      category: 'Notas',
      icon: <Trash2 className="w-5 h-5" />
    },
    // Etiquetas
    {
      question: '¿Cómo funcionan las etiquetas?',
      answer: 'Las etiquetas te ayudan a organizar tus notas por categorías. Puedes agregar múltiples etiquetas a cada nota, filtrar por ellas desde el header, y gestionarlas desde la sección "Etiquetas" en el menú lateral. Cada etiqueta tiene un color único asignado automáticamente basado en su nombre.',
      category: 'Etiquetas',
      icon: <Tag className="w-5 h-5" />
    },
    {
      question: '¿Cómo filtrar notas por etiqueta?',
      answer: 'En el header de la pantalla principal, hay un selector de etiquetas. Selecciona la etiqueta que desees y automáticamente se filtrarán las notas que la contengan. Puedes volver a "Todas las notas" para ver la lista completa.',
      category: 'Etiquetas',
      icon: <Filter className="w-5 h-5" />
    },
    // Organización
    {
      question: '¿Cómo marcar una nota como favorita?',
      answer: 'Para marcar una nota como favorita, haz clic en el icono de estrella (⭐) en la tarjeta de la nota, o desde el detalle usa el botón de favoritos. Las notas favoritas tienen un indicador visual especial y aparecen en la sección "Favoritos" del menú lateral.',
      category: 'Organización',
      icon: <Star className="w-5 h-5" />
    },
    {
      question: '¿Cómo archivar una nota?',
      answer: 'Para archivar una nota, usa el botón de archivar (📦) en el detalle o en el menú de opciones. Las notas archivadas se mueven a la sección "Archivadas" y puedes restaurarlas en cualquier momento. Esto ayuda a mantener ordenada tu lista principal.',
      category: 'Organización',
      icon: <Archive className="w-5 h-5" />
    },
    {
      question: '¿Cómo restaurar una nota de la papelera?',
      answer: 'Ve a la sección "Papelera" en el menú lateral, selecciona la nota que deseas restaurar y haz clic en el icono de restaurar (↩️). También puedes restaurar múltiples notas a la vez usando la selección múltiple.',
      category: 'Organización',
      icon: <RefreshCw className="w-5 h-5" />
    },
    {
      question: '¿Cómo usar el calendario?',
      answer: 'La vista de calendario te permite visualizar tus notas organizadas por fecha. Puedes cambiar entre vista mensual y semanal, y hacer clic en cualquier día para ver las notas creadas en esa fecha. Es ideal para hacer seguimiento de tu actividad.',
      category: 'Organización',
      icon: <Calendar className="w-5 h-5" />
    },
    // Backups
    {
      question: '¿Cómo crear un backup de mis notas?',
      answer: 'En "Configuración" > "Backup en la Nube", puedes crear copias de seguridad de todas tus notas en Supabase. También puedes usar el "Backup Selectivo" para elegir qué notas respaldar, o activar el "Backup Programado" para backups automáticos diarios o semanales.',
      category: 'Backups',
      icon: <Cloud className="w-5 h-5" />
    },
    {
      question: '¿Cómo funciona el Backup Selectivo?',
      answer: 'El Backup Selectivo te permite elegir exactamente qué notas quieres respaldar. Puedes filtrar por favoritas, archivadas o notas con etiquetas, buscar notas específicas, y seleccionar individualmente cada nota antes de guardar el backup en la nube.',
      category: 'Backups',
      icon: <Filter className="w-5 h-5" />
    },
    {
      question: '¿Cómo funciona el Backup Programado?',
      answer: 'Puedes programar backups automáticos diarios (2:00 AM) o semanales (lunes 2:00 AM). Cuando se activa, el sistema verifica si hay notas nuevas y crea un backup automático. Recibirás notificaciones cuando se complete y puedes ver el historial de backups realizados.',
      category: 'Backups',
      icon: <Clock className="w-5 h-5" />
    },
    {
      question: '¿Límite de backups en la nube?',
      answer: 'QuickNote permite un máximo de 10 backups por usuario. Cuando alcanzas el límite, los backups más antiguos se eliminan automáticamente para hacer espacio a los nuevos. Puedes ver tu uso actual en el indicador visual de la sección de backups.',
      category: 'Backups',
      icon: <HardDrive className="w-5 h-5" />
    },
    // Exportación
    {
      question: '¿Cómo exportar una nota?',
      answer: 'Puedes exportar notas individuales desde el detalle de la nota usando el menú de 3 puntos o los botones flotantes. Los formatos disponibles son: PDF (documento profesional), Markdown (texto plano con formato), y JSON (backup completo). También puedes exportar múltiples notas desde la página de backups.',
      category: 'Exportación',
      icon: <Download className="w-5 h-5" />
    },
    {
      question: '¿Cómo compartir una nota en redes sociales?',
      answer: 'Desde el detalle de la nota, haz clic en el botón de compartir o en el menú de 3 puntos y selecciona "Compartir". Puedes compartir la nota en Twitter, Facebook, LinkedIn, WhatsApp, por correo electrónico, o copiar el enlace directo. También puedes exportar como JSON para compartir el archivo.',
      category: 'Exportación',
      icon: <Share2 className="w-5 h-5" />
    },
    // Configuración
    {
      question: '¿Cómo cambiar entre modo oscuro y claro?',
      answer: 'Puedes cambiar el tema usando el toggle de sol/luna (☀️/🌙) en el header de la aplicación, o desde la sección "Configuración" > "Apariencia". El tema se guarda automáticamente para tu próxima visita y respeta tus preferencias del sistema.',
      category: 'General',
      icon: <Layout className="w-5 h-5" />
    },
    {
      question: '¿Cómo funciona la autenticación de dos factores (2FA)?',
      answer: 'Puedes activar 2FA desde "Configuración" > "Seguridad" usando Google Authenticator. Escanea el código QR, ingresa el código de 6 dígitos y guarda tus códigos de respaldo. A partir de entonces, necesitarás tu contraseña y el código 2FA para iniciar sesión.',
      category: 'Seguridad',
      icon: <Lock className="w-5 h-5" />
    },
  ];

  // Actualizar contadores de categorías
  categories.forEach(cat => {
    if (cat.name === 'Todos') {
      cat.count = faqs.length;
    } else {
      cat.count = faqs.filter(f => f.category === cat.name).length;
    }
  });

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || 'blue';
  };

  const getCategoryGradient = (color: string) => {
    const gradients: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
      pink: 'from-pink-500 to-pink-600',
      teal: 'from-teal-500 to-teal-600',
      indigo: 'from-indigo-500 to-indigo-600',
      red: 'from-red-500 to-red-600',
      orange: 'from-orange-500 to-orange-600',
    };
    return gradients[color] || 'from-blue-500 to-purple-600';
  };

  const handleContactClick = (type: string) => {
    if (type === 'email') {
      window.location.href = 'mailto:soporte@quicknote.com';
      success('📧 Correo preparado');
    } else if (type === 'chat') {
      info('Chat en vivo - Próximamente disponible');
    } else if (type === 'faq') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSearchQuery('');
      success('📚 Mostrando todas las preguntas');
    } else if (type === 'feedback') {
      info('Feedback - Próximamente disponible');
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/settings')}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
            </motion.button>
            
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Centro de Ayuda
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sección: ¿Qué es QuickNote? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 mb-8 shadow-xl"
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-white text-2xl font-bold">¿Qué es QuickNote?</h2>
            </div>
            
            <p className="text-white/90 text-base leading-relaxed max-w-3xl">
              QuickNote es una aplicación moderna de gestión de notas que combina simplicidad con características avanzadas. 
              Ofrece <strong className="text-white">sincronización en la nube</strong>, <strong className="text-white">autenticación biométrica (Passkeys)</strong>, 
              <strong className="text-white"> autenticación de dos factores (2FA)</strong>, <strong className="text-white">backups automáticos</strong> y 
              <strong className="text-white"> exportación a múltiples formatos</strong>. Diseñada para ser rápida, segura y fácil de usar.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Shield className="w-4 h-4" /> Segura y encriptada
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Cloud className="w-4 h-4" /> Sincronización cloud
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Zap className="w-4 h-4" /> Rápida y ligera
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Users className="w-4 h-4" /> Para todos los usuarios
              </div>
            </div>
          </div>
        </motion.div>

        {/* Barra de búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en el centro de ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Categorías en grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            Categorías
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.name;
              const gradient = getCategoryGradient(category.color);
              
              return (
                <motion.button
                  key={category.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`
                    px-3 py-2 rounded-xl flex items-center justify-center gap-2 transition-all
                    ${isSelected 
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg` 
                      : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    border border-gray-200 dark:border-gray-700
                  `}
                >
                  <span className={isSelected ? 'text-white' : `text-${category.color}-500`}>
                    {category.icon}
                  </span>
                  <span className="text-xs font-medium">
                    {category.name}
                    {category.name !== 'Todos' && (
                      <span className="ml-1 text-[10px] opacity-70">({category.count})</span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Preguntas Frecuentes en GRID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Preguntas Frecuentes
            </h3>
            <p className="text-xs text-gray-400">
              {filteredFaqs.length} de {faqs.length} preguntas
            </p>
          </div>
          
          {filteredFaqs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron resultados para "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-sm text-purple-500 hover:underline"
              >
                Limpiar búsqueda
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaq === faq.question;
                const categoryColor = getCategoryColor(faq.category);
                const gradient = getCategoryGradient(categoryColor);
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index % 10) * 0.03 }}
                    className={`
                      rounded-xl backdrop-blur-sm border transition-all
                      ${isExpanded 
                        ? 'bg-white/95 dark:bg-gray-800/95 border-purple-500/30 shadow-lg md:col-span-2' 
                        : 'bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:shadow-md'
                      }
                    `}
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : faq.question)}
                      className="w-full px-5 py-4 flex items-center gap-3 text-left"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-20 flex-shrink-0`}>
                        {faq.icon || (faq.category === 'General' && <HelpCircle className="w-4 h-4" />)}
                        {faq.category === 'Notas' && !faq.icon && <FileText className="w-4 h-4" />}
                        {faq.category === 'Etiquetas' && !faq.icon && <Tag className="w-4 h-4" />}
                        {faq.category === 'Organización' && !faq.icon && <Archive className="w-4 h-4" />}
                        {faq.category === 'Backups' && !faq.icon && <Cloud className="w-4 h-4" />}
                        {faq.category === 'Seguridad' && !faq.icon && <Shield className="w-4 h-4" />}
                        {faq.category === 'Exportación' && !faq.icon && <Download className="w-4 h-4" />}
                      </div>
                      
                      <span className="flex-1 font-medium text-gray-900 dark:text-white text-sm">
                        {faq.question}
                      </span>
                      
                      <span className={`text-xs px-2 py-1 rounded-full ${isExpanded ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                        {faq.category}
                      </span>
                      
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Contacto y Soporte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">¿Necesitas más ayuda?</h3>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Contáctanos directamente por estos medios:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleContactClick('email')}
                  className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">Email</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleContactClick('chat')}
                  className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">Chat</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleContactClick('faq')}
                  className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="text-sm">FAQ</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleContactClick('feedback')}
                  className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2"
                >
                  <Star className="w-5 h-5" />
                  <span className="text-sm">Feedback</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Consejo del día */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-full border border-yellow-500/20">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              💡 Consejo: Usa etiquetas para organizar mejor tus notas y encuentra lo que necesitas más rápido
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpPage;