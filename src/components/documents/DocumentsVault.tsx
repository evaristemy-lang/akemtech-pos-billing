import React, { useState } from 'react';
import { FolderArchive, FileText, Download, Upload, ShieldCheck, Eye, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatDate } from '../../utils/formatters';

export const DocumentsVault: React.FC = () => {
  const { documents, organization, language, addNotification } = useApp();
  const t = translations[language];

  const [selectedCat, setSelectedCat] = useState('all');

  const filteredDocs = selectedCat === 'all' ? documents : documents.filter(d => d.category === selectedCat);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.documents} & Conformité Fiscale
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'fr'
              ? 'Archivage sécurisé des pièces officielles (RCCM, Attestation Non-Redevance, Contrats, Baux)'
              : 'Secure document storage for legal papers, tax compliance, and commercial contracts'}
          </p>
        </div>

        <button
          onClick={() =>
            addNotification({
              title: language === 'fr' ? 'Téléversement' : 'Document Upload',
              message: language === 'fr'
                ? 'Sélectionnez un fichier PDF ou image à téléverser dans le coffre-fort AkemTech.'
                : 'Select a PDF or image file to upload into the AkemTech vault.',
              type: 'info',
            })
          }
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition"
        >
          <Upload className="h-4 w-4" />
          <span>{language === 'fr' ? 'Téléverser un Document' : 'Upload Document'}</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: language === 'fr' ? 'Tous les documents' : 'All Docs' },
          { id: 'tax_compliance', label: language === 'fr' ? 'Fiscalité & RCCM' : 'Tax & RCCM' },
          { id: 'contracts', label: language === 'fr' ? 'Contrats & Baux' : 'Contracts' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              selectedCat === cat.id
                ? 'bg-slate-900 text-white dark:bg-teal-600'
                : 'bg-white text-slate-700 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-xs"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {doc.fileSize}
                </span>
              </div>

              <h4 className="font-extrabold text-slate-900 dark:text-white mt-3 text-sm">
                {doc.title}
              </h4>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">{doc.fileName}</p>

              {doc.reference && (
                <div className="mt-2 rounded-lg bg-slate-50 p-2 font-mono text-[10px] text-teal-800 dark:bg-slate-800 dark:text-teal-300">
                  Réf: {doc.reference}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">
                {formatDate(doc.uploadedAt, language)}
              </span>
              <button
                onClick={() =>
                  addNotification({
                    title: language === 'fr' ? 'Téléchargement' : 'Download',
                    message: language === 'fr'
                      ? `Téléchargement de ${doc.fileName} en cours...`
                      : `Downloading ${doc.fileName}...`,
                    type: 'success',
                  })
                }
                className="font-bold text-teal-600 hover:underline dark:text-teal-400"
              >
                <Download className="inline-block h-3.5 w-3.5 mr-1" />
                {language === 'fr' ? 'Télécharger' : 'Download'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
