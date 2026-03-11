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
  ExternalLink,
  Home,
  Zap,
  X
} from 'lucide-react'; // Añadido X para XCircle

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme(); // Esto se usa en las clases CSS
  const { info, success } = useToast();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = [
    { name: 'Todos', icon: <BookOpen className="w-4 h-4" />, color: 'blue' },
    { name: 'General', icon: <HelpCircle className="w-4 h-4" />, color: 'purple' },
    { name: 'Notas', icon: <FileText className="w-4 h-4" />, color: 'green' },
    { name: 'Etiquetas', icon: <Tag className="w-4 h-4" />, color: 'pink' },
    { name: 'Organización', icon: <Archive className="w-4 h-4" />, color: 'teal' },
    { name: 'Configuración', icon: <Settings className="w-4 h-4" />, color: 'gray' },
    { name: 'Papelera', icon: <Trash2 className="w-4 h-4" />, color: 'red' },
  ];

  const faqs: FaqItem[] = [
    {
      question: '¿Cómo crear una nota?',
      answer: 'Para crear una nota, haz clic en el botón "+" en la esquina inferior derecha de la pantalla principal. Luego, completa el título y el contenido, selecciona un color y guarda. También puedes agregar etiquetas para mejor organización.',
      category: 'Notas'
    },
    {
      question: '¿Cómo editar una nota existente?',
      answer: 'Puedes editar una nota haciendo clic en ella para abrir el detalle, luego haz clic en el botón "Editar". También puedes hacer clic en el icono de edición (✏️) directamente en la tarjeta de la nota para acceder al formulario de edición.',
      category: 'Notas'
    },
    {
      question: '¿Cómo eliminar una nota?',
      answer: 'Puedes eliminar una nota desde el detalle (botón Eliminar), desde el menú de opciones en la tarjeta, o mediante selección múltiple. Las notas eliminadas van a la Papelera, donde pueden ser restauradas por 30 días antes de eliminarse permanentemente.',
      category: 'Notas'
    },
    {
      question: '¿Cómo funcionan las etiquetas?',
      answer: 'Las etiquetas te ayudan a organizar tus notas por categorías. Puedes agregar múltiples etiquetas a cada nota, filtrar por ellas desde el header, y gestionarlas desde la sección "Etiquetas" en el menú lateral. Cada etiqueta tiene un color único asignado automáticamente basado en su nombre.',
      category: 'Etiquetas'
    },
    {
      question: '¿Cómo marcar una nota como favorita?',
      answer: 'Para marcar una nota como favorita, haz clic en el icono de estrella (⭐) en la tarjeta de la nota, o desde el detalle usa el botón de favoritos. Las notas favoritas tienen un indicador visual especial y aparecen en la sección "Favoritos" del menú lateral.',
      category: 'Organización'
    },
    {
      question: '¿Cómo archivar una nota?',
      answer: 'Para archivar una nota, usa el botón de archivar (📦) en el detalle o en el menú de opciones. Las notas archivadas se mueven a la sección "Archivadas" y puedes restaurarlas en cualquier momento. Esto ayuda a mantener ordenada tu lista principal.',
      category: 'Organización'
    },
    {
      question: '¿Cómo restaurar una nota de la papelera?',
      answer: 'Ve a la sección "Papelera" en el menú lateral, selecciona la nota que deseas restaurar y haz clic en el icono de restaurar (↩️). También puedes restaurar múltiples notas a la vez usando la selección múltiple.',
      category: 'Papelera'
    },
    {
      question: '¿Cómo cambiar entre modo oscuro y claro?',
      answer: 'Puedes cambiar el tema usando el toggle de sol/luna (☀️/🌙) en el header de la aplicación, o desde la sección "Configuración" > "Apariencia". El tema se guarda automáticamente para tu próxima visita y respeta tus preferencias del sistema.',
      category: 'Configuración'
    },
    {
      question: '¿Cómo crear un backup de mis notas?',
      answer: 'En "Configuración" > "Backups", puedes crear copias de seguridad de todas tus notas en la nube. Los backups se guardan automáticamente y puedes restaurarlos cuando lo necesites. También puedes ver el historial de backups y estadísticas.',
      category: 'Configuración'
    },
    {
      question: '¿Cómo filtrar notas por etiqueta?',
      answer: 'En el header de la pantalla principal, hay un selector de etiquetas. Selecciona la etiqueta que desees y automáticamente se filtrarán las notas que la contengan. Puedes volver a "Todas las notas" para ver la lista completa.',
      category: 'Etiquetas'
    },
    {
      question: '¿Cómo usar el calendario?',
      answer: 'La vista de calendario te permite visualizar tus notas organizadas por fecha. Puedes cambiar entre vista mensual y semanal, y hacer clic en cualquier día para ver las notas creadas en esa fecha. Es ideal para hacer seguimiento de tu actividad.',
      category: 'Organización'
    },
    {
      question: '¿Cómo funciona la sincronización?',
      answer: 'Tus notas se sincronizan automáticamente con la nube cuando hay conexión a internet. Puedes ver el estado de sincronización en el menú lateral y forzar una sincronización manual desde el menú de opciones.',
      category: 'General'
    },
  ];

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
      gray: 'from-gray-500 to-gray-600',
      red: 'from-red-500 to-red-600',
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
      {/* Header con estilo glass */}
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

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de bienvenida con estilo glass */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-8 mb-8 shadow-xl"
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">¿Necesitas ayuda?</h2>
              <p className="text-white/80 text-sm">Explora nuestras guías y recursos</p>
            </div>
          </div>

          {/* Barra de búsqueda estilo glass */}
          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="text"
              placeholder="Buscar ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Categorías */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            Categorías
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.name;
              const gradient = getCategoryGradient(category.color);
              
              return (
                <motion.button
                  key={category.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`
                    px-4 py-2 rounded-xl flex items-center gap-2 transition-all
                    ${isSelected 
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg` 
                      : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    border border-white/30 dark:border-gray-700/30
                  `}
                >
                  <span className={isSelected ? 'text-white' : `text-${category.color}-500`}>
                    {category.icon}
                  </span>
                  <span className="text-sm font-medium">{category.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Preguntas Frecuentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            Preguntas Frecuentes
          </h3>
          
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
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaq === faq.question;
                const categoryColor = getCategoryColor(faq.category);
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      rounded-xl backdrop-blur-sm border-2 transition-all
                      ${isExpanded 
                        ? 'bg-white/90 dark:bg-gray-800/90 border-blue-500/30 shadow-lg' 
                        : 'bg-white/80 dark:bg-gray-800/80 border-white/30 dark:border-gray-700/30 hover:shadow-md'
                      }
                    `}
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : faq.question)}
                      className="w-full px-6 py-4 flex items-center gap-4 text-left"
                    >
                      <div 
                        className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryGradient(categoryColor)} bg-opacity-20`}
                      >
                        {faq.category === 'General' && <Home className="w-4 h-4" style={{ color: `var(--${categoryColor}-500)` }} />}
                        {faq.category === 'Notas' && <FileText className="w-4 h-4" style={{ color: `var(--${categoryColor}-500)` }} />}
                        {faq.category === 'Etiquetas' && <Tag className="w-4 h-4" style={{ color: `var(--${categoryColor}-500)` }} />}
                        {faq.category === 'Organización' && <Archive className="w-4 h-4" style={{ color: `var(--${categoryColor}-500)` }} />}
                        {faq.category === 'Configuración' && <Settings className="w-4 h-4" style={{ color: `var(--${categoryColor}-500)` }} />}
                        {faq.category === 'Papelera' && <Trash2 className="w-4 h-4" style={{ color: `var(--${categoryColor}-500)` }} />}
                      </div>
                      
                      <span className="flex-1 font-medium text-gray-900 dark:text-white">
                        {faq.question}
                      </span>
                      
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {faq.category}
                      </span>
                      
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
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
                          <div className="px-6 pb-4 pt-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleContactClick('email')}
                  className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">Email</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleContactClick('chat')}
                  className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">Chat</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleContactClick('faq')}
                  className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="text-sm">FAQ</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
              Consejo: Usa la papelera para recuperar notas eliminadas hasta 30 días después
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpPage;