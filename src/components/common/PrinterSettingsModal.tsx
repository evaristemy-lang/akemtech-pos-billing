import React, { useState } from 'react';
import {
  Printer,
  X,
  Bluetooth,
  Usb,
  Wifi,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone,
  Laptop,
  Play,
  RotateCw,
  Sliders,
  DollarSign,
  FileText,
  Volume2,
  Cpu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { PrintMode, PaperWidth } from '../../types';
import {
  connectBluetoothPrinter,
  connectUsbPrinter,
  connectSerialPrinter,
  autoDetectDefaultPrinter,
  playHardwareBeep,
} from '../../utils/printerEngine';

export const PrinterSettingsModal: React.FC = () => {
  const {
    printerConfig,
    updatePrinterConfig,
    hardwareEnv,
    isPrinterModalOpen,
    setIsPrinterModalOpen,
    testPrinter,
    kickCashDrawer,
    language,
  } = useApp();

  const t = translations[language];
  const [isTesting, setIsTesting] = useState(false);
  const [isDrawerTesting, setIsDrawerTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isPrinterModalOpen) return null;

  const handleAutoIdentify = () => {
    const recommended = autoDetectDefaultPrinter();
    updatePrinterConfig(recommended);
    playHardwareBeep('print');
    setTestResult(
      language === 'fr'
        ? `Profil ${recommended.name} (${recommended.paperWidth}) appliqué automatiquement selon votre matériel !`
        : `Profile ${recommended.name} (${recommended.paperWidth}) automatically applied for your hardware!`
    );
  };

  const handlePairBluetooth = async () => {
    setIsConnecting(true);
    setTestResult(null);
    try {
      const dev = await connectBluetoothPrinter();
      updatePrinterConfig({
        mode: 'bluetooth',
        bluetoothDeviceName: dev.name,
        bluetoothDeviceId: dev.id,
        name: dev.name,
        status: 'connected',
      });
      playHardwareBeep('scan');
      setTestResult(language === 'fr' ? `Connecté avec succès à ${dev.name}` : `Successfully connected to ${dev.name}`);
    } catch (err: any) {
      playHardwareBeep('error');
      setTestResult(err.message || 'Bluetooth connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePairUsb = async () => {
    setIsConnecting(true);
    setTestResult(null);
    try {
      const dev = await connectUsbPrinter();
      updatePrinterConfig({
        mode: 'usb',
        usbProductName: dev.name,
        usbVendorId: dev.vendorId,
        name: dev.name,
        status: 'connected',
      });
      playHardwareBeep('scan');
      setTestResult(language === 'fr' ? `Connecté en USB Direct à ${dev.name}` : `Connected via Direct USB to ${dev.name}`);
    } catch (err: any) {
      playHardwareBeep('error');
      setTestResult(err.message || 'USB connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePairSerial = async () => {
    setIsConnecting(true);
    setTestResult(null);
    try {
      const dev = await connectSerialPrinter();
      updatePrinterConfig({
        mode: 'serial',
        name: dev.name,
        status: 'connected',
      });
      playHardwareBeep('scan');
      setTestResult(language === 'fr' ? `Connecté au Port Série COM (9600 bauds)` : `Connected to Serial COM Port (9600 baud)`);
    } catch (err: any) {
      playHardwareBeep('error');
      setTestResult(err.message || 'Serial connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRunTestPrint = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      playHardwareBeep('print');
      await testPrinter();
      setTestResult(language === 'fr' ? 'Ticket de test transmis et découpé avec succès !' : 'Test receipt printed and cut successfully!');
    } catch (err: any) {
      playHardwareBeep('error');
      setTestResult(err.message || 'Print error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestDrawer = async () => {
    setIsDrawerTesting(true);
    try {
      playHardwareBeep('cash');
      await kickCashDrawer();
    } finally {
      setIsDrawerTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print text-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {language === 'fr' ? 'Configuration Imprimantes & Caisse' : 'Printer & Hardware Management'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'fr'
                  ? 'Détection automatique (PC, Android, iOS) & liaison tout mode'
                  : 'Universal auto-detection & multi-mode thermal printing'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPrinterModalOpen(false)}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Hardware Auto-Detection Banner */}
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 via-slate-50 to-white p-4 dark:border-teal-900/60 dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-900">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-teal-600 p-2 text-white">
                {hardwareEnv.isMobile ? <Smartphone className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase tracking-wider text-teal-900 dark:text-teal-300 text-[10px]">
                    {language === 'fr' ? 'Système Identifié Automatiquement' : 'System Auto-Identified'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[9px] font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300 uppercase">
                      {hardwareEnv.platform}
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoIdentify}
                      className="rounded-lg bg-teal-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs hover:bg-teal-700 flex items-center gap-1"
                      title="Auto-configurer selon le périphérique détecté"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>{language === 'fr' ? 'Auto-Appliquer' : 'Auto-Apply'}</span>
                    </button>
                  </div>
                </div>
                <p className="mt-1 font-bold text-slate-900 dark:text-white text-xs">
                  {hardwareEnv.isMobile
                    ? (language === 'fr' ? 'Smartphone / Tablette Détecté' : 'Mobile / Tablet Detected')
                    : (language === 'fr' ? 'Ordinateur de Bureau / Caisse Détecté' : 'Desktop Computer / POS Station Detected')}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                  {language === 'fr'
                    ? `Mode recommandé : ${hardwareEnv.recommendedMode.toUpperCase()} • Bluetooth : ${hardwareEnv.bluetoothSupported ? 'Disponible' : 'Non supporté'} • USB : ${hardwareEnv.usbSupported ? 'Disponible' : 'Non supporté'} • Série : ${hardwareEnv.serialSupported ? 'Disponible' : 'Non supporté'}`
                    : `Recommended Mode: ${hardwareEnv.recommendedMode.toUpperCase()} • Bluetooth: ${hardwareEnv.bluetoothSupported ? 'Available' : 'Unsupported'} • USB: ${hardwareEnv.usbSupported ? 'Available' : 'Unsupported'} • Serial: ${hardwareEnv.serialSupported ? 'Available' : 'Unsupported'}`}
                </p>
              </div>
            </div>
          </div>

          {/* Print Modes Selection */}
          <div>
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
              {language === 'fr' ? '1. Mode de Connexion Imprimante (Tous les modes supportés)' : '1. Connection Mode (All Modes Supported)'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* Mode 1: System / AirPrint */}
              <button
                type="button"
                onClick={() => updatePrinterConfig({ mode: 'system', name: 'Spooler Système OS' })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition ${
                  printerConfig.mode === 'system'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-200 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Monitor className="h-4 w-4 mb-1 text-teal-600" />
                <span className="font-extrabold text-[11px]">Système OS</span>
                <span className="text-[9px] text-slate-400 mt-0.5">AirPrint / PC</span>
              </button>

              {/* Mode 2: Bluetooth */}
              <button
                type="button"
                onClick={() => updatePrinterConfig({ mode: 'bluetooth' })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition ${
                  printerConfig.mode === 'bluetooth'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-200 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Bluetooth className="h-4 w-4 mb-1 text-blue-600" />
                <span className="font-extrabold text-[11px]">Bluetooth</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Ceinturon BLE</span>
              </button>

              {/* Mode 3: USB / OTG */}
              <button
                type="button"
                onClick={() => updatePrinterConfig({ mode: 'usb' })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition ${
                  printerConfig.mode === 'usb'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-200 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Usb className="h-4 w-4 mb-1 text-purple-600" />
                <span className="font-extrabold text-[11px]">USB Direct</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Epson / XP</span>
              </button>

              {/* Mode 4: Network Wi-Fi / IP */}
              <button
                type="button"
                onClick={() => updatePrinterConfig({ mode: 'network' })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition ${
                  printerConfig.mode === 'network'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-200 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Wifi className="h-4 w-4 mb-1 text-amber-500" />
                <span className="font-extrabold text-[11px]">Réseau Wi-Fi</span>
                <span className="text-[9px] text-slate-400 mt-0.5">RAW 9100</span>
              </button>

              {/* Mode 5: Serial RS-232 / COM */}
              <button
                type="button"
                onClick={() => updatePrinterConfig({ mode: 'serial' })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition ${
                  printerConfig.mode === 'serial'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-200 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Cpu className="h-4 w-4 mb-1 text-indigo-500" />
                <span className="font-extrabold text-[11px]">Port Série</span>
                <span className="text-[9px] text-slate-400 mt-0.5">RS232 / COM</span>
              </button>
            </div>
          </div>

          {/* Mode Configuration Subpanel */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            {printerConfig.mode === 'bluetooth' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white">
                      {printerConfig.bluetoothDeviceName ? `Appairé : ${printerConfig.bluetoothDeviceName}` : 'Aucune imprimante Bluetooth sélectionnée'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Compatible MPT-II, PT-210, GOOJPRT, Xprinter, Mini POS 58mm/80mm
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isConnecting}
                    onClick={handlePairBluetooth}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Bluetooth className="h-3.5 w-3.5" />
                    <span>{isConnecting ? 'Recherche...' : 'Scanner & Lier'}</span>
                  </button>
                </div>
              </div>
            )}

            {printerConfig.mode === 'usb' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white">
                      {printerConfig.usbProductName ? `Appareil USB : ${printerConfig.usbProductName}` : 'Aucune imprimante USB sélectionnée'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Pilote ESC/POS natif direct (Epson, Munbyn, Bixolon, Star, Rongta)
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isConnecting}
                    onClick={handlePairUsb}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 font-bold text-white hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Usb className="h-3.5 w-3.5" />
                    <span>{isConnecting ? 'Connexion...' : 'Détecter USB'}</span>
                  </button>
                </div>
              </div>
            )}

            {printerConfig.mode === 'network' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Adresse IP Imprimante Réseau</label>
                  <input
                    type="text"
                    value={printerConfig.ipAddress || '192.168.1.200'}
                    onChange={e => updatePrinterConfig({ ipAddress: e.target.value })}
                    placeholder="192.168.1.200"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 font-mono outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Port RAW</label>
                  <input
                    type="number"
                    value={printerConfig.port || 9100}
                    onChange={e => updatePrinterConfig({ port: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 font-mono outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {printerConfig.mode === 'serial' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white">
                      Port Série RS-232 / COM (9600 bauds)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Compatible câbles DB9 / USB-Série FTDI & imprimantes fiscales de caisse
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isConnecting}
                    onClick={handlePairSerial}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Cpu className="h-3.5 w-3.5" />
                    <span>{isConnecting ? 'Connexion...' : 'Sélectionner Port COM'}</span>
                  </button>
                </div>
              </div>
            )}

            {printerConfig.mode === 'system' && (
              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">
                  Boîte de dialogue d'impression système universelle
                </p>
                <p className="text-[11px] text-slate-500">
                  Fonctionne instantanément avec toutes les imprimantes installées sur Windows, Mac, Linux, ou via AirPrint et le spouleur d'impression Android sans configuration supplémentaire.
                </p>
              </div>
            )}
          </div>

          {/* Paper Width & Thermal Formatting */}
          <div>
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
              {language === 'fr' ? '2. Format Papier & Rouleau Thermique' : '2. Paper Roll Width'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updatePrinterConfig({ paperWidth: '80mm' })}
                className={`p-3 rounded-2xl border text-left transition ${
                  printerConfig.paperWidth === '80mm'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-200'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-extrabold">
                  <span>80 mm Standard POS</span>
                  {printerConfig.paperWidth === '80mm' && <CheckCircle2 className="h-4 w-4 text-teal-600" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Format supermarché, caisse principale, largeur 48 colonnes.
                </p>
              </button>

              <button
                type="button"
                onClick={() => updatePrinterConfig({ paperWidth: '58mm' })}
                className={`p-3 rounded-2xl border text-left transition ${
                  printerConfig.paperWidth === '58mm'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-200'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-extrabold">
                  <span>58 mm Portable / Mini</span>
                  {printerConfig.paperWidth === '58mm' && <CheckCircle2 className="h-4 w-4 text-teal-600" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Format ceinturon mobile, livreurs moto, largeur 32 colonnes.
                </p>
              </button>
            </div>
          </div>

          {/* Toggles: Auto-cut, Cash Drawer, Auto-print on checkout */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              {language === 'fr' ? '3. Automatismes de Caisse' : '3. POS Hardware Automations'}
            </label>

            {/* Auto-cut */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {language === 'fr' ? 'Découpe automatique du papier (Auto-Cut)' : 'Auto-cut Paper (ESC/POS GS V)'}
                </span>
                <p className="text-[10px] text-slate-400">
                  Commande de massicot automatique en fin de ticket.
                </p>
              </div>
              <input
                type="checkbox"
                checked={printerConfig.autoCut}
                onChange={e => updatePrinterConfig({ autoCut: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </div>

            {/* Cash Drawer Pulse */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {language === 'fr' ? 'Ouverture automatique tiroir-caisse (Kick Drawer)' : 'Kick Cash Drawer on Cash Sale'}
                </span>
                <p className="text-[10px] text-slate-400">
                  Impulsion électrique RJ11 24V lors d'un règlement en espèces.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestDrawer}
                  disabled={isDrawerTesting}
                  className="rounded-lg border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                  title="Test drawer pulse"
                >
                  {isDrawerTesting ? 'Test...' : 'Tester Tiroir'}
                </button>
                <input
                  type="checkbox"
                  checked={printerConfig.kickCashDrawer}
                  onChange={e => updatePrinterConfig({ kickCashDrawer: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Auto Print on Checkout */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {language === 'fr' ? 'Impression directe automatique à chaque vente' : 'Auto-Print on POS Checkout'}
                </span>
                <p className="text-[10px] text-slate-400">
                  Imprime le ticket dès confirmation sans boîte de dialogue additionnelle.
                </p>
              </div>
              <input
                type="checkbox"
                checked={printerConfig.autoPrintOnCheckout}
                onChange={e => updatePrinterConfig({ autoPrintOnCheckout: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Feedback banner */}
          {testResult && (
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs font-semibold text-teal-900 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
              <span>{testResult}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
          <button
            type="button"
            disabled={isTesting}
            onClick={handleRunTestPrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 shadow-xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Play className="h-3.5 w-3.5 text-teal-600" />
            <span>{isTesting ? 'Impression en cours...' : 'Imprimer Ticket Test'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrinterModalOpen(false)}
            className="rounded-xl bg-teal-600 px-5 py-2 font-extrabold text-white shadow-md hover:bg-teal-700 transition"
          >
            {language === 'fr' ? 'Appliquer & Fermer' : 'Save & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
