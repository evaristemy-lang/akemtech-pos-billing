import React, { useState } from 'react';
import {
  Github,
  X,
  Copy,
  CheckCircle2,
  ExternalLink,
  Terminal,
  Download,
  Sparkles,
  GitBranch,
  Key,
  UploadCloud,
  Loader2,
  AlertCircle,
  FolderArchive,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GitHubPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPublishModal: React.FC<GitHubPublishModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, addNotification } = useApp();
  const [githubUsername, setGithubUsername] = useState('evaristemy');
  const [repoName, setRepoName] = useState('akemtech-pos-billing');
  const [personalAccessToken, setPersonalAccessToken] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushSuccess, setPushSuccess] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'publish' | 'commands' | 'download'>('publish');

  if (!isOpen) return null;

  const cleanUser = githubUsername.trim() || 'evaristemy';
  const cleanRepo = repoName.trim() || 'akemtech-pos-billing';
  const repoUrl = `https://github.com/${cleanUser}/${cleanRepo}`;

  const gitCommands = [
    `# 1. Se positionner dans le projet (déjà prêt avec la branche main)`,
    `git branch -M main`,
    ``,
    `# 2. Lier votre dépôt distant GitHub`,
    `git remote add origin ${repoUrl}.git`,
    ``,
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

  const handleDirectPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalAccessToken.trim()) {
      setPushError(
        language === 'fr'
          ? 'Veuillez saisir votre Personal Access Token GitHub (Classic ou Fine-grained avec permissions repo).'
          : 'Please enter your GitHub Personal Access Token (with repo scope).'
      );
      return;
    }

    setIsPushing(true);
    setPushError(null);
    setPushSuccess(null);

    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubUsername: cleanUser,
          repoName: cleanRepo,
          token: personalAccessToken.trim(),
          isPrivate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erreur lors de la publication');
      }

      setPushSuccess(data.repoUrl || repoUrl);
      addNotification({
        title: language === 'fr' ? 'Publication réussie !' : 'Published Successfully!',
        message: language === 'fr'
          ? `L'application a été publiée avec succès sur ${data.repoUrl || repoUrl}`
          : `Code successfully pushed to ${data.repoUrl || repoUrl}`,
        type: 'success',
      });
    } catch (err: any) {
      setPushError(err.message || 'Échec du déploiement GitHub.');
    } finally {
      setIsPushing(false);
    }
  };

  const handleDownloadArchive = () => {
    addNotification({
      title: language === 'fr' ? 'Téléchargement' : 'Download',
      message: language === 'fr'
        ? 'Génération de l’archive de code source...'
        : 'Generating source code archive...',
      type: 'info',
    });
    window.location.href = '/api/export/archive';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>{language === 'fr' ? 'Publier sur GitHub' : 'Publish to GitHub'}</span>
                <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[10px] font-mono text-teal-300 border border-teal-500/30">
                  v2.0
                </span>
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900/60 text-xs">
          <button
            onClick={() => setActiveTab('publish')}
            className={`flex items-center gap-1.5 py-3 px-3 font-bold border-b-2 transition ${
              activeTab === 'publish'
                ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>{language === 'fr' ? 'Publication Directe (1-Clic)' : 'Direct Push (1-Click)'}</span>
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`flex items-center gap-1.5 py-3 px-3 font-bold border-b-2 transition ${
              activeTab === 'commands'
                ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>{language === 'fr' ? 'Ligne de Commande Git' : 'Git Terminal'}</span>
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`flex items-center gap-1.5 py-3 px-3 font-bold border-b-2 transition ${
              activeTab === 'download'
                ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <FolderArchive className="h-3.5 w-3.5" />
            <span>{language === 'fr' ? 'Archive Code Source' : 'Source Archive'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Target GitHub Repository URL preview banner */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3 dark:border-teal-900/60 dark:bg-teal-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-800 dark:text-teal-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {language === 'fr' ? 'Votre Lien Dépôt GitHub :' : 'Your GitHub Repository Link:'}
              </span>
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="block font-mono font-bold text-xs text-teal-800 dark:text-teal-300 hover:underline break-all mt-0.5"
              >
                {repoUrl}
              </a>
            </div>
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition shrink-0 self-start sm:self-auto shadow-xs"
            >
              <span>{language === 'fr' ? 'Visiter GitHub' : 'Visit GitHub'}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* TAB 1: Direct 1-Click Push via Personal Access Token */}
          {activeTab === 'publish' && (
            <div className="space-y-4">
              {pushSuccess && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>{language === 'fr' ? 'Code déployé avec succès sur GitHub !' : 'Code successfully pushed to GitHub!'}</span>
                  </div>
                  <p className="text-xs">
                    {language === 'fr'
                      ? 'Votre dépôt est à jour avec tous les correctifs de sélection produit et moteur d’impression.'
                      : 'Your repository is up-to-date with all product selection fixes and printer engines.'}
                  </p>
                  <a
                    href={pushSuccess}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
                  >
                    <span>{language === 'fr' ? 'Ouvrir mon Dépôt GitHub' : 'Open my GitHub Repo'}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {pushError && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{language === 'fr' ? 'Erreur de publication :' : 'Publish Error:'}</span>
                    <p className="mt-0.5">{pushError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleDirectPush} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      {language === 'fr' ? 'Nom d’Utilisateur GitHub' : 'GitHub Username'}
                    </label>
                    <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                      <span className="text-slate-400 font-mono">github.com/</span>
                      <input
                        type="text"
                        value={githubUsername}
                        onChange={e => setGithubUsername(e.target.value)}
                        placeholder="evaristemy"
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

                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-teal-600" />
                      <span>{language === 'fr' ? 'GitHub Personal Access Token (PAT)' : 'GitHub Personal Access Token'}</span>
                    </label>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo&description=AkemTech+POS+Sync"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-teal-600 hover:underline dark:text-teal-400 flex items-center gap-0.5"
                    >
                      <span>{language === 'fr' ? 'Créer un token (1 clic)' : 'Generate token (1 click)'}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={personalAccessToken}
                    onChange={e => setPersonalAccessToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (requis pour publication automatique)"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    {language === 'fr'
                      ? 'Le token permet de créer le dépôt sur votre GitHub et de pousser le code sans ouvrir le terminal.'
                      : 'The token allows creating the repo and pushing code without terminal commands.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrivateCheckbox"
                    checked={isPrivate}
                    onChange={e => setIsPrivate(e.target.checked)}
                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="isPrivateCheckbox" className="font-medium text-slate-700 dark:text-slate-300">
                    {language === 'fr' ? 'Créer comme dépôt Privé (Private)' : 'Create as Private repository'}
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPushing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-bold text-white shadow-md hover:bg-teal-700 disabled:opacity-50 transition text-sm"
                  >
                    {isPushing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{language === 'fr' ? 'Création et envoi vers GitHub en cours...' : 'Creating & pushing to GitHub...'}</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4" />
                        <span>{language === 'fr' ? 'Publier sur Mon GitHub' : 'Publish to My GitHub'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Git Terminal Commands */}
          {activeTab === 'commands' && (
            <div className="space-y-3.5">
              <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {language === 'fr' ? '1. Créer le dépôt sur GitHub (si non existant)' : '1. Create empty repository on GitHub'}
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
                    ? `Nom recommandé : "${cleanRepo}". Laissez README décoché car le projet contient déjà toute la documentation.`
                    : `Recommended name: "${cleanRepo}". Leave README unchecked as project is fully documented.`}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-teal-600" />
                    <span>{language === 'fr' ? '2. Commandes Terminal à exécuter' : '2. Terminal Commands'}</span>
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
                        <span>{language === 'fr' ? 'Copier les Commandes' : 'Copy Commands'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative rounded-xl bg-slate-950 p-3.5 font-mono text-[11px] text-teal-400 border border-slate-800">
                  <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {gitCommands}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Download Complete Archive */}
          {activeTab === 'download' && (
            <div className="space-y-3.5">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center gap-2">
                  <FolderArchive className="h-5 w-5 text-teal-600" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {language === 'fr' ? 'Télécharger Tout le Projet (.tar.gz)' : 'Download Full Code Archive (.tar.gz)'}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs">
                  {language === 'fr'
                    ? 'Téléchargez une archive complète et propre contenant l’intégralité du code source (React 19, TypeScript, Express, Tailwind CSS, Composants POS & Billing, Documentation).'
                    : 'Download a clean, complete archive of the entire source code (React 19, TypeScript, Express, Tailwind CSS, POS & Billing components, Documentation).'}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadArchive}
                    className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 font-bold text-white shadow-md hover:bg-teal-700 transition"
                  >
                    <Download className="h-4 w-4" />
                    <span>{language === 'fr' ? 'Télécharger l’Archive akemtech-pos-billing-v2.tar.gz' : 'Download akemtech-pos-billing-v2.tar.gz'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Git Branch & Ready Status */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800 flex items-start gap-2.5">
            <GitBranch className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {language === 'fr' ? 'Dépôt Git Local Initialisé et Prêt' : 'Local Git Repo Initialized & Ready'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'fr'
                  ? 'Branche principale : main • Commit : v2.0 (Correctifs de sélection produits, Moteur d’impression ESC/POS multi-périphériques, Assistant Akem AI).'
                  : 'Main branch : main • Commit : v2.0 (Product selection fixes, Multi-device ESC/POS print engine, Akem AI assistant).'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={handleDownloadArchive}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{language === 'fr' ? 'Archive ZIP / Tar' : 'ZIP Archive'}</span>
          </button>

          <div className="flex items-center gap-2">
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
    </div>
  );
};
