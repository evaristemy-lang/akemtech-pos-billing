import React, { useState } from 'react';
import {
  Smartphone,
  X,
  Copy,
  CheckCircle2,
  ExternalLink,
  Download,
  Sparkles,
  QrCode,
  ShieldCheck,
  Zap,
  Globe,
  Share2,
  Github,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, addNotification } = useApp();
  const { isInstallable, isInstalled, install, isAndroid } = usePWAInstall();
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = 'https://ais-pre-ubbqemfqzqihtbdgcvqv3c-324799706353.europe-west2.run.app';
  const githubRepoUrl = 'https://github.com/evaristemy-lang/akemtech-pos-billing';
  const githubActionsUrl = 'https://github.com/evaristemy-lang/akemtech-pos-billing/actions';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setIsCopied(true);
    addNotification({
      title: language === 'fr' ? 'Lien copié !' : 'Link copied!',
      message: language === 'fr'
        ? 'Ouvrez ce lien dans Google Chrome sur votre téléphone Android.'
        : 'Open this link in Google Chrome on your Android device.',
      type: 'success',
    });
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      addNotification({
        title: language === 'fr' ? 'Installation en cours' : 'Installing App',
        message: language === 'fr'
          ? 'L’application AkemTech POS est en cours d’installation sur votre appareil Android.'
          : 'AkemTech POS is being installed on your Android device.',
        type: 'success',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800 bg-emerald-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>{language === 'fr' ? 'Application Android (APK & WebAPK)' : 'Android Application (APK & WebAPK)'}</span>
                <span className="rounded bg-emerald-500/30 px-1.5 py-0.5 text-[10px] font-mono text-emerald-300">
                  Android
                </span>
              </h3>
              <p className="text-[11px] text-emerald-200/70">
                AkemTech POS & Billing • Installation Mobile Native
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-emerald-300 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Main Direct Android Install Action if browser supports beforeinstallprompt */}
          {isInstallable && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 dark:border-emerald-800 dark:bg-emerald-950/40 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                  {language === 'fr' ? 'Votre appareil est prêt pour l’installation !' : 'Your device is ready to install!'}
                </span>
              </div>
              <p className="text-emerald-800 dark:text-emerald-300 text-xs">
                {language === 'fr'
                  ? 'Cliquez ci-dessous pour installer l’application en 1 clic sur votre écran d’accueil comme une vraie application Android native.'
                  : 'Click below to install the app in 1 click on your home screen as a native Android app.'}
              </p>
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-md hover:bg-emerald-700 transition text-sm"
              >
                <Download className="h-4 w-4" />
                <span>{language === 'fr' ? 'Installer AkemTech POS sur Android' : 'Install AkemTech POS on Android'}</span>
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="rounded-xl border border-teal-300 bg-teal-50 p-3.5 text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
              <div>
                <p className="font-bold">{language === 'fr' ? 'Application Déjà Installée' : 'Application Already Installed'}</p>
                <p className="text-[11px] text-teal-700 dark:text-teal-400">
                  {language === 'fr'
                    ? 'AkemTech POS est déjà installée en mode natif autonome sur cet appareil.'
                    : 'AkemTech POS is running as an installed standalone app on this device.'}
                </p>
              </div>
            </div>
          )}

          {/* Option 1: Live Mobile URL */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white text-[10px]">1</span>
                {language === 'fr' ? 'Installer sur votre Smartphone / Tablette Android' : 'Install on your Android Phone / Tablet'}
              </span>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="flex items-center gap-1 font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400"
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{language === 'fr' ? 'Lien copié' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{language === 'fr' ? 'Copier le Lien' : 'Copy Link'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 block font-mono">Lien d’accès direct Android :</span>
              <a
                href={appUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono font-bold text-xs text-teal-700 dark:text-teal-300 hover:underline break-all mt-0.5 block"
              >
                {appUrl}
              </a>
            </div>

            {/* Steps Guide */}
            <div className="space-y-2 pt-1 text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {language === 'fr' ? 'Comment l’installer sur votre téléphone :' : 'How to install on your phone:'}
              </p>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] leading-relaxed">
                <li>
                  {language === 'fr'
                    ? 'Ouvrez ce lien dans le navigateur Google Chrome de votre téléphone Android.'
                    : 'Open this link in Google Chrome on your Android phone.'}
                </li>
                <li>
                  {language === 'fr'
                    ? 'Appuyez sur le menu (les 3 points verticaux ⋮ en haut à droite).'
                    : 'Tap the 3 vertical dots ⋮ in the top right corner of Chrome.'}
                </li>
                <li>
                  {language === 'fr'
                    ? 'Sélectionnez "Installer l’application" (ou "Ajouter à l’écran d’accueil").'
                    : 'Select "Install app" (or "Add to Home screen").'}
                </li>
                <li>
                  {language === 'fr'
                    ? 'Android génère et installe automatiquement l’APK natif officiel (WebAPK) avec icône sur l’écran d’accueil, plein écran sans barre d’adresse, et mode hors-ligne !'
                    : 'Android automatically mints and installs the official native WebAPK with full offline support and home screen icon!'}
                </li>
              </ol>
            </div>
          </div>

          {/* Option 2: Generate Standalone .APK Package from GitHub */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white text-[10px]">2</span>
                {language === 'fr' ? 'Générer le Fichier APK autonome (.apk)' : 'Generate Standalone APK File (.apk)'}
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                APK Builder
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {language === 'fr'
                ? 'Vous pouvez télécharger le fichier d’installation .apk autonome signé pour Android via les services officiels TWA ou GitHub Actions :'
                : 'Download standalone signed .apk file for Android via official TWA builders or GitHub Actions:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* PWABuilder 1-Click APK Generator */}
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50/60 p-3 hover:bg-teal-100 transition dark:border-teal-900 dark:bg-teal-950/40"
              >
                <div>
                  <span className="font-bold text-teal-900 dark:text-teal-200 block text-xs">
                    PWABuilder Android APK
                  </span>
                  <span className="text-[10px] text-teal-700 dark:text-teal-400">
                    Générer .apk en 1 clic
                  </span>
                </div>
                <ExternalLink className="h-4 w-4 text-teal-600" />
              </a>

              {/* GitHub Actions APK Pipeline */}
              <a
                href={githubActionsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-800"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-xs">
                    GitHub Actions APK
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Workflow de compilation
                  </span>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-500" />
              </a>
            </div>
          </div>

          {/* GitHub Repository Reference */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                  Dépôt GitHub du Projet
                </span>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  github.com/evaristemy-lang/akemtech-pos-billing
                </span>
              </div>
            </div>
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 transition"
            >
              <span>{language === 'fr' ? 'Voir sur GitHub' : 'View on GitHub'}</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{language === 'fr' ? 'Ouvrir l’application' : 'Open application'}</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{language === 'fr' ? 'Partager le lien' : 'Share link'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition"
            >
              {language === 'fr' ? 'Fermer' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
