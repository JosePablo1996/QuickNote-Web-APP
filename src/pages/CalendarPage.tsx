import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useNotes } from '../hooks/useNotes';
import { Note } from '../models/Note';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Grid3x3,
  Rows,
  Clock,
  Tag
} from 'lucide-react';

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { notes, isLoading } = useNotes();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isWeeklyView, setIsWeeklyView] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const getNotesForDate = (date: Date): Note[] => {
    return notes.filter(note => {
      try {
        const noteDate = new Date(note.created_at);
        return (
          noteDate.getDate() === date.getDate() &&
          noteDate.getMonth() === date.getMonth() &&
          noteDate.getFullYear() === date.getFullYear() &&
          !note.is_archived &&
          !note.deleted_at
        );
      } catch {
        return false;
      }
    });
  };

  const getWeekDays = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = date.getDay();
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(date.getDate() - diff);
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: (Date | null)[] = [];
    
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentMonth(newDate);
  };

  const formatTime = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando calendario..." />
      </div>
    );
  }

  const selectedDateNotes = getNotesForDate(selectedDate);
  const weekDaysList = getWeekDays(selectedDate);
  const monthDays = getDaysInMonth(currentMonth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header con estilo glass */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/notes')}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                aria-label="Volver a notas"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-green-500 rounded-full" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Calendario
                </h1>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsWeeklyView(!isWeeklyView)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isWeeklyView ? 'Vista mensual' : 'Vista semanal'}
            >
              {isWeeklyView ? (
                <Grid3x3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Rows className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selector de mes */}
        <div className="mb-8 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
          
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => changeMonth(1)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </div>

        {/* Vista del calendario */}
        {isWeeklyView ? (
          <motion.div
            key="week"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDaysList.map((date, index) => {
                const notesForDay = getNotesForDate(date);
                const isSelected = 
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear();

                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      relative p-4 rounded-xl backdrop-blur-sm border-2 transition-all
                      ${isSelected 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg' 
                        : isDarkMode
                          ? 'bg-gray-800/60 border-gray-700/40 hover:bg-gray-700/60'
                          : 'bg-white/80 border-white/90 hover:bg-white'
                      }
                    `}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">{date.getDate()}</div>
                      {notesForDay.length > 0 && (
                        <div className="mt-1">
                          <div className={`text-xs ${isSelected ? 'text-white' : 'text-blue-500'}`}>
                            {notesForDay.length}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="month"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((date, index) => {
                if (!date) {
                  return <div key={index} className="p-2" />;
                }

                const notesForDay = getNotesForDate(date);
                const isSelected = 
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear();
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      relative p-2 rounded-lg backdrop-blur-sm border transition-all
                      ${!isCurrentMonth && 'opacity-40'}
                      ${isSelected 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg' 
                        : isDarkMode
                          ? 'bg-gray-800/40 border-gray-700/30 hover:bg-gray-700/40'
                          : 'bg-white/60 border-white/80 hover:bg-white'
                      }
                    `}
                  >
                    <div className="text-center">
                      <div className={`text-sm ${isSelected ? 'font-semibold' : ''}`}>
                        {date.getDate()}
                      </div>
                      {notesForDay.length > 0 && (
                        <div className="mt-1">
                          <div className={`w-1.5 h-1.5 rounded-full mx-auto ${
                            isSelected ? 'bg-white' : 'bg-blue-500'
                          }`} />
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Notas del día seleccionado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            Notas del {selectedDate.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </h3>

          {selectedDateNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                <CalendarIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No hay notas para este día</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {selectedDateNotes.map((note, index) => {
                  const noteColor = note.color || '#3B82F6';
                  
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/notes/${note.id}`)}
                      className={`
                        p-4 rounded-xl backdrop-blur-sm border-2 cursor-pointer transition-all hover:shadow-lg
                        ${isDarkMode 
                          ? 'bg-gray-800/60 border-gray-700/40 hover:bg-gray-700/60' 
                          : 'bg-white/80 border-white/90 hover:bg-white'
                        }
                      `}
                      style={{ borderLeft: `4px solid ${noteColor}` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{note.title}</h4>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(note.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {note.content}
                      </p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {note.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs rounded-full flex items-center gap-1"
                              style={{
                                backgroundColor: `${noteColor}20`,
                                color: noteColor,
                                border: `1px solid ${noteColor}40`,
                              }}
                            >
                              <Tag className="w-3 h-3" />
                              #{tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{note.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CalendarPage;