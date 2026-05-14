// src/contexts/components/auth/TwoFactorSetup.tsx
import { useState, useEffect, useRef } from 'react';
import { api } from '../../../services/api';
import { useTheme } from '../../../hooks/useTheme';

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const TwoFactorSetup = ({ onComplete, onCancel }: TwoFactorSetupProps) => {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState<'password' | 'verify' | 'complete'>('password');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [is2FASetupComplete, setIs2FASetupComplete] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const secretRef = useRef<string>('');
  const completedRef = useRef<boolean>(false); // Evitar doble llamada a onComplete

  const gradientStart = '#8B5CF6';
  const gradientEnd = '#6366F1';

  // Mantener secretRef sincronizado
  useEffect(() => {
    secretRef.current = secret;
  }, [secret]);

  // Abrir ventana popup al montar
  useEffect(() => {
    openPopupWindow();
    
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      const { action, data } = event.data;
      console.log('📨 [Padre] Mensaje recibido:', action);
      
      switch (action) {
        case 'START_SETUP':
          handleStartSetup(data.password);
          break;
        case 'VERIFY_CODE':
          handleVerifyCode(data.code);
          break;
        case 'CANCEL':
          closePopup();
          if (onCancel) onCancel();
          break;
        case 'COMPLETE':
          handleComplete();
          break;
        case 'POPUP_READY':
          sendInitialState();
          break;
        case 'RETRY_QR':
          retryLoadQr();
          break;
        case 'POPUP_CLOSED':
          // Solo llamar onCancel si no se completó el setup
          if (!completedRef.current && onCancel) {
            onCancel();
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      closePopup();
    };
  }, []);

  // Enviar QR al popup cuando esté disponible
  useEffect(() => {
    if (popupRef.current && !popupRef.current.closed && qrCode && step === 'verify') {
      console.log('📤 [Padre] Enviando UPDATE_QR con secret');
      sendToPopup({
        action: 'UPDATE_QR',
        data: {
          qrCode,
          manualKey,
          secret: secretRef.current,
          step: 'verify',
          loading: false
        }
      });
    }
  }, [qrCode, manualKey, step]);

  // Enviar recovery codes al popup
  useEffect(() => {
    if (popupRef.current && !popupRef.current.closed && recoveryCodes.length > 0 && step === 'complete') {
      console.log('📤 [Padre] Enviando códigos de recuperación');
      sendToPopup({
        action: 'UPDATE_STATE',
        data: { step: 'complete', recoveryCodes, loading: false }
      });
    }
  }, [recoveryCodes, step]);

  const sendInitialState = () => {
    console.log('📤 [Padre] Enviando INITIAL_STATE');
    sendToPopup({
      action: 'INITIAL_STATE',
      data: {
        step,
        qrCode,
        manualKey,
        secret: secretRef.current,
        loading,
        isDarkMode,
        gradientStart,
        gradientEnd
      }
    });
  };

  const openPopupWindow = () => {
    const width = 700;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      '',
      'twoFactorSetup',
      `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,status=no,toolbar=no,menubar=no,location=no`
    );

    if (popup) {
      popupRef.current = popup;
      popup.document.write(getPopupHTML());
      popup.document.close();

      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          window.dispatchEvent(new MessageEvent('message', {
            data: { action: 'POPUP_CLOSED' },
            origin: window.location.origin
          }));
        }
      }, 500);
      
      console.log('✅ [Padre] Popup abierto correctamente');
    } else {
      console.warn('⚠️ [Padre] Popup bloqueado');
      if (onCancel) onCancel();
    }
  };

  const closePopup = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;
  };

  const sendToPopup = (message: any) => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.postMessage(message, window.location.origin);
    }
  };

  const handleStartSetup = async (pwd: string) => {
    if (!pwd || pwd.trim().length === 0) {
      sendToPopup({ action: 'SHOW_ERROR', data: 'Ingresa tu contraseña para continuar' });
      return;
    }

    console.log('🔐 [Padre] Iniciando setup 2FA...');
    sendToPopup({ action: 'SET_LOADING', data: true });
    
    try {
      const response = await api.enableTwoFactor();
      console.log('📦 [Padre] Respuesta enableTwoFactor:', JSON.stringify(response, null, 2));
      
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }
      
      const responseSecret = response.secret || '';
      const responseQrCode = response.qr_code || '';
      const responseManualKey = response.manual_key || responseSecret;
      
      if (!responseSecret) {
        console.error('❌ [Padre] No se recibió secret en la respuesta');
        throw new Error('Error: No se recibió la clave secreta del servidor');
      }
      
      console.log('✅ [Padre] Secret recibido:', responseSecret.substring(0, 10) + '...');
      
      setSecret(responseSecret);
      secretRef.current = responseSecret;
      setQrCode(responseQrCode);
      setManualKey(responseManualKey);
      setStep('verify');
      
      sendToPopup({
        action: 'UPDATE_QR',
        data: {
          qrCode: responseQrCode,
          manualKey: responseManualKey,
          secret: responseSecret,
          step: 'verify',
          loading: false
        }
      });
      
    } catch (err: any) {
      console.error('❌ [Padre] Error en enableTwoFactor:', err);
      const errorMsg = err.message || 'Error al configurar 2FA. Intenta de nuevo.';
      sendToPopup({ action: 'SHOW_ERROR', data: errorMsg });
      sendToPopup({ action: 'SET_LOADING', data: false });
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (code.length !== 6) {
      sendToPopup({ action: 'SHOW_ERROR', data: 'Ingresa el código de 6 dígitos' });
      return;
    }
    
    const currentSecret = secretRef.current;
    
    console.log('🔍 [Padre] Verificando código:', code);
    console.log('🔑 [Padre] Secret:', currentSecret ? currentSecret.substring(0, 10) + '...' : 'NO DISPONIBLE');
    
    if (!currentSecret) {
      sendToPopup({ 
        action: 'SHOW_ERROR', 
        data: 'Error: No se encontró la clave secreta. Por favor, reinicia la configuración.' 
      });
      return;
    }
    
    sendToPopup({ action: 'SET_LOADING', data: true });
    sendToPopup({ action: 'CLEAR_ERROR' });
    
    try {
      const response = await api.verifyEnableTwoFactor(code, currentSecret);
      console.log('📦 [Padre] Respuesta verifyEnableTwoFactor:', JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        const codes = response.backup_codes || [];
        console.log('✅ [Padre] 2FA verificado correctamente. Códigos:', codes.length);
        
        setRecoveryCodes(codes);
        setStep('complete');
        setIs2FASetupComplete(true);
        
        // Pequeño delay para asegurar que el backend guardó todo
        await new Promise(resolve => setTimeout(resolve, 300));
        
        sendToPopup({
          action: 'UPDATE_STATE',
          data: { 
            step: 'complete', 
            recoveryCodes: codes, 
            loading: false 
          }
        });
      } else {
        throw new Error('Código inválido o respuesta inesperada del servidor');
      }
    } catch (err: any) {
      console.error('❌ [Padre] Error en verifyEnableTwoFactor:', err);
      const errorMsg = err.message || 'Código inválido. Verifica el código en Google Authenticator.';
      sendToPopup({ action: 'SHOW_ERROR', data: errorMsg });
      sendToPopup({ action: 'SET_LOADING', data: false });
    }
  };

  const handleComplete = () => {
    console.log('✅ [Padre] Completando setup 2FA...');
    completedRef.current = true;
    closePopup();
    
    // Llamar onComplete después de cerrar el popup
    if (onComplete) {
      // Pequeño delay para asegurar que todo esté sincronizado
      setTimeout(() => {
        onComplete();
      }, 200);
    }
  };

  const retryLoadQr = () => {
    console.log('🔄 [Padre] Reintentando QR...');
    const timestamp = Date.now();
    if (qrCode) {
      const baseUrl = qrCode.split('?')[0];
      const newQrCode = `${baseUrl}?t=${timestamp}`;
      setQrCode(newQrCode);
      
      sendToPopup({
        action: 'UPDATE_QR',
        data: { 
          qrCode: newQrCode, 
          manualKey, 
          secret: secretRef.current,
          step 
        }
      });
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      closePopup();
    };
  }, []);

  // ============================================
  // HTML DEL POPUP
  // ============================================
  
  const getPopupHTML = () => {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Configurar 2FA - QuickNote</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${isDarkMode ? '#111827' : '#f9fafb'};
      color: ${isDarkMode ? '#e5e7eb' : '#1f2937'};
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      width: 100%;
      max-width: 660px;
      background: ${isDarkMode ? '#1f2937' : '#ffffff'};
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
      overflow: hidden;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid ${isDarkMode ? '#37415150' : '#e5e7eb50'};
      background: ${isDarkMode ? '#11182780' : '#f9fafb80'};
    }
    
    .header-left { display: flex; align-items: center; gap: 12px; }
    
    .icon-circle {
      width: 42px; height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    
    .header h2 { font-size: 16px; font-weight: 700; }
    .step-badge { font-size: 11px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'}; }
    
    .close-btn {
      width: 36px; height: 36px;
      border-radius: 10px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 18px;
      color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .close-btn:hover { background: ${isDarkMode ? '#374151' : '#f3f4f6'}; }
    
    .content { padding: 24px; }
    
    .verify-layout { display: flex; gap: 32px; align-items: flex-start; }
    .qr-section { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; }
    .form-section { flex: 1; min-width: 0; }
    
    .qr-container {
      background: white;
      border-radius: 16px;
      padding: 16px;
      border: 3px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    }
    
    .qr-image { width: 220px; height: 220px; display: block; }
    
    .qr-placeholder {
      width: 220px; height: 220px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid #e5e7eb;
      border-top-color: #8B5CF6;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .retry-btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #8B5CF640;
      background: #8B5CF610;
      color: #8B5CF6;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .retry-btn:hover { background: #8B5CF620; }
    
    .instruction-title { font-size: 14px; font-weight: 700; margin-bottom: 4px; text-align: center; }
    .instruction-sub { font-size: 11px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'}; margin-bottom: 16px; text-align: center; }
    
    .manual-key-label { font-size: 11px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'}; margin-bottom: 6px; }
    
    .manual-key-box { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
    
    .manual-key {
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
    }
    
    .copy-btn {
      padding: 10px;
      border-radius: 10px;
      border: none;
      background: ${isDarkMode ? '#374151' : '#e5e7eb'};
      cursor: pointer;
      font-size: 16px;
      flex-shrink: 0;
    }
    .copy-btn:hover { background: ${isDarkMode ? '#4b5563' : '#d1d5db'}; }
    
    .code-label { font-size: 12px; font-weight: 600; margin-bottom: 6px; }
    
    .code-input {
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
    .code-input:focus { border-color: #8B5CF6; }
    
    .code-hint { font-size: 11px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'}; text-align: center; margin-bottom: 16px; }
    
    .error-box {
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
    
    .btn-row { display: flex; gap: 10px; }
    
    .btn {
      flex: 1;
      padding: 11px 16px;
      border-radius: 10px;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .btn-primary { background: linear-gradient(135deg, #8B5CF6, #6366F1); color: white; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
    
    .btn-secondary {
      background: ${isDarkMode ? '#374151' : '#f3f4f6'};
      color: ${isDarkMode ? '#e5e7eb' : '#1f2937'};
      border: 1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'};
    }
    .btn-secondary:hover { background: ${isDarkMode ? '#4b5563' : '#e5e7eb'}; }
    
    .info-box {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px;
      border-radius: 14px;
      margin-bottom: 20px;
      background: #8B5CF610;
      border: 1px solid #8B5CF620;
    }
    
    .info-icon { font-size: 28px; flex-shrink: 0; }
    .info-title { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
    .info-text { font-size: 12px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'}; }
    
    .input-field {
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
    .input-field:focus { border-color: #8B5CF6; }
    
    .success-recovery-box {
      background: ${isDarkMode ? '#78350f20' : '#fffbeb'};
      border: 2px solid ${isDarkMode ? '#92400e60' : '#fcd34d'};
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .success-title {
      font-size: 14px;
      font-weight: 600;
      color: ${isDarkMode ? '#fbbf24' : '#92400e'};
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .success-desc { font-size: 11px; color: ${isDarkMode ? '#d97706' : '#a16207'}; margin-bottom: 12px; }
    
    .codes-list {
      background: ${isDarkMode ? '#1f2937' : '#ffffff'};
      border-radius: 10px;
      padding: 10px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      max-height: 140px;
      overflow-y: auto;
      border: 1px solid ${isDarkMode ? '#92400e40' : '#fcd34d'};
    }
    
    .code-item { padding: 4px 0; text-align: center; font-weight: 600; letter-spacing: 1px; }
    
    .success-green-box {
      background: #10B98110;
      border: 1px solid #10B98120;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    
    .full-width-btn { width: 100%; }
    .hidden { display: none !important; }
    .text-center { text-align: center; }
    .mt-12 { margin-top: 12px; }
    .mb-12 { margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container" id="app"></div>
  
  <script>
    console.log('🚀 Popup 2FA inicializado');
    
    let state = {
      step: '${step}',
      qrCode: '',
      manualKey: '',
      secret: '',
      recoveryCodes: [],
      loading: false,
      error: '',
      copied: false,
      qrError: false,
      qrLoading: false,
      password: '',
      isDarkMode: ${isDarkMode}
    };
    
    const app = document.getElementById('app');
    
    function log(msg, data) {
      console.log('%c[Popup]%c ' + msg, 'color:#8B5CF6;font-weight:bold;', 'color:inherit;', data || '');
    }
    
    function render() {
      log('Renderizando: ' + state.step);
      switch(state.step) {
        case 'password': renderPasswordStep(); break;
        case 'verify': renderVerifyStep(); break;
        case 'complete': renderCompleteStep(); break;
      }
    }
    
    function renderPasswordStep() {
      app.innerHTML = \`
        <div class="header">
          <div class="header-left">
            <div class="icon-circle" style="background:#8B5CF620;">🛡️</div>
            <div>
              <h2>Autenticación en Dos Pasos</h2>
              <p class="step-badge">Paso 1 de 3</p>
            </div>
          </div>
          <button class="close-btn" onclick="cancel()" title="Cerrar">✕</button>
        </div>
        <div class="content">
          <div class="info-box">
            <span class="info-icon">🔒</span>
            <div>
              <p class="info-title">Confirma tu identidad</p>
              <p class="info-text">Ingresa tu contraseña actual para continuar.</p>
            </div>
          </div>
          <input type="password" class="input-field" id="passwordInput" 
            placeholder="Tu contraseña actual" autofocus
            onkeydown="if(event.key==='Enter') startSetup()" />
          \${state.error ? \`<div class="error-box"><span>⚠️</span><span>\${state.error}</span></div>\` : ''}
          <div class="btn-row">
            <button class="btn btn-secondary" onclick="cancel()">Cancelar</button>
            <button class="btn btn-primary" onclick="startSetup()" \${state.loading ? 'disabled' : ''}>
              \${state.loading ? '⏳ Verificando...' : 'Continuar'}
            </button>
          </div>
        </div>
      \`;
      setTimeout(() => { const inp = document.getElementById('passwordInput'); if (inp) inp.focus(); }, 100);
    }
    
    function renderVerifyStep() {
      const qrContent = state.qrError ? \`
        <div class="qr-placeholder">
          <span style="font-size:40px;">⚠️</span>
          <p style="font-size:12px;color:#6b7280;">Error al cargar QR</p>
          <button class="retry-btn" onclick="retryQr()">🔄 Reintentar</button>
        </div>
      \` : state.qrCode ? \`
        <div class="qr-placeholder" id="qrLoading" style="\${state.qrLoading ? '' : 'display:none;'}">
          <div class="spinner"></div>
          <p style="font-size:11px;color:#6b7280;">Cargando QR...</p>
        </div>
        <img src="\${state.qrCode}" alt="QR Code" class="qr-image" id="qrImage"
          style="\${state.qrLoading ? 'display:none;' : 'display:block;'}"
          onload="onQrLoad()" onerror="onQrError()" />
      \` : \`<div class="qr-placeholder"><div class="spinner"></div><p style="font-size:11px;color:#6b7280;">Generando QR...</p></div>\`;
      
      app.innerHTML = \`
        <div class="header">
          <div class="header-left">
            <div class="icon-circle" style="background:#8B5CF620;">📱</div>
            <div><h2>Configurar 2FA</h2><p class="step-badge">Paso 2 de 3</p></div>
          </div>
          <button class="close-btn" onclick="cancel()" title="Cerrar">✕</button>
        </div>
        <div class="content">
          <div class="verify-layout">
            <div class="qr-section">
              <p class="instruction-title">Escanea este código QR</p>
              <p class="instruction-sub">con Google Authenticator</p>
              <div class="qr-container">\${qrContent}</div>
              <p class="instruction-sub mt-12">Abre la app, toca "+" y<br/>selecciona "Escanear código QR"</p>
            </div>
            <div class="form-section">
              <p class="manual-key-label">¿No puedes escanear? Clave manual:</p>
              <div class="manual-key-box">
                <div class="manual-key">\${state.manualKey || 'Cargando...'}</div>
                <button class="copy-btn" onclick="copyManualKey()" title="Copiar">\${state.copied ? '✅' : '📋'}</button>
              </div>
              <p class="code-label">Código de verificación</p>
              <input type="text" class="code-input" id="codeInput"
                placeholder="000000" maxlength="6" autofocus
                oninput="this.value=this.value.replace(/\\\\D/g,'').slice(0,6)"
                onkeydown="if(event.key==='Enter') verifyCode()" />
              <p class="code-hint">Ingresa el código de 6 dígitos</p>
              \${state.error ? \`<div class="error-box"><span>⚠️</span><span>\${state.error}</span></div>\` : ''}
              <div class="btn-row">
                <button class="btn btn-secondary" onclick="cancel()">Cancelar</button>
                <button class="btn btn-primary" onclick="verifyCode()" \${state.loading ? 'disabled' : ''}>
                  \${state.loading ? '⏳ Verificando...' : 'Verificar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      \`;
      setTimeout(() => { const inp = document.getElementById('codeInput'); if (inp) inp.focus(); }, 100);
    }
    
    function renderCompleteStep() {
      const codesHTML = (state.recoveryCodes || []).map(c => '<div class="code-item">' + c + '</div>').join('');
      
      app.innerHTML = \`
        <div class="header">
          <div class="header-left">
            <div class="icon-circle" style="background:#10B98120;">✅</div>
            <div><h2>¡2FA Activado con Éxito!</h2><p class="step-badge">Paso 3 de 3</p></div>
          </div>
          <button class="close-btn" onclick="complete()" title="Cerrar">✕</button>
        </div>
        <div class="content">
          \${(state.recoveryCodes || []).length > 0 ? \`
            <div class="success-recovery-box">
              <p class="success-title">⚠️ Guarda tus códigos de respaldo</p>
              <p class="success-desc">Si pierdes acceso a Google Authenticator, usa estos códigos. Cada código funciona una sola vez.</p>
              <div class="codes-list">\${codesHTML}</div>
              <div class="btn-row" style="margin-top:12px;">
                <button class="btn btn-secondary" onclick="copyCodes()" style="font-size:11px;">\${state.copied ? '✅ ¡Copiado!' : '📋 Copiar todos'}</button>
                <button class="btn btn-secondary" onclick="downloadCodes()" style="font-size:11px;">💾 Descargar</button>
              </div>
            </div>
          \` : ''}
          <div class="success-green-box">
            <span style="font-size:20px;">🛡️</span>
            <p style="font-size:12px;">Tu cuenta ahora está protegida con autenticación en dos pasos.</p>
          </div>
          <button class="btn btn-primary full-width-btn" onclick="complete()">Entendido, cerrar</button>
        </div>
      \`;
    }
    
    function onQrLoad() {
      state.qrLoading = false;
      state.qrError = false;
      const loading = document.getElementById('qrLoading');
      const img = document.getElementById('qrImage');
      if (loading) loading.style.display = 'none';
      if (img) img.style.display = 'block';
    }
    
    function onQrError() { state.qrError = true; state.qrLoading = false; render(); }
    function retryQr() { state.qrError = false; state.qrLoading = true; window.opener.postMessage({ action: 'RETRY_QR' }, '*'); render(); }
    
    function startSetup() {
      state.error = '';
      state.loading = true;
      const pwd = document.getElementById('passwordInput')?.value || '';
      render();
      window.opener.postMessage({ action: 'START_SETUP', data: { password: pwd } }, '*');
    }
    
    function verifyCode() {
      state.error = '';
      state.loading = true;
      const code = document.getElementById('codeInput')?.value || '';
      render();
      window.opener.postMessage({ action: 'VERIFY_CODE', data: { code } }, '*');
    }
    
    function cancel() { window.opener.postMessage({ action: 'CANCEL' }, '*'); }
    function complete() { window.opener.postMessage({ action: 'COMPLETE' }, '*'); }
    
    function copyManualKey() {
      if (state.manualKey && navigator.clipboard) {
        navigator.clipboard.writeText(state.manualKey).then(() => {
          state.copied = true; render();
          setTimeout(() => { state.copied = false; render(); }, 2000);
        });
      }
    }
    
    function copyCodes() {
      const codes = (state.recoveryCodes || []).join('\\n');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(codes).then(() => {
          state.copied = true; render();
          setTimeout(() => { state.copied = false; render(); }, 2000);
        });
      }
    }
    
    function downloadCodes() {
      const codes = (state.recoveryCodes || []).join('\\n');
      const blob = new Blob([codes], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quicknote_2fa_backup_codes_' + new Date().toISOString().split('T')[0] + '.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      log('✅ Códigos descargados');
    }
    
    // Escuchar mensajes del padre
    window.addEventListener('message', (event) => {
      if (event.origin !== window.location.origin) return;
      const { action, data } = event.data;
      log('📥 ' + action, data);
      
      switch (action) {
        case 'INITIAL_STATE':
        case 'UPDATE_STATE':
          Object.assign(state, data || {});
          render();
          break;
        case 'UPDATE_QR':
          state.qrCode = data?.qrCode || '';
          state.manualKey = data?.manualKey || '';
          state.secret = data?.secret || '';
          state.step = data?.step || 'verify';
          state.loading = data?.loading !== undefined ? data.loading : false;
          state.qrLoading = true;
          state.qrError = false;
          render();
          break;
        case 'SHOW_ERROR':
          state.error = data;
          state.loading = false;
          render();
          break;
        case 'CLEAR_ERROR':
          state.error = '';
          render();
          break;
        case 'SET_LOADING':
          state.loading = data;
          render();
          break;
      }
    });
    
    log('📤 POPUP_READY');
    window.opener.postMessage({ action: 'POPUP_READY' }, '*');
    render();
  </script>
</body>
</html>`;
  };

  return null;
};

export default TwoFactorSetup;