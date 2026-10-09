import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  Building,
  DollarSign,
  Printer,
  FileText,
  Calendar,
  CheckCircle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatFCFA, formatDate, formatCameroonPhone } from '../../utils/formatters';
import { Employee } from '../../types';

export const EmployeesManager: React.FC = () => {
  const { employees, branches, addEmployee, organization, language } = useApp();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmpForPayslip, setSelectedEmpForPayslip] = useState<Employee | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+237 ');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('Ventes & Caisse');
  const [branchId, setBranchId] = useState(branches[0]?.id || 'branch-dla');
  const [salary, setSalary] = useState<number>(200000);
  const [cnpsNumber, setCnpsNumber] = useState('');

  const filteredEmployees = employees.filter(e => {
    return (
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalMonthlyPayroll = employees.reduce((sum, e) => sum + e.salary, 0);

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !position) return;

    addEmployee({
      name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@akemdistribution.cm`,
      position,
      department,
      branchId,
      salary,
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active',
      cnpsNumber: cnpsNumber || `CNPS-${Math.floor(100000 + Math.random() * 900000)}-CMR`,
    });

    setIsAddModalOpen(false);
    setName('');
    setPosition('');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.employeeTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'fr'
              ? 'Gestion des collaborateurs, masse salariale, cotisations CNPS et bulletins de paie'
              : 'Human resources directory, payroll calculations, and CNPS social security'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>{t.newEmployee}</span>
        </button>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">{t.totalStaff}</span>
          <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{employees.length} {language === 'fr' ? 'salariés' : 'staff'}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{language === 'fr' ? 'Toutes agences confondues' : 'All branches'}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">{t.monthlyPayroll}</span>
          <p className="mt-1 text-xl font-black text-teal-600 dark:text-teal-400">
            {formatFCFA(totalMonthlyPayroll, language)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{language === 'fr' ? 'Salaires de base bruts' : 'Gross basic salaries'}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">Cotisations CNPS Estimées</span>
          <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
            {formatFCFA(totalMonthlyPayroll * 0.084, language)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{language === 'fr' ? 'Part salariale + patronale' : 'Social security'}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'fr' ? 'Rechercher employé, poste, département...' : 'Search employee, position, department...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {filteredEmployees.length} {language === 'fr' ? 'employés trouvés' : 'employees'}
        </div>
      </div>

      {/* Employee List Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map(emp => {
          const branch = branches.find(b => b.id === emp.branchId);
          return (
            <div
              key={emp.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {emp.name}
                    </h4>
                    <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                      {emp.position}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Actif
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span>{emp.department} • {branch ? branch.city : 'Douala'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatCameroonPhone(emp.phone)}</span>
                  </div>
                  {emp.cnpsNumber && (
                    <div className="text-[10px] font-mono text-slate-400">
                      N° CNPS : {emp.cnpsNumber}
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{language === 'fr' ? 'Salaire de Base :' : 'Base Salary :'}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {formatFCFA(emp.salary, language)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                <span className="text-slate-400 text-[11px]">
                  Embauché : {formatDate(emp.hireDate, language)}
                </span>
                <button
                  onClick={() => setSelectedEmpForPayslip(emp)}
                  className="font-bold text-teal-600 hover:underline dark:text-teal-400"
                >
                  <FileText className="inline-block h-3.5 w-3.5 mr-1" />
                  {language === 'fr' ? 'Bulletin de Paie' : 'Payslip'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.newEmployee}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateEmployee} className="mt-4 space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Nom & Prénom</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alain Kamdem"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Poste / Fonction' : 'Position'}</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Caissière, Commercial..."
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Département</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Direction Générale">Direction Générale</option>
                    <option value="Finance & Comptabilité">Finance & Comptabilité</option>
                    <option value="Ventes & Caisse">Ventes & Caisse</option>
                    <option value="Entrepôt & Stocks">Entrepôt & Stocks</option>
                    <option value="Logistique & Livraison">Logistique & Livraison</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Téléphone (+237)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Agence</label>
                  <select
                    value={branchId}
                    onChange={e => setBranchId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Salaire Mensuel Brut' : 'Salary'}</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={e => setSalary(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">N° CNPS (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="CNPS-XXXXX"
                    value={cnpsNumber}
                    onChange={e => setCnpsNumber(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-teal-600 py-2.5 font-bold text-white shadow-md hover:bg-teal-700"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Cameroonian Payslip Modal */}
      {selectedEmpForPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <span className="font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Bulletin de Paie Officiel • Cameroun
              </span>
              <button onClick={() => setSelectedEmpForPayslip(null)} className="text-slate-400">✕</button>
            </div>

            <div className="mt-4 space-y-3 font-mono">
              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <h4 className="font-extrabold uppercase text-slate-900 dark:text-white">{organization.name}</h4>
                <p className="text-[10px] text-slate-500">RCCM: {organization.rccm} • NIU: {organization.niu}</p>
                <p className="text-[10px] text-slate-500">Période : Octobre 2026</p>
              </div>

              <div className="py-1 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employé :</span>
                  <span className="font-bold">{selectedEmpForPayslip.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fonction :</span>
                  <span>{selectedEmpForPayslip.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">N° CNPS :</span>
                  <span>{selectedEmpForPayslip.cnpsNumber}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1">
                <div className="flex justify-between">
                  <span>Salaire de base brut :</span>
                  <span className="font-bold">{formatFCFA(selectedEmpForPayslip.salary, language)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Cotisation CNPS Salarié (4.2%) :</span>
                  <span>-{formatFCFA(selectedEmpForPayslip.salary * 0.042, language)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Retenue IRPP / CAC Cameroun :</span>
                  <span>-{formatFCFA(selectedEmpForPayslip.salary * 0.05, language)}</span>
                </div>
              </div>

              <div className="flex justify-between font-extrabold text-sm text-teal-700 dark:text-teal-400 pt-1">
                <span>NET À PAYER :</span>
                <span>{formatFCFA(selectedEmpForPayslip.salary * 0.908, language)}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Imprimer</span>
              </button>
              <button
                onClick={() => setSelectedEmpForPayslip(null)}
                className="flex-1 rounded-xl bg-teal-600 py-2 font-bold text-white shadow-md hover:bg-teal-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
