// src/contexts/components/auth/TwoFactorSetup.tsx
import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useTheme } from '../../../hooks/useTheme';

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const TwoFactorSetup = ({ onComplete, onCancel }: TwoFactorSetupProps) => {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState<'password' | 'verify' | 'complete'>('password');
  const [password, setPassword] = useState('');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(false);

  const gradientStart = '#8B5CF6';
  const gradientEnd = '#6366F1';

  // Iniciar setup 2FA con contraseña
  const handleStartSetup = async () => {
    if (!password || password.trim().length === 0) {
      setError('Ingresa tu contraseña para continuar');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await api.enableTwoFactor();
      
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }
      
      const responseSecret = response.secret || '';
      const responseQrCode = response.qr_code || '';
      const responseManualKey = response.manual_key || responseSecret;
      
      if (!responseSecret) {
        throw new Error('Error: No se recibió la clave secreta del servidor');
      }
      
      setSecret(responseSecret);
      setQrCode(responseQrCode);
      setManualKey(responseManualKey);
      setQrLoading(true);
      setStep('verify');
      
    } catch (err: any) {
      console.error('Error en enableTwoFactor:', err);
      setError(err.message || 'Error al configurar 2FA. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Verificar código 2FA
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Ingresa el código de 6 dígitos');
      return;
    }
    
    if (!secret) {
      setError('Error: No se encontró la clave secreta. Por favor, reinicia la configuración.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.verifyEnableTwoFactor(verificationCode, secret);
      
      if (response && response.success) {
        const codes = response.backup_codes || [];
        setRecoveryCodes(codes);
        setStep('complete');
      } else {
        throw new Error('Código inválido. Verifica el código en Google Authenticator.');
      }
    } catch (err: any) {
      console.error('Error en verifyEnableTwoFactor:', err);
      setError(err.message || 'Código inválido. Verifica el código en Google Authenticator.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleRetryQr = () => {
    const timestamp = Date.now();
    const baseUrl = qrCode.split('?')[0];
    setQrCode(`${baseUrl}?t=${timestamp}`);
    setQrError(false);
    setQrLoading(true);
  };

  const copyManualKey = () => {
    if (manualKey && navigator.clipboard) {
      navigator.clipboard.writeText(manualKey).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const copyCodes = () => {
    const codesText = recoveryCodes.join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codesText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const downloadCodes = () => {
    const codesText = recoveryCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quicknote_2fa_backup_codes_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Efecto para manejar la carga de la imagen QR
  useEffect(() => {
    if (qrCode) {
      const img = new Image();
      img.onload = () => {
        setQrLoading(false);
        setQrError(false);
      };
      img.onerror = () => {
        setQrLoading(false);
        setQrError(true);
      };
      img.src = qrCode;
    }
  }, [qrCode]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Renderizar paso de contraseña
  const renderPasswordStep = () => (
    <div className="twofa-container">
      <div className="twofa-header">
        <div className="twofa-header-left">
          <div className="twofa-icon-circle" style={{ background: `${gradientStart}20` }}>
            🛡️
          </div>
          <div>
            <h2>Autenticación en Dos Pasos</h2>
            <p className="twofa-step-badge">Paso 1 de 3</p>
          </div>
        </div>
        <button className="twofa-close-btn" onClick={handleCancel} aria-label="Cerrar">
          ✕
        </button>
      </div>
      
      <div className="twofa-content">
        <div className="twofa-info-box">
          <span className="twofa-info-icon">🔒</span>
          <div>
            <p className="twofa-info-title">Confirma tu identidad</p>
            <p className="twofa-info-text">Ingresa tu contraseña actual para continuar.</p>
          </div>
        </div>
        
        <input
          type="password"
          className="twofa-input"
          placeholder="Tu contraseña actual"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleStartSetup()}
          autoFocus
        />
        
        {error && (
          <div className="twofa-error-box">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        <div className="twofa-btn-row">
          <button className="twofa-btn twofa-btn-secondary" onClick={handleCancel}>
            Cancelar
          </button>
          <button
            className="twofa-btn twofa-btn-primary"
            onClick={handleStartSetup}
            disabled={loading}
          >
            {loading ? '⏳ Verificando...' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizar paso de verificación
  const renderVerifyStep = () => {
    const qrContent = qrError ? (
      <div className="twofa-qr-placeholder">
        <span style={{ fontSize: '40px' }}>⚠️</span>
        <p style={{ fontSize: '12px', color: '#6b7280' }}>Error al cargar QR</p>
        <button className="twofa-retry-btn" onClick={handleRetryQr}>
          🔄 Reintentar
        </button>
      </div>
    ) : qrLoading ? (
      <div className="twofa-qr-placeholder">
        <div className="twofa-spinner"></div>
        <p style={{ fontSize: '11px', color: '#6b7280' }}>Cargando QR...</p>
      </div>
    ) : qrCode ? (
      <img src={qrCode} alt="Código QR para 2FA" className="twofa-qr-image" />
    ) : (
      <div className="twofa-qr-placeholder">
        <div className="twofa-spinner"></div>
        <p style={{ fontSize: '11px', color: '#6b7280' }}>Generando QR...</p>
      </div>
    );

    return (
      <div className="twofa-container">
        <div className="twofa-header">
          <div className="twofa-header-left">
            <div className="twofa-icon-circle" style={{ background: `${gradientStart}20` }}>
              📱
            </div>
            <div>
              <h2>Configurar 2FA</h2>
              <p className="twofa-step-badge">Paso 2 de 3</p>
            </div>
          </div>
          <button className="twofa-close-btn" onClick={handleCancel} aria-label="Cerrar">
            ✕
          </button>
        </div>
        
        <div className="twofa-content">
          <div className="twofa-verify-layout">
            <div className="twofa-qr-section">
              <p className="twofa-instruction-title">Escanea este código QR</p>
              <p className="twofa-instruction-sub">con Google Authenticator</p>
              <div className="twofa-qr-container">{qrContent}</div>
              <p className="twofa-instruction-sub twofa-mt-12">
                Abre la app, toca "+" y<br />selecciona "Escanear código QR"
              </p>
            </div>
            
            <div className="twofa-form-section">
              <p className="twofa-manual-key-label">¿No puedes escanear? Clave manual:</p>
              <div className="twofa-manual-key-box">
                <div className="twofa-manual-key">{manualKey || 'Cargando...'}</div>
                <button className="twofa-copy-btn" onClick={copyManualKey} title="Copiar">
                  {copied ? '✅' : '📋'}
                </button>
              </div>
              
              <p className="twofa-code-label">Código de verificación</p>
              <input
                type="text"
                className="twofa-code-input"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                autoFocus
              />
              <p className="twofa-code-hint">Ingresa el código de 6 dígitos</p>
              
              {error && (
                <div className="twofa-error-box">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              
              <div className="twofa-btn-row">
                <button className="twofa-btn twofa-btn-secondary" onClick={handleCancel}>
                  Cancelar
                </button>
                <button
                  className="twofa-btn twofa-btn-primary"
                  onClick={handleVerifyCode}
                  disabled={loading}
                >
                  {loading ? '⏳ Verificando...' : 'Verificar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar paso de completado
  const renderCompleteStep = () => {
    const codesHTML = recoveryCodes.map((code, idx) => (
      <div key={idx} className="twofa-code-item">{code}</div>
    ));

    return (
      <div className="twofa-container">
        <div className="twofa-header">
          <div className="twofa-header-left">
            <div className="twofa-icon-circle" style={{ background: '#10B98120' }}>
              ✅
            </div>
            <div>
              <h2>¡2FA Activado con Éxito!</h2>
              <p className="twofa-step-badge">Paso 3 de 3</p>
            </div>
          </div>
          <button className="twofa-close-btn" onClick={handleComplete} aria-label="Cerrar">
            ✕
          </button>
        </div>
        
        <div className="twofa-content">
          {recoveryCodes.length > 0 && (
            <div className="twofa-success-recovery-box">
              <p className="twofa-success-title">
                <span>⚠️</span> Guarda tus códigos de respaldo
              </p>
              <p className="twofa-success-desc">
                Si pierdes acceso a Google Authenticator, usa estos códigos. Cada código funciona una sola vez.
              </p>
              <div className="twofa-codes-list">{codesHTML}</div>
              <div className="twofa-btn-row" style={{ marginTop: '12px' }}>
                <button className="twofa-btn twofa-btn-secondary" onClick={copyCodes} style={{ fontSize: '11px' }}>
                  {copied ? '✅ ¡Copiado!' : '📋 Copiar todos'}
                </button>
                <button className="twofa-btn twofa-btn-secondary" onClick={downloadCodes} style={{ fontSize: '11px' }}>
                  💾 Descargar
                </button>
              </div>
            </div>
          )}
          
          <div className="twofa-success-green-box">
            <span style={{ fontSize: '20px' }}>🛡️</span>
            <p style={{ fontSize: '12px' }}>Tu cuenta ahora está protegida con autenticación en dos pasos.</p>
          </div>
          
          <button className="twofa-btn twofa-btn-primary twofa-full-width" onClick={handleComplete}>
            Entendido, cerrar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="twofa-modal-overlay" onClick={handleCancel}>
      <div className="twofa-modal" onClick={(e) => e.stopPropagation()}>
        {step === 'password' && renderPasswordStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'complete' && renderCompleteStep()}
      </div>

      <style>{`
        /* Overlay del modal */
        .twofa-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: twofaFadeIn 0.2s ease-out;
        }

        @keyframes twofaFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Contenedor del modal */
        .twofa-modal {
          width: 90%;
          max-width: 860px;
          max-height: 90vh;
          overflow-y: auto;
          background: ${isDarkMode ? '#1f2937' : '#ffffff'};
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
          animation: twofaSlideIn 0.3s ease-out;
        }

        @keyframes twofaSlideIn {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Scrollbar personalizada */
        .twofa-modal::-webkit-scrollbar {
          width: 8px;
        }
        .twofa-modal::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#374151' : '#f1f1f1'};
          border-radius: 10px;
        }
        .twofa-modal::-webkit-scrollbar-thumb {
          background: ${gradientStart};
          border-radius: 10px;
        }

        /* Header */
        .twofa-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid ${isDarkMode ? '#37415150' : '#e5e7eb50'};
          background: ${isDarkMode ? '#11182780' : '#f9fafb80'};
          position: sticky;
          top: 0;
          backdrop-filter: blur(8px);
          z-index: 10;
        }

        .twofa-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .twofa-icon-circle {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .twofa-header h2 {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: ${isDarkMode ? '#e5e7eb' : '#1f2937'};
        }

        .twofa-step-badge {
          font-size: 11px;
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
          margin: 0;
        }

        .twofa-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 18px;
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .twofa-close-btn:hover {
          background: ${isDarkMode ? '#374151' : '#f3f4f6'};
        }

        /* Content */
        .twofa-content {
          padding: 24px;
        }

        /* Layout para paso de verificación */
        .twofa-verify-layout {
          display: flex;
          gap: 32px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .twofa-qr-section {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .twofa-form-section {
          flex: 1;
          min-width: 200px;
        }

        /* QR */
        .twofa-qr-container {
          background: white;
          border-radius: 16px;
          padding: 16px;
          border: 3px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }
        .twofa-qr-image {
          width: 220px;
          height: 220px;
          display: block;
        }
        .twofa-qr-placeholder {
          width: 220px;
          height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .twofa-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #e5e7eb;
          border-top-color: ${gradientStart};
          border-radius: 50%;
          animation: twofaSpin 0.7s linear infinite;
        }
        @keyframes twofaSpin {
          to { transform: rotate(360deg); }
        }
        .twofa-retry-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid ${gradientStart}40;
          background: ${gradientStart}10;
          color: ${gradientStart};
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .twofa-retry-btn:hover {
          background: ${gradientStart}20;
        }

        /* Instrucciones */
        .twofa-instruction-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 4px;
          text-align: center;
          color: ${isDarkMode ? '#e5e7eb' : '#1f2937'};
        }
        .twofa-instruction-sub {
          font-size: 11px;
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
          margin-bottom: 16px;
          text-align: center;
        }
        .twofa-mt-12 {
          margin-top: 12px;
        }

        /* Manual key */
        .twofa-manual-key-label {
          font-size: 11px;
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
          margin-bottom: 6px;
        }
        .twofa-manual-key-box {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .twofa-manual-key {
          flex: 1;
          padding: 10px 14px;
          background: ${isDarkMode ? '#111827' : '#f3f4f6'};
          border-radius: 10px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          text-align: center;
          letter-spacing: 1.5px;
          border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
          word-break: break-all;
          user-select: all;
          color: ${isDarkMode ? '#e5e7eb' : '#1f2937'};
        }
        .twofa-copy-btn {
          padding: 10px;
          border-radius: 10px;
          border: none;
          background: ${isDarkMode ? '#374151' : '#e5e7eb'};
          cursor: pointer;
          font-size: 16px;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .twofa-copy-btn:hover {
          background: ${isDarkMode ? '#4b5563' : '#d1d5db'};
        }

        /* Code input */
        .twofa-code-label {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 6px;
          color: ${isDarkMode ? '#e5e7eb' : '#1f2937'};
        }
        .twofa-code-input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 2px solid ${isDarkMode ? '#4b5563' : '#d1d5db'};
          background: ${isDarkMode ? '#111827' : '#ffffff'};
          color: ${isDarkMode ? '#e5e7eb' : '#1f2937'};
          font-size: 24px;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.6em;
          text-align: center;
          font-weight: 700;
          outline: none;
          margin-bottom: 4px;
        }
        .twofa-code-input:focus {
          border-color: ${gradientStart};
        }
        .twofa-code-hint {
          font-size: 11px;
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
          text-align: center;
          margin-bottom: 16px;
        }

        /* Input normal */
        .twofa-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 2px solid ${isDarkMode ? '#4b5563' : '#d1d5db'};
          background: ${isDarkMode ? '#111827' : '#ffffff'};
          color: ${isDarkMode ? '#e5e7eb' : '#1f2937'};
          font-size: 14px;
          outline: none;
          margin-bottom: 16px;
        }
        .twofa-input:focus {
          border-color: ${gradientStart};
        }

        /* Error */
        .twofa-error-box {
          background: ${isDarkMode ? '#7f1d1d30' : '#fef2f2'};
          border: 1px solid ${isDarkMode ? '#991b1b80' : '#fecaca'};
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: ${isDarkMode ? '#fca5a5' : '#dc2626'};
        }

        /* Info box */
        .twofa-info-box {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          border-radius: 14px;
          margin-bottom: 20px;
          background: ${gradientStart}10;
          border: 1px solid ${gradientStart}20;
        }
        .twofa-info-icon {
          font-size: 28px;
          flex-shrink: 0;
        }
        .twofa-info-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 3px;
          color: ${isDarkMode ? '#e5e7eb' : '#1f2937'};
        }
        .twofa-info-text {
          font-size: 12px;
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
        }

        /* Buttons */
        .twofa-btn-row {
          display: flex;
          gap: 10px;
        }
        .twofa-btn {
          flex: 1;
          padding: 11px 16px;
          border-radius: 10px;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .twofa-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .twofa-btn-primary {
          background: linear-gradient(135deg, ${gradientStart}, ${gradientEnd});
          color: white;
        }
        .twofa-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${gradientStart}40;
        }
        .twofa-btn-secondary {
          background: ${isDarkMode ? '#374151' : '#f3f4f6'};
          color: ${isDarkMode ? '#e5e7eb' : '#1f2937'};
          border: 1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'};
        }
        .twofa-btn-secondary:hover {
          background: ${isDarkMode ? '#4b5563' : '#e5e5e5'};
        }
        .twofa-full-width {
          width: 100%;
        }

        /* Recovery codes */
        .twofa-success-recovery-box {
          background: ${isDarkMode ? '#78350f20' : '#fffbeb'};
          border: 2px solid ${isDarkMode ? '#92400e60' : '#fcd34d'};
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .twofa-success-title {
          font-size: 14px;
          font-weight: 600;
          color: ${isDarkMode ? '#fbbf24' : '#92400e'};
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .twofa-success-desc {
          font-size: 11px;
          color: ${isDarkMode ? '#d97706' : '#a16207'};
          margin-bottom: 12px;
        }
        .twofa-codes-list {
          background: ${isDarkMode ? '#1f2937' : '#ffffff'};
          border-radius: 10px;
          padding: 10px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          max-height: 140px;
          overflow-y: auto;
          border: 1px solid ${isDarkMode ? '#92400e40' : '#fcd34d'};
        }
        .twofa-code-item {
          padding: 4px 0;
          text-align: center;
          font-weight: 600;
          letter-spacing: 1px;
          color: ${isDarkMode ? '#e5e7eb' : '#1f2937'};
        }
        .twofa-success-green-box {
          background: #10B98110;
          border: 1px solid #10B98120;
          border-radius: 14px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        /* Responsive */
        @media (max-width: 700px) {
          .twofa-verify-layout {
            flex-direction: column;
            align-items: center;
          }
          .twofa-qr-image,
          .twofa-qr-placeholder,
          .twofa-qr-container {
            width: 200px;
            height: 200px;
          }
          .twofa-code-input {
            font-size: 18px;
            letter-spacing: 0.3em;
          }
          .twofa-modal {
            width: 95%;
            max-height: 85vh;
          }
          .twofa-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default TwoFactorSetup;