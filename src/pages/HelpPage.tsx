// src/pages/HelpPage.tsx
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
  Lock,
  Heart,
  Info,
  Globe,
  Smartphone,
  Fingerprint,
  Bell,
  Save,
  BarChart,
  Target
} from 'lucide-react';

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="flex items-center gap-2 mb-4 px-2">
      <div className="w-1 h-5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
      <h2 className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {icon && <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>{icon}</span>}
        {title}
      </h2>
    </div>
  );
};

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <motion.div 
      whileHover={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      className={`rounded-2xl backdrop-blur-xl border overflow-hidden mb-6 ${isDarkMode ? 'bg-gray-800/60 border-gray-700/40' : 'bg-white/80 border-white/70'} shadow-lg ${className}`}
    >
      {children}
    </motion.div>
  );
};

const HelpTile = ({
  icon,
  iconColor,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  onClick?: () => void;
}) => {
  const { isDarkMode } = useTheme();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 ${isDarkMode ? 'bg-gray-800/60 border-gray-700/40' : 'bg-white/80 border-white/70'} hover:shadow-xl`}
    >
      <div className="flex items-start gap-4">
        <motion.div 
          whileHover={{ rotate: 5 }}
          className={`p-3 rounded-xl ${iconColor} shadow-md`}
        >
          {icon}
        </motion.div>
        <div className="flex-1">
          <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <p className={`text-sm mt-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} leading-relaxed`}>{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const FaqItem = ({ 
  question, 
  answer 
}: { 
  question: string; 
  answer: string | string[];
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border-b last:border-b-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <motion.button
        whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 text-left transition-all`}
      >
        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}
        >
          <ChevronDown size={18} />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`px-5 pb-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {Array.isArray(answer) ? (
                <ul className="space-y-2.5">
                  {answer.map((item, index) => (
                    <li key={index} className="text-sm flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-relaxed">{answer}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Modal de guía rápida
const GuideModal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  steps,
  tips 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  icon: React.ReactNode;
  steps: string[];
  tips?: string[];
}) => {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`relative w-full max-w-lg rounded-2xl overflow-hidden border-2 shadow-2xl ${isDarkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-purple-300'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-5">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="p-3 bg-white/20 rounded-xl"
            >
              {icon}
            </motion.div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        <div className="p-6">
          {/* Pasos a seguir */}
          <div className="mb-6">
            <h4 className={`font-semibold mb-4 flex items-center gap-2 text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Zap size={18} className="text-emerald-500" />
              Pasos a seguir:
            </h4>
            <ul className="space-y-3">
              {steps.map((step, index) => (
                <motion.li 
                  key={index} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className={`w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center mt-0.5 flex-shrink-0 shadow-md`}>
                    {index + 1}
                  </span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>{step}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Consejos adicionales */}
          {tips && tips.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20`}
            >
              <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Lightbulb size={16} className="text-amber-500" />
                Consejos útiles:
              </h4>
              <ul className="space-y-2">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 mt-0.5">💡</span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className={`w-full mt-6 py-3 rounded-xl font-medium transition-all bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-lg`}
          >
            ¡Entendido!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { info, success } = useToast();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [activeTab, setActiveTab] = useState<'faq' | 'contacto' | 'about'>('faq');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Características principales de QuickNote
  const features = [
    {
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      iconColor: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
      title: 'Gestión de Notas',
      description: 'Crea, edita, organiza y prioriza tus notas con un sistema intuitivo.',
      details: 'Formato enriquecido, colores personalizados, etiquetas y búsqueda avanzada.'
    },
    {
      icon: <Cloud className="w-5 h-5 text-purple-500" />,
      iconColor: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
      title: 'Sincronización en la Nube',
      description: 'Tus notas sincronizadas automáticamente con Supabase.',
      details: 'Backup automático, restauración de datos y disponibilidad en todos tus dispositivos.'
    },
    {
      icon: <Fingerprint className="w-5 h-5 text-emerald-500" />,
      iconColor: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
      title: 'Seguridad Avanzada',
      description: 'Protege tu cuenta con autenticación biométrica, 2FA y OTP.',
      details: 'Passkeys, autenticación de dos factores (TOTP), códigos de respaldo y más.'
    },
    {
      icon: <Save className="w-5 h-5 text-amber-500" />,
      iconColor: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
      title: 'Copias de Seguridad',
      description: 'Realiza backups completos de tus notas con un solo clic.',
      details: 'Backup automático, exportación manual a JSON, importación y restauración.'
    },
    {
      icon: <Calendar className="w-5 h-5 text-cyan-500" />,
      iconColor: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20',
      title: 'Calendario y Estadísticas',
      description: 'Visualiza tu actividad y organiza tus notas por fecha.',
      details: 'Vista mensual/semanal, estadísticas de productividad y seguimiento.'
    },
    {
      icon: <Share2 className="w-5 h-5 text-pink-500" />,
      iconColor: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20',
      title: 'Exportación y Compartición',
      description: 'Exporta tus notas a PDF, Markdown o JSON.',
      details: 'Comparte en redes sociales, copia enlace directo o descarga el archivo.'
    }
  ];

  // Guías rápidas
  const quickGuides = [
    {
      id: 'primeros-pasos',
      icon: <Rocket className="w-5 h-5 text-amber-500" size={0} />,
      iconColor: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
      title: 'Primeros pasos',
      description: 'Guía básica para comenzar a usar QuickNote',
      steps: [
        'Regístrate o inicia sesión con tu cuenta',
        'En la página principal, haz clic en el botón "+" para crear una nota',
        'Completa el título y contenido de tu primera nota',
        'Personaliza el color y añade etiquetas',
        'Guarda tu nota y comienza a organizar tus ideas'
      ],
      tips: [
        'Puedes editar cualquier nota haciendo clic en ella',
        'Usa el buscador para encontrar notas rápidamente',
        'Las notas se sincronizan automáticamente en todos tus dispositivos'
      ]
    },
    {
      id: 'seguridad',
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      iconColor: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
      title: 'Seguridad y 2FA',
      description: 'Cómo proteger tu cuenta',
      steps: [
        'Activa la autenticación de dos factores (2FA) desde Configuración > Seguridad',
        'Escanea el código QR con Google Authenticator o Authy',
        'Ingresa el código de 6 dígitos para completar la activación',
        'Guarda tus códigos de respaldo en un lugar seguro',
        'Configura Passkeys para un inicio de sesión biométrico'
      ],
      tips: [
        'La autenticación 2FA protege tu cuenta de accesos no autorizados',
        'Recibirás una notificación por email cuando inicies sesión en un nuevo dispositivo',
        'Puedes desactivar 2FA en cualquier momento'
      ]
    },
    {
      id: 'backups',
      icon: <Cloud className="w-5 h-5 text-cyan-500" />,
      iconColor: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20',
      title: 'Copias de Seguridad',
      description: 'Cómo respaldar y restaurar tus notas',
      steps: [
        'Ve a Configuración > Copias de Seguridad',
        'Usa "Crear Backup" para guardar todas tus notas',
        'Para backups selectivos, usa "Backup Selectivo" y elige las notas',
        'Puedes programar backups automáticos diarios o semanales',
        'Restaura desde cualquier backup guardado con un clic'
      ],
      tips: [
        'Los backups locales se almacenan en tu navegador como archivos JSON',
        'Los backups en la nube están protegidos con RLS en Supabase',
        'El límite de backups en la nube es de 20 por usuario'
      ]
    }
  ];

  // Categorías y FAQs actualizadas para QuickNote
  const categories = [
    { name: 'Todos', icon: <BookOpen className="w-4 h-4" />, color: 'blue' },
    { name: 'General', icon: <HelpCircle className="w-4 h-4" />, color: 'purple' },
    { name: 'Notas', icon: <FileText className="w-4 h-4" />, color: 'green' },
    { name: 'Etiquetas', icon: <Tag className="w-4 h-4" />, color: 'pink' },
    { name: 'Organización', icon: <Archive className="w-4 h-4" />, color: 'teal' },
    { name: 'Backups', icon: <Cloud className="w-4 h-4" />, color: 'indigo' },
    { name: 'Seguridad', icon: <Shield className="w-4 h-4" />, color: 'red' },
    { name: 'Exportación', icon: <Download className="w-4 h-4" />, color: 'orange' },
  ];

  const faqs = [
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
    // Notas
    {
      question: '¿Cómo crear una nota?',
      answer: 'Para crear una nota, haz clic en el botón "+" en la esquina inferior derecha de la pantalla principal. Luego, completa el título y el contenido, selecciona un color y guarda. También puedes agregar etiquetas para mejor organización. Las notas se guardan automáticamente en la nube.',
      category: 'Notas',
      icon: <FileText className="w-5 h-5" />
    },
    {
      question: '¿Cómo personalizar una nota?',
      answer: 'Puedes personalizar el color de fondo, la forma (cuadrada, redondeada, ovalada o píldora), el icono y el tamaño de la nota. También puedes ajustar la intensidad del color. Todas estas opciones están disponibles al editar la nota o desde la sección de personalización.',
      category: 'Notas',
      icon: <Palette className="w-5 h-5" size={0} />
    },
    // Etiquetas
    {
      question: '¿Cómo funcionan las etiquetas?',
      answer: 'Las etiquetas te ayudan a organizar tus notas por categorías. Puedes agregar múltiples etiquetas a cada nota, filtrar por ellas desde el header, y gestionarlas desde la sección "Etiquetas" en el menú lateral.',
      category: 'Etiquetas',
      icon: <Tag className="w-5 h-5" />
    },
    // Backups
    {
      question: '¿Cómo crear un backup de mis notas?',
      answer: 'En "Configuración" > "Copias de Seguridad", puedes crear copias de seguridad de todas tus notas. Puedes hacer backups locales (almacenados en tu navegador) o en la nube (Supabase). También puedes usar el "Backup Selectivo" para elegir qué notas respaldar.',
      category: 'Backups',
      icon: <Cloud className="w-5 h-5" />
    },
    {
      question: '¿Límite de backups en la nube?',
      answer: 'QuickNote permite un máximo de 20 backups por usuario. Cuando alcanzas el límite, recibirás una advertencia y podrás decidir si eliminar los más antiguos o todos los backups. El límite de backups locales también es de 20.',
      category: 'Backups',
      icon: <HardDrive className="w-5 h-5" />
    },
    // Seguridad
    {
      question: '¿Cómo activar la autenticación de dos factores (2FA)?',
      answer: 'Ve a Configuración > Seguridad, expande la sección "Autenticación de Dos Factores (2FA)", haz clic en "Configurar 2FA", escanea el código QR con Google Authenticator o Authy, ingresa el código de verificación y guarda tus códigos de respaldo en un lugar seguro.',
      category: 'Seguridad',
      icon: <Lock className="w-5 h-5" />
    },
    {
      question: '¿Qué son las Passkeys?',
      answer: 'Las Passkeys te permiten iniciar sesión con huella digital, Face ID o PIN sin necesidad de contraseña. Puedes registrar una Passkey desde Configuración > Seguridad > Claves de acceso. Son más seguras que las contraseñas tradicionales y resistentes al phishing.',
      category: 'Seguridad',
      icon: <Fingerprint className="w-5 h-5" />
    },
    // Exportación
    {
      question: '¿Cómo exportar una nota?',
      answer: 'Puedes exportar notas individuales desde el detalle de la nota usando el menú de 3 puntos o los botones de exportación. Los formatos disponibles son: PDF (documento profesional), Markdown (texto plano con formato) y JSON (backup completo).',
      category: 'Exportación',
      icon: <Download className="w-5 h-5" />
    }
  ];

  // Funciones
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

  const handleGuideClick = (guideId: string) => {
    setActiveModal(guideId);
  };

  const getActiveGuide = () => {
    return quickGuides.find(guide => guide.id === activeModal);
  };

  const handleContactClick = (type: string) => {
    if (type === 'email') {
      window.location.href = 'mailto:soporte@quicknote.com';
      success('📧 Correo preparado');
    } else if (type === 'chat') {
      info('Chat en vivo - Próximamente disponible');
    } else if (type === 'faq') {
      setActiveTab('faq');
      setSearchQuery('');
      success('📚 Mostrando todas las preguntas');
    } else if (type === 'feedback') {
      info('Feedback - Próximamente disponible');
    }
  };

  const activeGuide = getActiveGuide();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-20 backdrop-blur-xl border-b ${isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/settings')}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              >
                <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`} />
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Centro de Ayuda
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BANNER DECORATIVO ESTILO LOGIN PAGE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-40 md:h-48 w-full overflow-hidden rounded-3xl shadow-2xl"
        >
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col items-center space-y-3">
              <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl tracking-tight">
                Quick<span className="text-amber-300">Note</span>
              </h2>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30 shadow-2xl"
              >
                <HelpCircle className="w-4 h-4 text-amber-300" />
                <span className="text-white font-medium text-sm md:text-base">
                  Centro de Ayuda y Soporte
                </span>
              </motion.div>
            </div>

            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30 shadow-lg">
                v 2.6.0
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Barra de búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Buscar en el centro de ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-10 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${isDarkMode ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-500' : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400'}`}
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearchQuery('')}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Tabs de navegación */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`flex gap-2 p-1.5 rounded-xl border mb-8 ${isDarkMode ? 'bg-gray-800/60 border-gray-700/40' : 'bg-white/80 border-white/70'} shadow-md overflow-x-auto`}
        >
          {[
            { id: 'faq', icon: <MessageCircle size={16} />, label: 'Preguntas Frecuentes' },
            { id: 'contacto', icon: <Mail size={16} />, label: 'Contacto' },
            { id: 'about', icon: <Info size={16} />, label: 'Acerca de' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg'
                  : isDarkMode
                    ? 'text-gray-400 hover:bg-gray-700/50'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </motion.div>

        {/* Contenido según tab */}
        <AnimatePresence mode="wait">
          {/* Tab: Preguntas Frecuentes */}
          {activeTab === 'faq' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Categorías */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.name;
                  const gradient = getCategoryGradient(category.color);
                  
                  return (
                    <motion.button
                      key={category.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all ${
                        isSelected
                          ? `bg-gradient-to-r ${gradient} text-white shadow-md`
                          : isDarkMode
                            ? 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60'
                            : 'bg-white/80 text-gray-600 hover:bg-gray-100'
                      } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <span className={isSelected ? 'text-white' : `text-${category.color}-500`}>
                        {category.icon}
                      </span>
                      <span className="text-xs font-medium">{category.name}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* FAQs */}
              {filteredFaqs.length === 0 ? (
                <div className={`text-center py-16 rounded-2xl border ${isDarkMode ? 'bg-gray-800/60 border-gray-700/40' : 'bg-white/80 border-white/70'}`}>
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                    <Search className={`w-10 h-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    No se encontraron resultados para "{searchQuery}"
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 text-sm text-purple-500 hover:underline"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              ) : (
                <GlassCard>
                  {filteredFaqs.map((faq, index) => {
                    const isExpanded = expandedFaq === faq.question;
                    const categoryColor = getCategoryColor(faq.category);
                    const gradient = getCategoryGradient(categoryColor);
                    
                    return (
                      <div key={index} className={`border-b last:border-b-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
                          
                          <span className={`flex-1 font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {faq.question}
                          </span>
                          
                          <span className={`text-xs px-2 py-1 rounded-full ${isExpanded ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                            {faq.category}
                          </span>
                          
                          {isExpanded ? (
                            <ChevronUp className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} flex-shrink-0`} />
                          ) : (
                            <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} flex-shrink-0`} />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className={`px-5 pb-5 pt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </GlassCard>
              )}
            </motion.div>
          )}

          {/* Tab: Contacto */}
          {activeTab === 'contacto' && (
            <motion.div
              key="contacto"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <GlassCard>
                <div className="p-6 md:p-8 space-y-8">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-5 shadow-xl">
                      <Users className="w-12 h-12 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>¿Necesitas ayuda personalizada?</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} max-w-md mx-auto`}>
                      Estoy aquí para ayudarte. Puedes contactarme por cualquiera de estos medios.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleContactClick('email')}
                      className={`p-5 rounded-xl border flex items-center gap-4 transition-all ${isDarkMode ? 'bg-gray-800/60 border-gray-700/40 hover:bg-gray-700/60' : 'bg-white/80 border-white/70 hover:bg-gray-50'} hover:shadow-lg`}
                    >
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20">
                        <Mail className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Correo electrónico</h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} break-all`}>soporte@quicknote.com</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleContactClick('feedback')}
                      className={`p-5 rounded-xl border flex items-center gap-4 transition-all ${isDarkMode ? 'bg-gray-800/60 border-gray-700/40 hover:bg-gray-700/60' : 'bg-white/80 border-white/70 hover:bg-gray-50'} hover:shadow-lg`}
                    >
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                        <Star className="w-6 h-6 text-amber-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Feedback y sugerencias</h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Comparte tus ideas para mejorar QuickNote</p>
                      </div>
                    </button>
                  </div>

                  {/* Tiempo de respuesta */}
                  <div className={`border-t pt-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h4 className={`font-medium text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Clock size={16} className="inline mr-2" />
                      Tiempo de respuesta estimado
                    </h4>
                    <div className="flex justify-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-500">&lt; 24h</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</div>
                      </div>
                      <div className={`w-px h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-500">&lt; 48h</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Feedback</div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Tab: Acerca de */}
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <GlassCard>
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-xl flex-shrink-0">
                      <Layout className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Tu gestor de notas inteligente
                      </h3>
                      <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>QuickNote</strong> es una aplicación moderna
                        de gestión de notas diseñada para ayudarte a organizar tus ideas, tareas y recordatorios.
                        Con sincronización en tiempo real, autenticación avanzada y backups automáticos.
                      </p>
                    </div>
                  </div>

                  <div className={`p-5 rounded-xl border mb-6 ${isDarkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Desarrollada con tecnologías modernas como <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>React + TypeScript</strong> en el
                      frontend y <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>FastAPI + Supabase</strong> en el backend, QuickNote
                      ofrece una experiencia fluida, segura y responsive.
                    </p>
                  </div>

                  {/* Características */}
                  <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Sparkles size={18} className="text-emerald-500" />
                    Características principales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-xl border transition-all ${isDarkMode ? 'bg-gray-800/60 border-gray-700/40' : 'bg-white/80 border-white/70'} hover:shadow-md`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-lg ${feature.iconColor} flex-shrink-0`}>
                            {feature.icon}
                          </div>
                          <div>
                            <h5 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h5>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} leading-relaxed`}>{feature.description}</p>
                            <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} leading-relaxed`}>{feature.details}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlassCard>

              {/* Versión */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <Info className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Versión actual: v2.6.0
                    </h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} leading-relaxed`}>
                      Esta versión incluye sincronización completa con Supabase, sistema de copia de seguridad,
                      autenticación biométrica (Passkeys), 2FA, exportación a múltiples formatos y múltiples
                      mejoras de rendimiento y seguridad.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 pt-6 border-t text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
            </motion.div>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Centro de ayuda de QuickNote v2.6.0 - Supabase Edition
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            >
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
            </motion.div>
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            ¿No encuentras lo que buscas? Contáctame directamente y te ayudaré a resolver tu consulta.
          </p>
        </motion.div>
      </div>

      {/* Modal de guía rápida */}
      <AnimatePresence>
        {activeModal && activeGuide && (
          <GuideModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            title={activeGuide.title}
            icon={activeGuide.icon}
            steps={activeGuide.steps}
            tips={activeGuide.tips}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente Lightbulb para el modal
const Lightbulb = ({ size, className }: { size: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

// Componente Rocket para el modal
const Rocket = ({ size, className }: { size: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

// Componente Palette para el modal
const Palette = ({ size, className }: { size: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a10 10 0 0 0 0 20c2 0 4-1 4-3 0-1-.5-2-2-2h-2c-1 0-2-1-2-2 0-1 1-2 2-2h2c2 0 3-1 3-3 0-2-2-4-5-4z" />
    <circle cx="7" cy="10" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="17" cy="10" r="1" />
  </svg>
);

export default HelpPage;