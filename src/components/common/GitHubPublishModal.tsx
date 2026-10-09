import React, { useState } from 'react';
import {
  Github,
  X,
  Copy,
  CheckCircle2,
  ExternalLink,
  Code2,
  Terminal,
  Download,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GitHubPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPublishModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { language, addNotification } = useApp();
  const [githubUsername, setGithubUsername] = useState('akemtech');
  const [repoName, setRepoName] = useState('akemtech-pos-billing');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const repoUrl = `https://github.com/${githubUsername.trim() || 'username'}/${repoName.trim() || 'akemtech-pos-billing'}`;
  const gitCommands = [
    `# 1. Ajouter le remote GitHub`,
    `git remote add origin ${repoUrl}.git`,
    `# 2. Définir la branche principale`,
    `git branch -M main`,
    `# 3. Pousser tout le code vers GitHub`,
    `git push -u origin main`,
  ].join('\n');

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setIsCopied(true);
    addNotification({
      title: language === 'fr' ? 'Commandes copiées' : 'Commands copied',
      message: language === 'fr'
        ? 'Les commandes Git de publication ont été copiées dans votre presse-papier.'
        : 'Git publishing commands copied to clipboard.',
      type: 'success',
    });
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                {language === 'fr' ? 'Publier sur GitHub' : 'Publish to GitHub'}
              </h3>
              <p className="text-[11px] text-slate-400">
                AkemTech POS & Billing • Dépôt Git & Déploiement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Quick Step 1: Create repository on GitHub */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white text-[10px]">1</span>
                {language === 'fr' ? 'Créer le dépôt vide sur GitHub' : 'Create new repo on GitHub'}
              </span>
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-bold text-teal-600 hover:underline dark:text-teal-400"
              >
                <span>github.com/new</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'fr'
                ? 'Créez un dépôt sur votre compte GitHub (public ou privé). Laissez les options README et .gitignore décochées.'
                : 'Create a new repository on your GitHub account (leave README and .gitignore unchecked).'}
            </p>
          </div>

          {/* Form: Username and Repo Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'fr' ? 'Votre Nom d’Utilisateur GitHub' : 'Your GitHub Username'}
              </label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <span className="text-slate-400 font-mono">github.com/</span>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={e => setGithubUsername(e.target.value)}
                  placeholder="votre-nom"
                  className="w-full bg-transparent font-bold text-slate-900 outline-none dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {language === 'fr' ? 'Nom du Dépôt' : 'Repository Name'}
              </label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <input
                  type="text"
                  value={repoName}
                  onChange={e => setRepoName(e.target.value)}
                  placeholder="akemtech-pos-billing"
                  className="w-full bg-transparent font-bold text-slate-900 outline-none dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Target Link Box */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 dark:border-teal-900/60 dark:bg-teal-950/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-800 dark:text-teal-400">
                {language === 'fr' ? 'Lien de votre Dépôt GitHub :' : 'Your GitHub Repository Link:'}
              </span>
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="block font-mono font-bold text-xs text-teal-700 dark:text-teal-300 hover:underline break-all"
              >
                {repoUrl}
              </a>
            </div>
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-teal-700 shrink-0 ml-2"
            >
              <span>{language === 'fr' ? 'Ouvrir' : 'Open'}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Step 2: One-click copy commands */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white text-[10px]">2</span>
                {language === 'fr' ? 'Commandes de Synchronisation & Push' : 'Sync & Push Commands'}
              </span>
              <button
                type="button"
                onClick={handleCopyCommands}
                className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400"
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{language === 'fr' ? 'Copié !' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{language === 'fr' ? 'Copier Tout' : 'Copy All'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-teal-400 border border-slate-800">
              <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {gitCommands}
              </pre>
            </div>
          </div>

          {/* Status info */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800 flex items-start gap-2.5">
            <GitBranch className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {language === 'fr' ? 'Dépôt Git local prêt et initialisé' : 'Local Git repo ready & initialized'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'fr'
                  ? 'Le code complet avec README.md, configuration d’imprimante universelle et correctifs de sélection produit est prêt sur la branche main.'
                  : 'Full codebase with README.md, universal printer config and product fixes is ready on branch main.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            {language === 'fr' ? 'Fermer' : 'Close'}
          </button>
          <button
            type="button"
            onClick={handleCopyCommands}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>{language === 'fr' ? 'Copier les Commandes' : 'Copy Commands'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
